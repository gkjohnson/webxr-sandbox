# Stereo Image Rendering

Shader for rendering stereo image pairs on a plane. Stereo images from [lockhaven.edu](https://www.lockhaven.edu/~dsimanek/3d/stereo/3dgallery22.htm).

[Demo here](https://gkjohnson.github.io/webxr-sandbox/stereo-images/)!

## TODO

- Write a shader that renders a different half of a stereo pair image per eye.
	- Multiview rendering is not supported generally so each image will have to be on a plane set to layer 1 and 2 for each eye.
- Move plane forward and back and larger and smaller with joystick.
