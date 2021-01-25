# Near Camera Stencil Clip Caps

Demonstration of using stencil materials to render a clip cap when the user moves their head inside of a mesh.

[Demo here](https://gkjohnson.github.io/webxr-sandbox/skinned-mesh-batching/)!

## Possible Improvements

- Perform front and back stencil operations in single pass using sided stencil options (requires three.js update).
- Only perform stencil test if the camera near clip plane intersects with the geometry to reduce rendering.
- Position the clip plane more precisely in front of the user camera.
