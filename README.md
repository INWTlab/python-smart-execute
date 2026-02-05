# Python Smart Execute

## Description

This is a send to REPL implementation which solves the following problems with
the current behavior of the Python extension in VSCode:

- decorators are selected automatically
- the cursor jumps to the beginning of the next non empty line
- when in debug mode, selection is sent to the Debug Console

Smart execute means that when you hit Ctrl+Enter we look at the line your
cursor is currently in and make a decision if we think you better execute the
complete block in the REPL instead of just that line.

![smart-execute.gif](https://github.com/INWTlab/python-smart-execute/blob/main/smart-execute.gif?raw=true)


## Keybindings

-   ctrl+enter: (Smart) Execute selection or line in interactive window or debug console
    _and_ step
-   ctrl+alt+down: Navigate to next code block
-   ctrl+alt+up: Navigate to previous code block
