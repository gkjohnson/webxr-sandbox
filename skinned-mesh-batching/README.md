# Skinned Mesh Batching

Utility for merging multiple meshes in a scene into a single skinned mesh to cut down on draw calls.

## TODO

- Add helper for gathering meshes with common materials
- Merge geometries with common materials with each mesh getting a different bone index
- Create bones that copy the original mesh matrix worlds
- Handle raycasting so we don't get duplicate casts
- Handle the following parent child cases
	- original mesh roots are not parented
	- composite skinned mesh and original meshes share a parent
	- composite skinned mesh is parented to one of the original mesh roots
