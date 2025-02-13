---
post: true
title: "Testing Super Mario Bros. Using a Behavior Model"
description: An article about testing Super Mario game using a behavior model. 
date: 2025-02-07
author: Vitaliy Zakaznikov
image: images/testing-super-mario-using-a-behavior-model.png
icon: fas fa-glasses pt-5 pb-5
---

The classic game [*Super Mario Bros.*](https://en.wikipedia.org/wiki/Super_Mario_Bros.) has long been a favorite among players, providing not only fun gameplay but also serving as a reference system for testing and analysis. In a recent blog post, [Antithesis](https://antithesis.com/blog/sdtalk/) demonstrated how, with the help of their deterministic hypervisor, their system can autonomously play *Super Mario Bros.* to explore its vast state space. While this approach is powerful for uncovering unexpected states, it does not address the challenge of testing correctness of the game’s complex behavior.  

In this article, we'll tackle this challenge and present a solution that complements any state space exploration techniques. We will define and apply a **behavior model** to systematically test whether *Super Mario Bros.* behaves as expected in all explored states. Our behavior model will capture the game’s intended mechanics—such as movement, collision detection, and enemy interactions—and serve as a framework for testing the correctness of its implementation. By applying a behavior model, we can ensure that *Super Mario Bros.* not only runs and allows players to reach the winning state, but also behaves **as it should** in all states.<!-- more -->  

A key advantage of this approach is that the model itself can be built incrementally, allowing it to be as simple or as comprehensive as needed. Once constructed, the model is **universal**—while its most advanced applications involve integration with autonomous state space exploration techniques, it can also be effectively used for manual and semi-automated test implementations.  

Let’s dive in and see how a behavior model provides a structured, rigorous approach to testing the behavior of *Super Mario Bros.*!

## Setting up the Super Mario test project

To write a behavior model, we need a reference implementation of the game. Fortunately, there is an open-source Python implementation of *Super Mario Bros.* available on GitHub: [PythonSuperMario](https://github.com/marblexu/PythonSuperMario). This project includes two playable levels. For our test project, we'll use a specific version of the repository, checking out commit [f34087e4cc47f6cc70b46ced758b1070e64c4dc2](https://github.com/marblexu/PythonSuperMario/commit/f34087e4cc47f6cc70b46ced758b1070e64c4dc2).

Clone the repository and checkout the commit using:

```bash
git clone https://github.com/marblexu/PythonSuperMario && cd PythonSuperMario && git checkout f34087e4cc47f6cc70b46ced758b1070e64c4dc2
```

### Environment setup

We’ll run and test the game in the following environment:

- **Operating System:** Ubuntu 22.04.5 LTS
- **Python Version:** 3.10.12

Additionally, we'll use the following Python dependencies, which we’ll define in `requirements.txt`:

```text
testflows==2.4.19
pygame==2.6.1
```

To install the dependencies, run:

```bash
pip3 install -r requirements.txt
```

### Playing the game manually

At this point, the project folder should look like this:

```bash
main.py  README.md  requirements.txt  resources  source
```

The `main.py` file serves as the entry point for the game. Before diving into testing, let's have fun and take a moment to **play the game manually** to get familiar with its mechanics.

#### **Game Controls:**
- **Arrow Keys (`←`/`→`/`↓`)** – Move the player  
- **`a` key** – Jump  
- **`s` key** – Shoot fireballs or run  

Run the game with:

```bash
python3 main.py
```

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-1.gif">
<div class="text-secondary text-bold"><br>Super Mario: Playing the game manually</div>
</div><br>

## Understanding the game architecture

Before we can integrate *PythonSuperMario* for testing, we need a basic understanding of its architecture. The game's execution starts in [source/main.py](https://github.com/marblexu/PythonSuperMario/blob/master/source/main.py), where the [main()](https://github.com/marblexu/PythonSuperMario/blob/master/source/main.py#L8) function initializes the game structure:

```python
def main():
    game = tools.Control()
    state_dict = {c.MAIN_MENU: main_menu.Menu(),
                  c.LOAD_SCREEN: load_screen.LoadScreen(),
                  c.LEVEL: level.Level(),
                  c.GAME_OVER: load_screen.GameOver(),
                  c.TIME_OUT: load_screen.TimeOut()}
    game.setup_states(state_dict, c.MAIN_MENU)
    game.main()
```

### Game as a state machine

The game is implemented as an explicit **state-driven system**, where different **states** represent major phases of execution. These include:

- **[MAIN_MENU](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/main_menu.py#L9)** – The game's main menu.
- **[LOAD_SCREEN](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/load_screen.py#L7)** – The load screen.
- **[LEVEL](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/level.py#L11)** – The active gameplay state where the player interacts with the game world.
- **[GAME_OVER](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/load_screen.py#L39)** – The state when the player loses all lives.
- **[TIME_OUT](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/load_screen.py#L50)** – The state when the level timer runs out (a type of load screen).

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-2.png">
<div class="text-secondary text-bold"><br>Super Mario: State Classes</div>
</div><br>


Each of these is a subclass of the [State class](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L15), which implements the state machine architecture. The transitions between states are managed using the [`next` attribute](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L20), which determines the upcoming game state.

### The actual game states

However, these states are actually not states but represent clusters of **states**, each of which contains its own **actual states**. These **actual states** are defined by the specific values of the attributes of these `State` classes. You can think of them like shown in the following diagram. However, the transition edges between states are relative. In the real system, we don't really know which transitions are possible. Some of these transitions might be a bug!

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-3.png">
<div class="text-secondary text-bold"><br>Super Mario: Clusters of States (transition lines are random)</div>
</div><br>

#### The MAIN_MENU state class

For example, the **[MAIN_MENU](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/main_menu.py#L9)** `State class` defines many states, determined by its attributes, such as:

- **`persist`** – Stores persistent game information that is [passed between states](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L62) during transitions. It contains:
  - `COIN_TOTAL`, `SCORE`, `LIVES`, `TOP_SCORE`, `CURRENT_TIME`, `LEVEL_NUM`, `PLAYER_NAME`
- **`game_info`** – Holds the current game's information (set equal to `persist`).
- **`overhead_info`** – Manages the display of overhead game information, initialized as an instance of the `Info` class with `game_info` and `MAIN_MENU` as parameters.
- **`viewport`** – Manages the visible portion of the game world in the main menu.
- **`background`** – Handles the background setup for the main menu; initialized in the `setup_background()` method.
- **`player_list` and `player_index`** – Represent the selectable player characters in the main menu; initialized in the `setup_player()` method.
- **`cursor`** – Manages the menu selection cursor; initialized in the `setup_cursor()` method.

These attributes are primarily initialized in the [`startup()` method](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/main_menu.py#L21), which is called when the `Menu` class is instantiated.

A crucial detail to note is that **the game does not have just five states**! In reality, the number of possible states is far greater because each `State` class has multiple attributes whose values define distinct actual states. 

> Don't be misled by the class name `State`, which can create confusion—it does not represent a singular game state but rather a structure that implements multiple possible states through its attributes.

Understanding this distinction is key to bridging the gap between the code and the state machine representation of the system under test. Effective testing relies on exploring as many states and transitions of this state machine as possible to ensure comprehensive coverage.


#### The LEVEL state class

The **MAIN_MENU** `State class` has a lot of attributes, but as expected the **[LEVEL](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/level.py#L11)** `State class` that implements the actual
gameplay is even more complex as can be judged by its [startup() method](https://github.com/marblexu/PythonSuperMario/blob/master/source/states/level.py#L16) which initializes this class and sets the attributes that implements possible state that this class implements.

```python
 def startup(self, current_time, persist):
    self.game_info = persist
    self.persist = self.game_info
    self.game_info[c.CURRENT_TIME] = current_time
    self.death_timer = 0
    self.castle_timer = 0
    
    self.moving_score_list = []
    self.overhead_info = info.Info(self.game_info, c.LEVEL)
    self.load_map()
    self.setup_background()
    self.setup_maps()
    self.ground_group = self.setup_collide(c.MAP_GROUND)
    self.step_group = self.setup_collide(c.MAP_STEP)
    self.setup_pipe()
    self.setup_slider()
    self.setup_static_coin()
    self.setup_brick_and_box()
    self.setup_player()
    self.setup_enemies()
    self.setup_checkpoints()
    self.setup_flagpole()
    self.setup_sprite_groups()
```

Here's a brief overview of its key functions:

* **Initialize Game Information**: It assigns the `persist` dictionary to both `self.game_info` and `self.persist`, ensuring that persistent game data is maintained and can be passed across states.

* **Reset Timers**: Adds and initializes `death_timer` and `castle_timer` to `0`, preparing these timers for the level.

* **Initialize Overhead Display Information**: Sets up the overhead display information for the level.

* **Load Level Assets**: It calls several setup methods to load and initialize various level components, including:

    * `load_map()`: Loads the level map data.
    * `setup_background()`: Prepares the background graphics.
    * `setup_maps()`: Configures additional map settings.
    * `setup_collide()`: Sets up collision detection for ground and steps.
    * `setup_pipe()`: Initializes pipes within the level.
    * `setup_slider()`: Sets up sliding platforms or elements.
    * `setup_static_coin()`: Places static coins in the level.
    * `setup_brick_and_box()`: Configures bricks and boxes.
    * `setup_player()`: Initializes the player character.
    * `setup_enemies()`: Spawns enemies in the level.
    * `setup_checkpoints()`: Establishes checkpoints for progress tracking.
    * `setup_flagpole()`: Sets up the flagpole at the end of the level.
    * `setup_sprite_groups()`: Organizes sprites into groups for efficient management. Where a **sprite** is a 2D image or animation used in video games to represent characters, objects, and other visual elements. 

By executing these steps, the startup method ensures that all necessary components and settings are properly initialized defining the initial state, allowing the level to function correctly within the game.
The large number of possible states allowed by the **LEVEL** `State class` is what makes testing
the game a challenge. Nonetheless, the state-driven architecture of the game is clearly evident. 

The game's state-driven code architecture is well-aligned with **behavior model-based testing**, where **behavior** is defined as a sequence of states. Our model will compute the expected values in the **current state** based on the sequence of **previous states** (the system’s history). By leveraging this structure, we can systematically validate that the game behaves as intended as the game transitions between states.

> Note that state machine representation applies in general to any software even when the implementation
is not explicitly defined using state-driven code.

### The game loop and state transitions

The transition of game states is handled by the [`Control` class](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L35), which defines the frames per second (FPS) — the theoretical [frequency](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L78) at which the game loop executes.

The [game loop](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L73) itself is very simple as shown below:

```python
    def main(self):
        while not self.done:
            self.event_loop()
            self.update()
            pg.display.update()
            self.clock.tick(self.fps)
```

The game loop operates in discrete time steps, where each tick of the clock produces a new frame. The FPS value determines the number of frames generated per second, with each frame representing the game's state at a specific point in time. While the game might appear to run continuously, it is actually discrete, advancing in small, well-defined steps. Here is a graphical representation of the loop’s actions along with their descriptions:

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-4.png">
<div class="text-secondary text-bold"><br>Super Mario: Game Loop</div>
</div><br>

This is crucial for testing because the game’s behavior at any moment is fully determined by the current frame state. Therefore, testing must account for the fact that all animations, inputs, and events are processed frame-by-frame, and a **behavior model** must accurately observe and validate the correctness of the state for each frame.

## Wiring up test actions