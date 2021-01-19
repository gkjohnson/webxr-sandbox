# XR Gamepad

Helper for initializing and visualizing and XR Gamepad and forwarding button presses.

[Demo here](https://gkjohnson.github.io/webxr-sandbox/xr-gamepads/)!

NOTE: In Chrome the gamepad handles do not seem to dynamically update and they must be polled via navigator.getGamepads(). Firefox updates the original gamepad object. The xr gamepad objects seem to be updated the same way in both Chrome and Firefox.

## TODO

- Docs
- Only load the controller models once it's been requested / if they're visible.
