# XR Gamepad

Helper for initializing and visualizing and XR Gamepad and forwarding button presses.

[Demo here](https://gkjohnson.github.io/webxr-sandbox/xr-gamepads/)!

NOTE: In Chrome the gamepad handles do not seem to dynamically update and they must be polled via navigator.getGamepads(). Firefox updates the original gamepad object. The xr gamepad objects seem to be updated the same way in both Chrome and Firefox.

## Use

### XR Setup

```js
let activeController;

function init() {

	// ...

	const controller0 = new XRGamepad( renderer.xr, 0 );
	const controller1 = new XRGamepad( renderer.xr, 1 );

	// follows the position and fires events from the last interacted with xr controller
	activeController = new ActiveXRGamepad( [ controller0, controller1 ] );
	activeController.addEventListener( 'pressed', () => { ... } );
	activeController.addEventListener( 'axis-pressed', () => { ... } );

}

function render() {
 
	activeController.update();
	renderer.render( scene, camera );

}
```

### Traditional Gamepad Setup

```js
let gamepadManager;
let controller0, controller1;

function init() {

	// ...
	
	gamepadManager = new GamepadManager();
	controller0 = gamepadManager.getController( 0 );
	controller1 = gamepadManager.getController( 1 );

	controller0.addEventListener( 'pressed', () => { ... } );
	controller0.addEventListener( 'axis-pressed', () => { ... } );
	
	controller1.addEventListener( 'pressed', () => { ... } );
	controller1.addEventListener( 'axis-pressed', () => { ... } );

}

function render() {

	gamepadManager.update();

	if ( controller0.getButtonHeld( 'A' ) ) {
	
		// do something
	
	}
	
	renderer.render( scene, camera );

}

```

## TODO

- Docs
- Only load the controller models once it's been requested / if they're visible.
- Add a default button naming scheme
- Dispatch events from GamepadManager when controllers are connected or disconnected.
- Add getters to GamepadManager to check if a controller is connected.
- Consider an API that lets you create a WrappedGamepad based on controller index and update it individually.

