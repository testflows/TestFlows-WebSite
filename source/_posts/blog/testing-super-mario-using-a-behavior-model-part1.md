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

Now, having good understanding of the underlying game code architecture,
we are ready to wire up test actions that we'll enable us to test the game.
Let's compile a list of actions that we need for testing!

### Starting and stopping the game

For obvious reasons the first test action is to be able to start and stop the game.
When we start the game, we also want to be able to wait for the game
to be ready to play which means that we want to pass the `MAIN_MENU` states and
enter the first `LEVEL` state. It also makes sense to always cleanly
stop the game using `pygame.quit()` call, so we'll define this action as
a [Given with yield](https://testflows.com/handbook/#Given-With-yield) step that supports combining setup and clean up in one step.  

Most of the code to implement this action will be similar to the game's [main() function found in source/main.py](https://github.com/marblexu/PythonSuperMario/blob/master/source/main.py#L8). We'll just add `yield`ing the game's object, clean up using `pygame.quit()` call and call to `wait_ready(game)` to enter playable state with the default Mario player selected. The stubs for the `start()` and `wait_ready()` actions will be the following: 

```python
@TestStep(When)
def wait_ready(self, game, seconds=3):
    """Wait for game to be loaded and ready."""
    pass

@TestStep(Given)
def start(self, ready=True):
    """Start the game and wait for it to be ready."""
    pass
```

### Controlling the game

When we actually try implementing the above actions, we'll quickly come to a realization that the default game's [**`Control` class**](https://github.com/marblexu/PythonSuperMario/blob/master/source/tools.py#L35) will need to be modified to allow testing the game
at frame by frame level. This is because we need the ability to do the following:

- Control and capture **frame-by-frame game states**, advancing and storing states for validation.
- Manage **keypress events**, allowing programmatic as well as manual control of the player.
- Detect **objects** visible on the screen as well as overlay custom graphics for easy debugging.

We'll accomplish this using the custom **`Control` class** that will use the original class as the base, and create the new **`Vision` class** (from `vision.py`) to handle graphical object detection and overlaying on the screen.

Here is shortened version of custom **`Control` class** `__init__` method that adds extra attributes:

- **`fps`** ability to set custom frame rate
- **`keys`** set to our custom **`Keys` class** to store and look up pressed keys
- **`vision`** instance of the **`Vision` class** to detect objects draw on the screen
- **`behavior`** list of frame states, previous and current, that tests and **behavior model** can use
- **`play`** handle to the generator function that allows to control game advancement at the frame level
- **`manual`** flag to enable manual game play inside a test that we'll use to allow manual testing of the **behavior model**

```python
class Control(tools.Control):
    def __init__(self, fps=60, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fps = fps
        self.keys = Keys()
        self.vision = Vision(self)
        self.behavior = []
        self.play = None
        self.manual = False
```

The other important part is the customized **`main()` method**
that is converted to a generator to control the game loop and
advance it step by step using the **[next](https://docs.python.org/3/library/functions.html#next)** function applied
to the **`play`** attribute that stores the generator object.
Therefore, **`next(game.play)`** will allow us move the game to the next frame.
It also calls the **`Vision` class** instance's **`detect()` method** to detect
currently visible game objects as well as creates and appends the new **`BehaviorState`** to the **`behavior` list** to store previous
and current frame states. 

```python
    def main(self):
        """Main game loop."""
        def _main():
            while not self.done:
                self.event_loop()
                self.update()
                self.vision.detect()
                self.behavior.append(
                    BehaviorState(self.keys, self.vision.boxes, self.vision.viewport)
                )
                yield self
                pg.display.update()
                self.clock.tick(self.fps)
        self.play = _main()
```

The above **`Control` class** allows us to implement the **`play()` action** below
where we can advance the game either by specifying time in seconds
or the number of frames.

```python
def play(game, seconds=1, frames=None):
    """Play the game for the specified number seconds or frames."""
    if frames is None:
        frames = seconds * game.fps

    for i in range(frames):
        next(game.play)
```

### Detecting game objects and drawing boxes around them

Ability to detect game objects and their positions is critical to game testing. To make games interesting they have quite a variety of them and *Super Mario Bros.* is no exception. We've already seen that in the **`Control` class** we've added **`vision` attribute** set to an instance of the **`Vision` class**. The **`Vision` class** is exactly what implements object detection as well as ability to draw on a screen that can be used in debugging our tests. 

Here is the **`__init__` method** of the class: 

```python
class Vision:
    """Gave vision."""
    def __init__(self, game):
        self.game = game
        self.boxes = {}
        self.viewport = pg.Rect(0, 0, 0, 0)
```

It only has three attributes:

- **`game`** - a handle to the game's **`Control` object** (used for convenience)
- **`boxes`** - stores the detected game objects. It is called *boxes* because the bounds of each object in the game is defined by a rectangular box or specifically **[pygame.Rect](https://www.pygame.org/docs/ref/rect.html)** object which defines the position of the object in the game.
- **`viewport`** - stores an object that defines the chunk of the game level that can be currently seen on the screen

The method that is responsible for object detects is called the **`detect()`**.

```python
   def detect(self):
        """Detect visible game elements."""
        self.boxes = self.get_visible()
        if self.boxes:
            self.viewport = self.game.state.viewport
        return self
```

It is very simple as the heavy lifting is done in the **`get_visible()` method**
which returns a list of visible elements in the current viewport. If any object
was detected then the **`viewport`** attribute is set to the current viewport.

In order to obtain the list of visible objects, the **`get_visible()` method**
introspects the **`self.game.state`** and pull out any attribute
that is of **[pygame.sprite.Sprite](https://www.pygame.org/docs/ref/sprite.html#pygame.sprite.Sprite)** or **[pygame.sprite.Group](https://www.pygame.org/docs/ref/sprite.html#pygame.sprite.Group)** type. Where in PyGame, the **sprite.Sprite** is used for visible game objects and **sprite.Group** is used for holding and managing a group of Sprite objects.

The detected objects are saved in **`boxes`** attribute of the **`BehaviorState` objects** which are added to the **`game.behavior` attribute** which holds a list of them.

All this machinery is used to implement the **`get_elements`** and **`get_element`**
actions. 

```python
def get_elements(game, name, frame=-1):
    """Get elements by name in the specified frame, default: -1 (current frame)."""
    return game.behavior[frame].boxes[name]
```

```python
def get_element(game, name, frame=-1):
    """Get element by name in the specified frame, default: -1 (current frame)."""
    return get_elements(game, name, frame)[0]
```

For easier visual debugging, the **`Vision` class** also provides the **`overlay()` method** that can be used to draw boxes around elements. For example,
we can draw a colored box around Mario to visually mark its detected position in the test. The **`overlay`** action then just provides a convenient wrapper
around calling this method.

```python
def overlay(game, elements, color=Vision.color["red"]):
    """Overlay boxes around elements on the screen."""
    game.vision.overlay(boxes=[element.box for element in elements], color=color)
```


### Simulating keypresses

The last set of actions are for controlling keypresses supported by the game.
A single key press consists of posting `KEYDOWN` and `KEYUP` events.
We also need the ability to keep the key down for some period of time and
therefore the low-level **`simulate_keypress`** is implemented as context manager. 

```python
@contextmanager
def simulate_keypress(key):
    """Simulate a key press and release event for the given key."""
    pg.event.post(pg.event.Event(pg.KEYDOWN, key=key))
    yield
    pg.event.post(pg.event.Event(pg.KEYUP, key=key))
```

Using the **`simulate_keypress`** low-level action we can implement all necessary
player actions such as pressing:

- **Enter** key (activate selection like when selecting a player type)

  ```python
  def press_enter():
     """Press the enter key."""
     return simulate_keypress(key=keys["enter"])
  ```

- **`→` (right)** key (move right)

  ```python
  def press_right():
      """Press the right arrow key."""
      return simulate_keypress(key=keys["right"])
  ```

- **`←` (left)** key (move left)

  ```python
  def press_left():
      """Press the left arrow key."""
      return simulate_keypress(key=keys["left"])
  ```

- **`↓` (down)** key (move down like when entering a pipe)

  ```python
  def press_down():
      """Press the down arrow key."""
      return simulate_keypress(key=keys["down"])
  ```

- **`a` (up)** key (short or, if pressed continously, long jump)

  ```python
  def press_jump():
      """Press the jump key."""
      return simulate_keypress(key=keys["jump"])
  ```

- **`s` (action)** key - (perform an action like running or throwing a fireball)

  ```python
  def press_action():
      """Press the action key."""
      return simulate_keypress(keys["action"])
  ```


## Checking basic movements using classical auto tests

With all these test actions in hand we are ready to start testing.
First, we can write a few simple classic tests and then off we go to developing
a **behavior model** that we can use with manual, semi-automated, or any sort of automated testing.

### Moving right test

Alright, let’s kick things off with a simple but essential test: checking if Mario — called the **`player`** element in the game — actually moves **right** when we press the right key. Because let’s be honest, if Mario can’t move right, "Houston we got a problem"!

Here is our simple plan for the test:

1. **Start the game** – Enter the level starting state.
2. **Get Mario’s starting position** – Where is he standing before we do anything?
3. **Press the right key** – Hold it for **one second**.
4. **Check where Mario ended up** – Where is Mario standing now?
5. **Verify the result** – If his **x-coordinate increased**, he did moved right! 🎉

Here is the test code that uses our handy test actions:

```python
@TestScenario
def scenario(self):
    """Check Mario can move right."""

    with Given("start the game"):
        game = actions.game.start()

    with And("get Mario's start position"):
        mario_start = actions.game.get_element(game, "player")

    with When("press the right key for 1 second"):
        with actions.game.press_right():
            actions.game.play(game, seconds=1)

    with And("get Mario's end position"):
        mario_end = actions.game.get_element(game, "player")

    with Then("check Mario moves right"):
        assert mario_end.box.x > mario_start.box.x, error()
```

If Mario **doesn’t move**, we’ll know something’s off. But if everything works, our test passes. Here's a video of this test in action with the red boxes added to Mario's start and end positions for visual confirmation.

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-5.gif">
<div class="text-secondary text-bold"><br>Super Mario: Move Right Classic Test</div>
</div><br>

### Moving left test

Similarly, we can easily implement a test to check if Mario moves **left** when
we press the left key. However, before we add another test, I'll update my main
**`Feature`** module and move starting the game step there so that we don't have
to start and stop the game for each test. My feature will now look like this:

```python
@TestFeature
def regression(self):
    """Run tests for the Super Mario Bros. game."""

    with Given("start the game"):
        self.context.game = actions.game.start()

    Scenario(run=load("tests.move_right", "scenario"))
    Scenario(run=load("tests.move_left", "scenario"))
```

Again, the important part is that I'll share the game between my two tests.
As expected, the moves **left** test is similar to the moves **right** test as shown below.

```python
@TestScenario
def scenario(self):
    """Check Mario can move left in the game."""
    game = self.context.game

    with Given("get Mario's start position"):
        mario_start = actions.game.get_element(game, "player")

    with When("press the left key for 1 second"):
        with actions.game.press_left():
            actions.game.play(game, seconds=1)

    with And("get Mario's end position"):
        mario_end = actions.game.get_element(game, "player")

    with Then("check Mario moves left"):
        assert mario_end.box.x < mario_start.box.x, error()
```

Here is a video of the test:

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-6.gif">
<div class="text-secondary text-bold"><br>Super Mario: Move Left Classic Test</div>
</div><br>

However, now that we share the game between two tests we see that while
move **left** test is working and passing, Mario does not move to the left the same
distance as he did in our moves **right** test. Why? Well, because the game is not
in the starting state and Mario has some velocity given by the moves **right** test before we press the left key in our move **left** test! So, this is interesting
and shows that by adding optimization of sharing the same instance of the game between tests our tests have different initial states. Therefore, our moves **left** test is actually a **moves-left-after-moving-right** test. The only reason why our
assertion is passing is that it tests for a very broad proposition of the **x-coordinate** being larger or smaller based on the direction of the movement.

### Jumping test

By now you get the idea of how classical tests can be written. But for fun, I can't resist, so let's quickly look at the **jump** test. We'd love to see Mario jump!

Here is the test when we press the jump key for 1 second and then assert
that the end **y-coordinate** is smaller that the start **y-coordinate**.
Why? Because screen's **y-coordinates** start at 0 on the top and increase going down. 

```python
@TestScenario
def scenario(self):
    """Check Mario can jump in the game."""
    game = self.context.game

    with Given("get Mario's start position"):
        mario_start = actions.game.get_element(game, "player")

    with When("press the jump key for 1 second"):
        with actions.game.press_jump():
            actions.game.play(game, seconds=1)

    with And("get Mario's end position"):
        mario_end = actions.game.get_element(game, "player")

    with Then("check Mario moves up"):
        assert mario_end.box.y < mario_start.box.y, error()
```

Here is the video of the test:

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-7.gif">
<div class="text-secondary text-bold"><br>Super Mario: Jump For 1 Second Classic Test</div>
</div><br>

Wait, but the Mario's end position looks like is a ground level because he
hits the left level boundary because he had an initial left velocity (because of the previous move **left** test) and moreover the jump movement does not mean that
Mario will stay up in the air if we press the jump key for some time.
Press it long enough and Mario will be pulled by the game's physics (the gravity)
back down! So why does the test pass? It just happens that the end position
is 2 y-pixels off from the starting position. This means that testing the jump move is tricky! The behavior is actually more complex. Also, note that Mario is jumping to the left because of the velocity in the left direction given by the previous move **left**
test. This means that there is x or y velocity that needs to be considered, and the gravity pull causes Mario's position in the air to change. This behavior is more complex that one would initially would think.

Having identified these issues, but still wanting to keep our assertion simple,
we modify test's action to hold the jump key for 0.2 seconds instead of 1.

```python
        with When("press the jump key for 0.2 seconds"):
            with actions.game.press_jump():
                actions.game.play(game, seconds=0.2)
```

Here is what we have now:

<div class="text-center">
<img style="width: 75%" src="/images/testing-super-mario-using-a-behavior-model-pic-8.gif">
<div class="text-secondary text-bold"><br>Super Mario: Jump For 0.2 Seconds Classic Test</div>
</div><br>

Our simple assertion will now pass with confidence! However, checking the complexity of
the full jumping move is non-trivial. Actually, if we think about the moves **right** and moves **left** tests they also did not account for initial position and velocity as well as any obstacles we could have run into or even being killed by the enemy!
This is what makes game testing so fun. The behavior is very interesting. Nonetheless, we've shown that we could make simple assertions work, and they are useful but are not precise enough to capture the game's physics of the movements.

## The theory behind behavior models

Before we start writing our **behavior model** we need to understand its power and properties so knowing the underlying theory will help to understand why it works and why it works well.

At its core, a **behavior model** is a practical method of describing how a system should behave using a programming language. The behavior consists of two fundamental parts:

1. Assertions about expected state transitions
2. Assertions about expected temporal properties

The first part directly maps to the *transition relation* in formal state machine theory, which is typically expressed as a **predicate**. 
State machines expressed as a predicate-based transition relation is the foundation of tools like [TLA+](https://lamport.azurewebsites.net/tla/tla.html).

The second part allows the model to assert that the system's behavior adheres to **time-dependent constraints**, meaning that certain properties must hold over a sequence of states rather than just in one state. The reason why a **behavior model** can also cover temporal properties is because it has access to a sequence of previous states (the history) and  unlike simple state transitions, which only check if the system moves correctly from one state to the next, **temporal properties** require considering the **history of states** leading up to the current moment.

### Expressing transition relations

The first key component of the model is the ability to define the **transition relation** {% katex %}R{% endkatex %}, which describes how the system moves from one state to the next. This relation can be **expressed as a predicate**.

> A **predicate** is a logical statement that contains variables and **becomes a proposition** when specific values are assigned to those variables.

In mathematical terms, the transition relation is defined as:

> {%katex%} R(s, s') \equiv \bigvee_{i=0}^n \varphi_i(s, s') {%endkatex%}

This means that the transition relation {%katex%}R{%endkatex%} is a **logical OR** of different predicate functions

> {% katex %}\varphi_i(s, s'){% endkatex %}

where each predicate function specifies how the system transitions from a given state {%katex%}s{%endkatex%} to the next state {%katex%}s'{%endkatex%}. 

If mathematical notation feels intimidating, this can be understood in Python as a collection of independent transition rules:

```python
def R(s, s_prime):
    return phi_0(s, s_prime) or phi_1(s, s_prime) or ... or phi_n(s, s_prime)
```

### Expressing temporal properties

The second key feature of behavior models is that they have access to the **full sequence of previous states**, not just the current state. This allows them to express **temporal properties**—rules that depend not only on the present state but also on **how the system arrived at that state**.

For example, a behavior model can assert properties such as:

* *"Mario must have collected a mushroom before transforming into Super Mario."*
* *"If Mario has invincibility, it should last for exactly 10 seconds."*
* *"An enemy must first appear on-screen before it can interact with Mario."*

These properties go beyond simple state-to-state transitions and encode **history-dependent behaviors**, which are essential in real-world systems.

### Behavior models are scalable!

Composability of transition relations and temporal properties allows partial models.
A key advantage of the transition relation {% katex %}R{% endkatex %} is that **behavior models can be built incrementally**! Since the transition relation is expressed as a **disjunction (OR) of multiple predicates**, each individual {% katex %}\varphi_i(s, s'){% endkatex %} can be modeled **separately**, without needing the full system behavior upfront.

Additionally, each predicate {% katex %}\varphi_i(s, s'){% endkatex %} is itself composed of **smaller conjunctive conditions** (logical AND statements), which describe:

* **Preconditions** – What must be true before the transition.
* **State updates** – How variables change in the next state.

This means that:

> * The behavior model can partially capture some predicates and still remain valid.
> * The model’s accuracy can be incrementally improved by adding or refining transition predicates.
> * Even an **incomplete model** can still detect deviations, allowing for **flexible testing**.

The same applies to **temporal properties**, which can also be combined using **disjunction (OR)**. This means we can incrementally add temporal constraints as needed, without requiring a complete specification upfront. For example:
We may initially check that *Mario becomes invincible after touching a star*.
Later, we can refine the model by adding a time constraint that ensures invincibility *lasts exactly 10 seconds*. Further refinements could add a rule that *Mario must flash before invincibility wears off*.

By refining the model over time, we can **improve its accuracy incrementally**, without requiring a complete specification upfront. This **makes behavior-model-based testing scalable**, allowing the model to be as simple or as complex as needed to match the system’s actual behavior.

## The behavior model

## Modeling movement

## Plugging the model into our classic tests

## Testing the model using manual test

## Modeling collision detection

## Modeling enemy interaction

## So, is the autonomous state exploration enough?

## Conclusion

