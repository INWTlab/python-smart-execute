"""
Script to test smartSelect + execute interactively.

- Execute line by line. Hitting Ctrl+Enter should bring you to the end of the
  script.
- Also try Ctrl+Shift+A, then Ctrl+Enter. This should run the complete script.
"""

import time
from contextlib import contextmanager

from decorator import decorator

try:
    print("Yay")
except Exception:
    print("Oh no!")
finally:
    print("finally")

if False:
    print("if")
elif True:
    print("else if")
else:
    print("Else")


def test():
    return ""


x = {
    "key1": "value",
    "key2": "value",
    "key3": "value",
    "key4": "value",
    "key5": "value",
}

another_long_name_here = 1
[
    a_very_long_name_again + another_long_name_here
    for a_very_long_name_again in range(10)
]


def function_with_a_lot_of_params(
    very_long_argument_name="value", so_that_we_need_a_line_break="value"
):
    pass


@contextmanager
def my_context():
    yield 1


with my_context() as x:
    print(x)


@decorator
def timer(func, *args, **kw):
    time_start = time.time()
    res = func(*args, **kw)
    print(round(time.time() - time_start), "s elapsed")
    return res


@timer
def some_function(x):

    time.sleep(2)
    for i in range(0, 10):

        # asd
        print(i)
    return x


some_function(1)


class test:
    """Docstring

    multi line
    """

    def method():

        breakpoint()
        pass


# - open/close paranthesis multi-line
# - multi line doc strings


import matplotlib.pyplot as plt

plt.plot([1, 2, 3, 4])
plt.ylabel("some numbers")
plt.show()
