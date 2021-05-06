# Skinned Mesh Batching

Utility for merging multiple meshes in a scene into a single skinned mesh to cut down on draw calls. Included is a utility for remove redundant materials used within an Object3D.

[Demo here](https://gkjohnson.github.io/webxr-sandbox/skinned-mesh-batching/)!

## Limitations and Caveats

- Cannot support converting other skinned meshes.
- Material arrays are not supported.
- The proxied mesh root is expected to have no parent and not be reparented unless the batching proxy skinned mesh finished with.
- The skinned proxy meshes geometry bounding boxes are only kept up to date if frustumCulled = true.
- Duplicate meshes will be retained on the original meshes unless manually deleted. They are useful to keep for frustum culling.
- Materials must be set to using `skinning`.

## TODO

- [ ] Add raycasting to demo.
- [ ] See if depth prepass improves performance for overlapping meshes.
- [ ] Improve memory overhead when processing indexed geometry.
- [ ] Improve ProxyBone matrix update by just retaining and or returning the reference to the proxied mesh matrixWorld.
