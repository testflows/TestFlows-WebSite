---
post: true
title: "Testing Simple Train Control System Using Its Formal Description"
description: An article about testing a simple train control system using its formal mathematical description.
date: 2024-11-03
author: Vitaliy Zakaznikov
image: images/testing-simple-train-control-system-using-formal-description.png
icon: fas fa-glasses pt-5 pb-5
---

In our previous post, [Decoding Formal Description of a Simple Train Control System](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/), we explored how to interpret a formal description defined using a [Kripke structure](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/#What-is-a-Kripke-structure) for a simple train control system, specifically the Ceiling Speed Monitoring Controller (CSMC). In this article, we’ll take a practical approach by using that formal description to design a test suite that systematically verifies an AI generated implementation of the controller in Python.

Given the increasing role of AI tools like ChatGPT in coding, testing generated code is more important than ever. Here, we’ll see how the formal model of the SPMC can be used to construct a rigorous test suite to validate that an AI-generated implementation meets the specified requirements. So, let’s dive in and start testing!

<!-- more -->

# Reference implementation

Before we can start testing, we need a concrete implementation. Taking the modern approach, we will ask an AI tool, [ChatGPT](https://chatgpt.com/?model=gpt-4o), to provide us with a reference implementation in Python.

We'll provide the ChatGPT 4o model with the original article, [Decoding Formal Description of a Simple Train Control System](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/#The-transition-relation), so it knows what we are talking about, and restate the transition relation {%katex%}R{%endkatex%} of the system, which is as follows:

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \\
\quad \varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) \lor \\
\quad \varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) \lor \\
\quad \varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) \lor \\
\quad \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
{%endkatex%}

See [Transition relation {%katex%}R{%endkatex%}](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/#The-transition-relation) section in the previous blog if the transition relation does not make sense.

Then, give it the following prompt to ask it to generate a Python implementation:

{% html div class="classic-quote" %}

> "Can you write a Python program that will simulate the behavior of the system described by this transition relation? Make it a CLI utility that allows the user to set initial V_MRSP and guards, then prompts the user for V_est, shows the state of the system, and exits cleanly when CTRL-C is pressed."

{% endhtml %}

Here is the first version of the Python program that we got and now need to test.

`train_control_system.py`
```python
import sys
import signal

class TrainControlSystem:
    def __init__(self, V_MRSP, gebi1_threshold=15, gebi2_threshold=7.5):
        self.V_MRSP = V_MRSP
        self.g_ebi1_threshold = gebi1_threshold  # Threshold for gebi1 condition
        self.g_ebi2_threshold = gebi2_threshold  # Threshold for gebi2 condition
        self.V_est = 0
        self.state = "NS"  # Initial state: NS (Normal State)
        self.W = 0  # Warning
        self.EB = 0  # Emergency Brake

    def transition(self):
        # Determine emergency brake conditions
        gebi1 = self.V_MRSP > 110 and self.V_est > self.V_MRSP + self.g_ebi1_threshold
        gebi2 = self.V_MRSP <= 110 and self.V_est > self.V_MRSP + self.g_ebi2_threshold

        # Apply transition rules based on the current state
        if self.state == "NS":
            if self.V_est <= self.V_MRSP:
                self.state = "NS"  # phi_0
            elif self.V_est > self.V_MRSP:
                self.state, self.W = "WS", 1  # phi_1
            elif gebi1 or gebi2:
                self.state, self.EB = "IS", 1  # phi_2

        elif self.state == "WS":
            if self.V_est > self.V_MRSP and not (gebi1 or gebi2):
                self.state, self.W = "WS", 1  # phi_3
            elif self.V_est <= self.V_MRSP:
                self.state, self.W, self.EB = "NS", 0, 0  # phi_4
            elif gebi1 or gebi2:
                self.state, self.EB = "IS", 1  # phi_5

        elif self.state == "IS":
            if self.V_est > 0:
                self.state, self.W, self.EB = "IS", 1, 1  # phi_6
            elif self.V_est == 0:
                self.state, self.W, self.EB = "NS", 0, 0  # phi_7

        # Print the current state after the transition
        print(f"State: {self.state}, V_est: {self.V_est}, V_MRSP: {self.V_MRSP}, W: {self.W}, EB: {self.EB}")

    def set_V_est(self, V_est):
        self.V_est = V_est
        self.transition()

def signal_handler(sig, frame):
    print("\nExiting program.")
    sys.exit(0)

def main():
    # Register the signal handler for clean exit on CTRL-C
    signal.signal(signal.SIGINT, signal_handler)

    # Prompt the user for initial setup values
    V_MRSP = float(input("Enter the initial maximum restricted speed (V_MRSP): "))
    gebi1_threshold = float(input("Enter the emergency brake guard threshold for V_MRSP > 110 (default is 15): ") or 15)
    gebi2_threshold = float(input("Enter the emergency brake guard threshold for V_MRSP <= 110 (default is 7.5): ") or 7.5)

    # Initialize the system with these parameters
    system = TrainControlSystem(V_MRSP, gebi1_threshold, gebi2_threshold)

    print("\nTrain Control System initialized.")
    print("Press CTRL-C to exit.\n")

    # Continuously prompt for V_est and update the system state
    while True:
        try:
            V_est = float(input("Enter the estimated speed (V_est): "))
            system.set_V_est(V_est)
        except ValueError:
            print("Invalid input. Please enter a numerical value for V_est.")

if __name__ == "__main__":
    main()
```

When you run the program, it will prompt you to enter `V_MRSP` and the two thresholds that determine when emergency braking should be applied. After that, it will ask you to enter the estimated current speed of the train, `V_est`, display the system's current state, and then wait for you to provide another `V_est` reading. You can stop the program at any time by pressing `CTRL-C`.

```bash
$ python train_control_system.py
```

```bash
Enter the initial maximum restricted speed (V_MRSP): 100
Enter the emergency brake guard threshold for V_MRSP > 110 (default is 15): 15
Enter the emergency brake guard threshold for V_MRSP <= 110 (default is 7.5): 7.5

Train Control System initialized.
Press CTRL-C to exit.

Enter the estimated speed (V_est):  80
State: NS, V_est: 80.0, V_MRSP: 100.0, W: 0, EB: 0
Enter the estimated speed (V_est): 
```

# Building test input sequences

With the reference implementation in hand, we are ready to proceed to check
that the implementation meets the requirements of system's behavior.
We are in luck here, given that we have a formal definition of the system
there requirements are as precise as we can have. 

{% html div class="classic-quote" %}

> Again, see ["Decoding Formal Description of a Simple Train Control System"](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/) for the actual formal model.

{% endhtml %}

What shall we use from the formal definition to build out test sequences?
The answer is simple, what we need is set of atomic propositions {%katex%}AP{%endkatex%} from which we'll create input equivalence class partitions (IECP).

{% html div class="classic-quote" %}

> We've learned how to create input equivalence class partitions in [Using Atomic Propositions and Equivalence Classes (Part 1)](..using-atomic-propositions-and-equivalence-classes-part1/) and [Using Atomic Propositions and Equivalence Classes (Part 2)](..using-atomic-propositions-and-equivalence-classes-part2/).

{% endhtml %}

Here is our set of atomic propositions:

> {%katex%}
AP = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15, \\
\quad \ell = \text{NS}, \ell = \text{WS}, \ell = \text{IS}, W, EB \}
{%endkatex%}

For building input equivalence class partitions, we'll only need
to focus on the propositions related to the inputs {%katex%}V_{est}, V_{MRSP}{%endkatex%}. Therefore, our set is:

> {%katex%}
AP_I = \{ V_{\text{est}} = 0, V_{\text{est}} > V_{\text{MRSP}}, V_{\text{MRSP}} > 110, V_{\text{est}} > V_{\text{MRSP}} + 7.5, V_{\text{est}} > V_{\text{MRSP}} + 15 \}
{%endkatex%}

Let's build the initial table of input equivalence class partitions (IECP).
Remember, it is easy to build one. This table has every combination
of each atomic proposition related to the input being either true or false.
Another way to think about it, it is a Cartesian product.

Like so,

> {%katex%}
IECP = \{ V_{\text{est}} = 0, \neg(V_{\text{est}} = 0) \} \times \\
\quad \{ V_{\text{est}} > V_{\text{MRSP}}, \neg(V_{\text{est}} > V_{\text{MRSP}}) \} \times \\ 
\quad \{ V_{\text{MRSP}} > 110, \neg(V_{\text{MRSP}} > 110) \} \times \\
\quad \{ V_{\text{est}} > V_{\text{MRSP}} + 7.5, \neg(V_{\text{est}} > V_{\text{MRSP}} + 7.5) \} \times \\
\quad \{ V_{\text{est}} > V_{\text{MRSP}} + 15, \neg(V_{\text{est}} > V_{\text{MRSP}} + 15) \}
{%endkatex%}

Now, we can build a table explicitly that will contain all {%katex%}2^5=32{%endkatex%}
classes from which we can later filter out which combinations have conflicts and then pick values for  {%katex%}V_{est}, V_{MRSP}{%endkatex%} that satisfy each class
or we can just use a graphical representation as below.

<img src="/images/testing-simple-train-control-system-v_est.png" style="display:block; margin:auto">

<br>

For, {%katex%}V_{MRSP} > 110{%endkatex%}, we can pick the following values:

* {%katex%}V_{MRSP}=120,V_{est}=\{0,50,115,123,132,140\}{%endkatex%}

For, {%katex%}V_{MRSP} <= 110{%endkatex%}, we can pick the following values:

* {%katex%}V_{MRSP}=100,V_{est}=\{0,50,105,109,113,120\}{%endkatex%}

The values are picked to fall into each region. Given that speed can't be in two separate regions at the same time it means that most of the {%katex%}2^5=32{%endkatex%} are invalid and only {%katex%}12{%endkatex%} classes are valid.

## Another way to work this out

If we give each atomic proposition a short {%katex%} p_i {%endkatex%} name as follows:

- **{%katex%} p_0 {%endkatex%}**: {%katex%} V_{\text{est}} = 0 {%endkatex%} — The estimated speed of the train is zero.
- **{%katex%} p_1 {%endkatex%}**: {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} — The estimated speed exceeds the maximum restricted speed (MRSP).
- **{%katex%} p_2 {%endkatex%}**: {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} — The MRSP is greater than 110.
- **{%katex%} p_3 {%endkatex%}**: {%katex%} V_{\text{est}} > V_{\text{MRSP}} + 7.5 {%endkatex%} — The estimated speed exceeds the MRSP by more than 7.5.
- **{%katex%} p_4 {%endkatex%}**: {%katex%} V_{\text{est}} > V_{\text{MRSP}} + 15 {%endkatex%} — The estimated speed exceeds the MRSP by more than 15.

From the table that would include all {%katex%}32{%endkatex%} classes, only the
following would be left:

{% html div class="styled-table compact" %}

| Class | {%katex%} p_0 {%endkatex%}       | {%katex%} p_1 {%endkatex%}           | {%katex%} p_2 {%endkatex%}           | {%katex%} p_3 {%endkatex%}           | {%katex%} p_4 {%endkatex%}           | Explanation                                                             |
|-------------|---------------------------------|--------------------------------------|--------------------------------------|--------------------------------------|--------------------------------------|-------------------------------------------------------------------------|
| 12          | {%katex%} p_0 {%endkatex%}       | {%katex%} \neg p_1 {%endkatex%}     | {%katex%} p_2 {%endkatex%}          | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} = 0 {%endkatex%}, no thresholds exceeded, {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} |
| 16          | {%katex%} p_0 {%endkatex%}       | {%katex%} \neg p_1 {%endkatex%}     | {%katex%} \neg p_2 {%endkatex%}     | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} = 0 {%endkatex%}, no thresholds exceeded, {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%} |
| 13          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} p_2 {%endkatex%}          | {%katex%} p_3 {%endkatex%}          | {%katex%} p_4 {%endkatex%}          | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} with all thresholds exceeded, and {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} |
| 14          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} p_2 {%endkatex%}          | {%katex%} p_3 {%endkatex%}          | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} with {%katex%} V_{\text{MRSP}} > 110 {%endkatex%}, exceeding 7.5 but not 15  |
| 15          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} p_2 {%endkatex%}          | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} without exceeding additional thresholds, {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} |
| 17          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} \neg p_2 {%endkatex%}     | {%katex%} p_3 {%endkatex%}          | {%katex%} p_4 {%endkatex%}          | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} with all thresholds exceeded, {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%}  |
| 18          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} \neg p_2 {%endkatex%}     | {%katex%} p_3 {%endkatex%}          | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} exceeding 7.5 but not 15, {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%}        |
| 19          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} \neg p_2 {%endkatex%}     | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} without exceeding additional thresholds, {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%} |
| 20          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} p_1 {%endkatex%}          | {%katex%} \neg p_2 {%endkatex%}     | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} > V_{\text{MRSP}} {%endkatex%} without exceeding additional thresholds, {%katex%} V_{\text{MRSP}} \leq 110 {%endkatex%} |
| 21          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} \neg p_1 {%endkatex%}     | {%katex%} p_2 {%endkatex%}          | {%katex%} p_3 {%endkatex%}          | {%katex%} p_4 {%endkatex%}          | {%katex%} V_{\text{est}} \leq V_{\text{MRSP}} {%endkatex%} with all thresholds exceeded, {%katex%} V_{\text{MRSP}} > 110 {%endkatex%}  |
| 22          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} \neg p_1 {%endkatex%}     | {%katex%} p_2 {%endkatex%}          | {%katex%} p_3 {%endkatex%}          | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} \leq V_{\text{MRSP}} {%endkatex%} exceeding 7.5 but not 15, {%katex%} V_{\text{MRSP}} > 110 {%endkatex%}       |
| 24          | {%katex%} \neg p_0 {%endkatex%}  | {%katex%} \neg p_1 {%endkatex%}     | {%katex%} p_2 {%endkatex%}          | {%katex%} \neg p_3 {%endkatex%}     | {%katex%} \neg p_4 {%endkatex%}     | {%katex%} V_{\text{est}} \leq V_{\text{MRSP}} {%endkatex%} without exceeding thresholds, {%katex%} V_{\text{MRSP}} > 110 {%endkatex%} |

{% endhtml %}

Then, you would just pick values to satisfy each input equivalence class partition.

# Coding up user actions

After having test input values defined, we can start writing the test code
that will automate all possible user actions such as:

* starting and stopping the program
* setting V_MRSP and threshold values
* entering estimated speed
* expecting normal status state
* expecting warning status state
* expecting emergency braking (intervention) status state

Because we are dealing with a command line (CLI) program, we'll use `testflows.connect` module to control it using the `send` and `expect` methods. We'll also define a `State` class to wrap
all the elements of state of the controller into one object. We will need
it when we implement the behavior model of the controller that will be used
as a test oracle to give us the expected state of the system for any
combination of controller's behavior. 

Here are all the actions, including the `State` class, implemented in Python:

```python
import re
from testflows.core import *
from testflows.combinatorics import *
from testflows.connect import Shell

class State:
    def __init__(self, State, V_est, V_MRSP, W, EB):
        self.State = State
        self.V_est = float(V_est)
        self.V_MRSP = float(V_MRSP)
        self.W = int(W)
        self.EB = int(EB)

    def __str__(self):
        return f"State={self.State},V_est={self.V_est},V_MRSP={self.V_MRSP},W={self.W},EB={self.EB}"


@TestStep(Given)
def start_program(self):
    """Start the train controm system program."""
    with Shell() as bash:
        with bash("python train_control_system.py", asynchronous=True) as controller:
            self.context.app = controller.app
            try:
                yield
            finally:
                with By("stopping the program with CTRL-C"):
                    self.context.app.child.send("\03")
                    self.context.app.child.expect("Exiting program.")
                    self.context.app.child.expect("\n", escape=False)
                    bash.expect(bash.prompt)


@TestStep(When)
def enter_speed(self, v_est):
    """Enter the estimated speed and then
    read and return current system state."""
    self.context.app.child.send(str(v_est))
    self.context.app.child.expect(str(v_est))
    self.context.app.child.expect("Enter the estimated speed \(V_est\)\:")
    # State: NS, V_est: 60.0, V_MRSP: 100.0, W: 0, EB: 0
    pattern = re.compile(
        r"State: (?P<State>\w+), "
        r"V_est: (?P<V_est>[\d.]+), "
        r"V_MRSP: (?P<V_MRSP>[\d.]+), "
        r"W: (?P<W>\d+), "
        r"EB: (?P<EB>\d+)"
    )
    return State(**pattern.match(self.context.app.child.before.strip()).groupdict())


@TestStep(Given)
def enter_vmrsp_and_thresholds(self, v_mrsp, g_ebi1_threshold=15, g_ebi2_threshold=7.5):
    """Enter V_MRSP and guard 1 and 2 thresholds."""
    app = self.context.app

    app.child.expect("Enter the initial maximum restricted speed \(V_MRSP\)\:")
    app.child.send(str(v_mrsp))
    app.child.expect("\n", escape=False)

    app.child.expect(
        "Enter the emergency brake guard threshold for V_MRSP > 110 \(default is 15\)"
    )
    app.child.send(str(g_ebi1_threshold))
    app.child.expect("\n", escape=False)

    app.child.expect(
        "Enter the emergency brake guard threshold for V_MRSP <= 110 \(default is 7.5\)"
    )
    app.child.send(str(g_ebi2_threshold))
    app.child.expect("\n", escape=False)

    app.child.expect("Press CTRL-C to exit.")
    app.child.expect("\n", escape=False)
    app.child.expect("Enter the estimated speed \(V_est\)\:")


@TestStep(Then)
def expect_normal_status(self, state, W, EB):
    """Expect normal status."""
    assert state == "NS", f"expected state NS but got {state}"
    assert W == 0, f"expected W=0 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"


@TestStep(Then)
def expect_warning_status(self, state, W, EB):
    """Expect warning status."""
    assert state == "WS", f"expected state WS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"


@TestStep(Then)
def expect_emergency_brake_status(self, state, W, EB):
    """Expect emergency brake status."""
    assert state == "IS", f"expected state IS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 1, f"expected EB=1 but got {EB}"
```

# The behavior model

Because we will need to check many different combinations of inputs, the actual number is in the hundreds, we need to create a behavior model that will correctly
compute the expected state.

{% html div class="classic-quote" %}

> See [Combinatorial Testing: Writing Behavior Model](https://testflows.com/blog/combinatorial-testing-behavior-model/) for an introduction of how to write a behavior model.

{% endhtml %}

The behavior model is created based on the transition relation {%katex%}R{%endkatex%} of the system. Here it is again so that you can easily use it to compare with the code:

> {%katex%}
R((V_{\text{est}}, V_{\text{MRSP}}, \ell, W, EB), (V'_{\text{est}}, V'_{\text{MRSP}}, \ell', W', EB')) \equiv \\
\quad \varphi_0: (\ell = \text{NS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = W \land EB' = EB) \lor \\
\quad \varphi_1: (\ell = \text{NS} \land V_{\text{est}} > V_{\text{MRSP}} \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_2: (\ell = \text{NS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = 1 \land EB' = 1) \lor \\
\quad \varphi_3: (\ell = \text{WS} \land V_{\text{est}} > V_{\text{MRSP}} \land \neg(g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{WS} \land W' = 1 \land EB' = EB) \lor \\
\quad \varphi_4: (\ell = \text{WS} \land V_{\text{est}} \leq V_{\text{MRSP}} \land \ell' = \text{NS} \land W' = 0 \land EB' = 0) \lor \\
\quad \varphi_5: (\ell = \text{WS} \land (g_{\text{ebi1}} \lor g_{\text{ebi2}}) \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_6: (\ell = \text{IS} \land V_{\text{est}} > 0 \land \ell' = \text{IS} \land W' = W \land EB' = 1) \lor \\
\quad \varphi_7: (\ell = \text{IS} \land V_{\text{est}} = 0 \land \ell' = \text{NS} \land W' = 0 \land EB' = 0)
{%endkatex%}

```python
class Model:
    """Ceiling Speed Monitoring Contoller (CSMC) behavior model."""

    def __init__(self, V_MRSP_threshold=110, g_ebi1_threshold=15, g_ebi2_threshold=7.5):
        self.V_MRSP_threshold = V_MRSP_threshold
        self.g_ebi1_threshold = g_ebi1_threshold
        self.g_ebi2_threshold = g_ebi2_threshold

    def g_ebi1(self, current_state):
        """Guard 1 condition."""
        return (
            current_state.V_MRSP > self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi1_threshold
        )

    def g_ebi2(self, current_state):
        """Guard 2 condition."""
        return (
            current_state.V_MRSP <= self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi2_threshold
        )

    def expect_normal_status(self, behavior):
        """Expect normal status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State == "NS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "WS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "IS":
            if current_state.V_est == 0:
                return expect_normal_status

    def expect_warning_status(self, behavior):
        """Expect warning status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in ("NS", "WS"):
            if current_state.V_est > current_state.V_MRSP:
                if not (self.g_ebi1(current_state) or self.g_ebi2(current_state)):
                    return expect_warning_status

    def expect_emergency_brake_status(self, behavior):
        """Expect emergency brake status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in "NS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "WS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "IS":
            if current_state.V_est > 0:
                return expect_emergency_brake_status

    def expect(self, behavior):
        """Return expected behavior."""
        return (
            self.expect_normal_status(behavior)
            or self.expect_warning_status(behavior)
            or self.expect_emergency_brake_status(behavior)
        )
```

To use this model, we will define a new `check_result` action that
will take a given `behavior` and use the model to get the expected
state of the controller.

```python
@TestStep(Then)
def check_result(self, behavior, model):
    """Check the result of the train control system."""
    current_state = behavior[-1]
    expect = model.expect(behavior)
    debug(f"{current_state},expect={expect.__name__ if expect else None}")
    expect(state=current_state.State, W=current_state.W, EB=current_state.EB)

```

# Writing the test to check all equivalence classes

We have the inputs to cover each equivalence class selected. Now, we can write
the actual test. However, because the system is stateful, we need to take
into account the transitions that the system can make from one state to another.
Given that the system has only 3 internal states, we can apply the [Pigeonhole principle](https://en.wikipedia.org/wiki/Pigeonhole_principle) just like we did 
in [Determining the minimum number of calls](https://testflows.com/blog/combinatorial-testing-behavior-model/#Determining-the-minimum-number-of-calls) section
when we tested the memory function in the previous article.

The actual test will consist from two parts, first the `TestOutline` which will
define the outline of the test that will check specific combination
with selected {%katex%}V_{MRSP}{%endkatex%}, thresholds, and a sequence of estimated
speed readings.

Here is the outline:

```python
@TestOutline(Scenario)
def check_combination(self, v_mrsp, g_ebi1_threshold, g_ebi2_threshold, speed_sequence):
    """Check specific combination of the controller behavior."""

    model = Model(g_ebi1_threshold=g_ebi1_threshold, g_ebi2_threshold=g_ebi2_threshold)
    behavior = []

    with Given("I start the train control system program"):
        start_program()

    with And("I set V_MRSP and guard thresholds"):
        enter_vmrsp_and_thresholds(
            v_mrsp=v_mrsp,
            g_ebi1_threshold=g_ebi1_threshold,
            g_ebi2_threshold=g_ebi2_threshold,
        )
        # add the initial state
        behavior.append(State(State="NS", V_est=0, V_MRSP=v_mrsp, W=0, EB=0))

    for i, v_est in enumerate(speed_sequence):
        with When(f"step {i}: speed is {v_est}"):
            state = enter_speed(v_est=v_est)
            behavior.append(state)
            check_result(behavior=behavior, model=model)
```

The above outline will be used in the `check_all_combinations` test
that will create all the combinations that we need to check for each
value of {%katex%}V_{MRSP}{%endkatex%}, thresholds, and the estimated
speeds that correspond for a given value of the {%katex%}V_{MRSP}{%endkatex%}.

```python
@TestFeature
def check_all_combinations(self):
    """Test train control system."""
    v_mrsps = {
        100: (0,50,115,123,132,140),
        120: (0,50,105,109,113,120)
    }
    thresholds = [(15, 7.5)]
    i = 0

    for v_mrsp, (g_ebi1_threshold, g_ebi2_threshold) in product(list(v_mrsps.keys()), thresholds):
        speeds = v_mrsps[v_mrsp]
        for speed_sequence in product(speeds, repeat=3):
            Combination(
                f"#{i}: V_MRSP={v_mrsp},g_ebi1={g_ebi1_threshold},g_ebi2={g_ebi2_threshold},speeds={speed_sequence}",
                test=check_combination,
            )(
                v_mrsp=v_mrsp,
                g_ebi1_threshold=g_ebi1_threshold,
                g_ebi2_threshold=g_ebi2_threshold,
                speed_sequence=speed_sequence,
            )
            i += 1
```

With all of the pieces in place, we are ready to put the full test program together.

# The full test program

Here is the full test program that we can use to check if the reference implementation
produced by the ChatGPT is correct.

`test_train_control_system.py`
```python
import re
from testflows.core import *
from testflows.combinatorics import *
from testflows.connect import Shell


class State:
    def __init__(self, State, V_est, V_MRSP, W, EB):
        self.State = State
        self.V_est = float(V_est)
        self.V_MRSP = float(V_MRSP)
        self.W = int(W)
        self.EB = int(EB)

    def __str__(self):
        return f"State={self.State},V_est={self.V_est},V_MRSP={self.V_MRSP},W={self.W},EB={self.EB}"


@TestStep(Given)
def start_program(self):
    """Start the train controm system program."""
    with Shell() as bash:
        with bash("python train_control_system.py", asynchronous=True) as controller:
            self.context.app = controller.app
            try:
                yield
            finally:
                with By("stopping the program with CTRL-C"):
                    self.context.app.child.send("\03")
                    self.context.app.child.expect("Exiting program.")
                    self.context.app.child.expect("\n", escape=False)
                    bash.expect(bash.prompt)


@TestStep(When)
def enter_speed(self, v_est):
    """Enter the estimated speed and then
    read and return current system state."""
    self.context.app.child.send(str(v_est))
    self.context.app.child.expect(str(v_est))
    self.context.app.child.expect("Enter the estimated speed \(V_est\)\:")
    # State: NS, V_est: 60.0, V_MRSP: 100.0, W: 0, EB: 0
    pattern = re.compile(
        r"State: (?P<State>\w+), "
        r"V_est: (?P<V_est>[\d.]+), "
        r"V_MRSP: (?P<V_MRSP>[\d.]+), "
        r"W: (?P<W>\d+), "
        r"EB: (?P<EB>\d+)"
    )
    return State(**pattern.match(self.context.app.child.before.strip()).groupdict())


@TestStep(Given)
def enter_vmrsp_and_thresholds(self, v_mrsp, g_ebi1_threshold=15, g_ebi2_threshold=7.5):
    """Enter V_MRSP and guard 1 and 2 thresholds."""
    app = self.context.app

    app.child.expect("Enter the initial maximum restricted speed \(V_MRSP\)\:")
    app.child.send(str(v_mrsp))
    app.child.expect("\n", escape=False)

    app.child.expect(
        "Enter the emergency brake guard threshold for V_MRSP > 110 \(default is 15\)"
    )
    app.child.send(str(g_ebi1_threshold))
    app.child.expect("\n", escape=False)

    app.child.expect(
        "Enter the emergency brake guard threshold for V_MRSP <= 110 \(default is 7.5\)"
    )
    app.child.send(str(g_ebi2_threshold))
    app.child.expect("\n", escape=False)

    app.child.expect("Press CTRL-C to exit.")
    app.child.expect("\n", escape=False)
    app.child.expect("Enter the estimated speed \(V_est\)\:")


@TestStep(Then)
def expect_normal_status(self, state, W, EB):
    """Expect normal status."""
    assert state == "NS", f"expected state NS but got {state}"
    assert W == 0, f"expected W=0 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"


@TestStep(Then)
def expect_warning_status(self, state, W, EB):
    """Expect warning status."""
    assert state == "WS", f"expected state WS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 0, f"expected EB=0 but got {EB}"


@TestStep(Then)
def expect_emergency_brake_status(self, state, W, EB):
    """Expect emergency brake status."""
    assert state == "IS", f"expected state IS but got {state}"
    assert W == 1, f"expected W=1 but got {W}"
    assert EB == 1, f"expected EB=1 but got {EB}"


@TestStep(Then)
def check_result(self, behavior, model):
    """Check the result of the train control system."""
    current_state = behavior[-1]
    expect = model.expect(behavior)
    debug(f"{current_state},expect={expect.__name__ if expect else None}")
    expect(state=current_state.State, W=current_state.W, EB=current_state.EB)


class Model:
    """Ceiling Speed Monitoring Contoller (CSMC) behavior model."""

    def __init__(self, V_MRSP_threshold=110, g_ebi1_threshold=15, g_ebi2_threshold=7.5):
        self.V_MRSP_threshold = V_MRSP_threshold
        self.g_ebi1_threshold = g_ebi1_threshold
        self.g_ebi2_threshold = g_ebi2_threshold

    def g_ebi1(self, current_state):
        """Guard 1 condition."""
        return (
            current_state.V_MRSP > self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi1_threshold
        )

    def g_ebi2(self, current_state):
        """Guard 2 condition."""
        return (
            current_state.V_MRSP <= self.V_MRSP_threshold
            and current_state.V_est > current_state.V_MRSP + self.g_ebi2_threshold
        )

    def expect_normal_status(self, behavior):
        """Expect normal status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State == "NS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "WS":
            if current_state.V_est <= current_state.V_MRSP:
                return expect_normal_status
        elif prev_state.State == "IS":
            if current_state.V_est == 0:
                return expect_normal_status

    def expect_warning_status(self, behavior):
        """Expect warning status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in ("NS", "WS"):
            if current_state.V_est > current_state.V_MRSP:
                if not (self.g_ebi1(current_state) or self.g_ebi2(current_state)):
                    return expect_warning_status

    def expect_emergency_brake_status(self, behavior):
        """Expect emergency brake status."""
        current_state = behavior[-1]
        prev_state = behavior[-2]
        if prev_state.State in "NS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "WS":
            if self.g_ebi1(current_state) or self.g_ebi2(current_state):
                return expect_emergency_brake_status
        elif prev_state.State == "IS":
            if current_state.V_est > 0:
                return expect_emergency_brake_status

    def expect(self, behavior):
        """Return expected behavior."""
        return (
            self.expect_normal_status(behavior)
            or self.expect_warning_status(behavior)
            or self.expect_emergency_brake_status(behavior)
        )


@TestOutline(Scenario)
def check_combination(self, v_mrsp, g_ebi1_threshold, g_ebi2_threshold, speed_sequence):
    """Check specific combination of the controller behavior."""

    model = Model(g_ebi1_threshold=g_ebi1_threshold, g_ebi2_threshold=g_ebi2_threshold)
    behavior = []

    with Given("I start the train control system program"):
        start_program()

    with And("I set V_MRSP and guard thresholds"):
        enter_vmrsp_and_thresholds(
            v_mrsp=v_mrsp,
            g_ebi1_threshold=g_ebi1_threshold,
            g_ebi2_threshold=g_ebi2_threshold,
        )
        # add the initial state
        behavior.append(State(State="NS", V_est=0, V_MRSP=v_mrsp, W=0, EB=0))

    for i, v_est in enumerate(speed_sequence):
        with When(f"step {i}: speed is {v_est}"):
            state = enter_speed(v_est=v_est)
            behavior.append(state)
            check_result(behavior=behavior, model=model)


@TestFeature
def check_all_combinations(self):
    """Test train control system."""
    v_mrsps = {
        100: (0,50,115,123,132,140),
        120: (0,50,105,109,113,120)
    }
    thresholds = [(15, 7.5)]
    i = 0

    for v_mrsp, (g_ebi1_threshold, g_ebi2_threshold) in product(list(v_mrsps.keys()), thresholds):
        speeds = v_mrsps[v_mrsp]
        for speed_sequence in product(speeds, repeat=3):
            Combination(
                f"#{i}: V_MRSP={v_mrsp},g_ebi1={g_ebi1_threshold},g_ebi2={g_ebi2_threshold},speeds={speed_sequence}",
                test=check_combination,
            )(
                v_mrsp=v_mrsp,
                g_ebi1_threshold=g_ebi1_threshold,
                g_ebi2_threshold=g_ebi2_threshold,
                speed_sequence=speed_sequence,
            )
            i += 1


@TestModule
def regression(self):
    "Exhaustively test train control system." ""
    Feature(test=check_all_combinations)()


if main():
    regression()
```

# Running the test program

The time of truth has come! Is the ChatGPT's implementation of the controller correct?
Let's run our fancy test program:

```
python3 test_train_control_system.py -o slick
```

And unfortunately, or fortunately for our test program, we catch the first bug!

```python
➤ Module regression
  ➤ Feature check all combinations
    ✔ Combination #0﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 0）
    ✔ Combination #1﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 50）
    ✘ Combination #2﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 115）, AssertionError
  ✘ Feature check all combinations, AssertionError
✘ Module regression, AssertionError
  AssertionError: expected state IS but got WS
```

The output says that we've found the case where we expected the controller to enter
the emergency braking (intervention) status (IS) state but instead
the controller was in the warning status (WS) state. Not good!

After, reading the code we find an issue:

```python
        # Apply transition rules based on the current state
        if self.state == "NS":
            if self.V_est <= self.V_MRSP:
                self.state = "NS"  # phi_0
            elif self.V_est > self.V_MRSP:
                self.state, self.W = "WS", 1  # phi_1
            # BUG: this needs to be checked before self.V_est > self.V_MRSP!
            elif gebi1 or gebi2: 
                self.state, self.EB = "IS", 1  # phi_2
```

The code checks for `gebi1 or gebi2` condition after `self.V_est > self.V_MRSP`
which is incorrect! Instead, it needs to check for `gebi1 or gebi2` first.

Let's push the fix to the `train_control_system.py` and try again.
But we hit another issue!

```python
➤ Module regression
  ➤ Feature check all combinations
    ✔ Combination #0﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 0）
    ✔ Combination #1﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 50）
    ✘ Combination #2﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 115）, AssertionError
  ✘ Feature check all combinations, AssertionError
✘ Module regression, AssertionError
  AssertionError: expected W=1 but got 0
```

This time the test program tells us that the warning signal (W) was not set
when it was expected. Upon further investigation we see that the
controller entered the emergency braking (intervention) status state
without setting the warning signal (W) to alert the driver. 

It turns out the same block of code is to blame. It had 2 bugs!

```python
        # Apply transition rules based on the current state
        if self.state == "NS":
            if self.V_est <= self.V_MRSP:
                self.state = "NS"  # phi_0
            elif self.V_est > self.V_MRSP:
                self.state, self.W = "WS", 1  # phi_1
            # BUG: this needs to be checked before self.V_est > self.V_MRSP!
            elif gebi1 or gebi2: 
                # BUG: warning singal self.W is not set to 1 when moving to the IS state!
                self.state, self.EB = "IS", 1  # phi_2
```

Applying both fixes to the above code we finally get this:

```python
        # Apply transition rules based on the current state
        if self.state == "NS":
            if self.V_est <= self.V_MRSP:
                self.state = "NS"  # phi_0
            elif gebi1 or gebi2: 
                self.state, self.W, self.EB = "IS", 1, 1  # phi_2
            elif self.V_est > self.V_MRSP:
                self.state, self.W = "WS", 1  # phi_1
```

Running the test program again we see that now it does not fail straight away.
It actually completes successfully!

```python
$ python3 test_train_control_system.py -o slick
➤ Module regression
  ➤ Feature check all combinations
    ✔ Combination #0﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 0）
    ✔ Combination #1﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 50）
    ✔ Combination #2﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 115）
    ✔ Combination #3﹕ V_MRSP=100,g_ebi1=15,g_ebi2=7․5,speeds=（0, 0, 123）
    ...
    ✔ Combination #429﹕ V_MRSP=120,g_ebi1=15,g_ebi2=7․5,speeds=（120, 120, 109）
    ✔ Combination #430﹕ V_MRSP=120,g_ebi1=15,g_ebi2=7․5,speeds=（120, 120, 113）
    ✔ Combination #431﹕ V_MRSP=120,g_ebi1=15,g_ebi2=7․5,speeds=（120, 120, 120）
  ✔ Feature check all combinations
✔ Module regression
...
1 module (1 ok)
1 feature (1 ok)
432 combinations (432 ok)
3024 steps (3024 ok)

Total time 20s 195ms
```

The test program checked all the {%katex%}2 \times 6^3 = 432{%endkatex%} input combinations.

# Conclusion

In this post we've written a comprehensive test that uses the formal description of the
Ceiling Speed Monitoring Controller (CSMC) that we've discussed in the
[Decoding Formal Description of a Simple Train Control System](https://testflows.com/blog/decoding-formal-description-simple-train-control-system/) article.
We saw that by using the set of atomic propositions from the Kripke structure
and deriving input equivalence class partitions from it our test coverage
was able to catch two critical bugs in the reference implementation written by the AI model.
Both bugs were subtle and would be very hard to spot using visual code review.
Nonetheless, by using rigorous testing technique derived from formal methods
we were successful in catching both the bugs. This does not mean that the test program
would catch all possible bugs that can be found in a possible implementation of the controller. This is because the test program will only be exhaustive only if the set of atomic propositions matches the model. But we can't know what the actual atomic propositions for a given implementation can be and therefore further testing techniques must be applied to look for unknown atomic propositions that may exist
in the implementation. This is what makes testing fun! 
