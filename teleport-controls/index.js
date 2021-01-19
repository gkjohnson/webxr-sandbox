import {
	WebGLRenderer,
	PerspectiveCamera,
	DirectionalLight,
	PCFSoftShadowMap,
	sRGBEncoding,
	Color,
	AmbientLight,
	Group,
	Scene,
	Mesh,
	BoxBufferGeometry,
	MeshStandardMaterial,
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import { VRButton } from '//unpkg.com/three@0.124.0/examples/jsm/webxr/VRButton.js';
import { GUI } from '//unpkg.com/three@0.124.0/examples/jsm/libs/dat.gui.module.js';
import { XRGamepad } from '../xr-gamepad/src/XRGamepad.js';
import { ActiveXRGamepad } from '../xr-gamepad/src/ActiveXRGamepad.js';
import { XRTeleportControls } from './src/XRTeleportControls.js';

let scene, camera, renderer, workspace;
let platforms, teleportControls, activeController;

init();

function init() {

	scene = new Scene();
	scene.background = new Color( 0x131619 );

	workspace = new Group();
	workspace.position.z = 3;
	scene.add( workspace );

	camera = new PerspectiveCamera();
	workspace.add( camera );

	renderer = new WebGLRenderer( { antialias: true } );
	renderer.outputEncoding = sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	const directionalLight = new DirectionalLight( 0xffffff, 1.0 );
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.setScalar( 2048 );
	directionalLight.position.set( 5, 30, 5 );
	scene.add( directionalLight );

	const ambientLight = new AmbientLight( 0x131619, 0.5 );
	scene.add( ambientLight );

	platforms = new Group();
	scene.add( platforms );

	const platform1 = new Mesh(
		new BoxBufferGeometry(),
		new MeshStandardMaterial(),
	);
	platform1.scale.set( 4, 0.1, 4. );

	const platform2 = platform1.clone();
	platform2.scale.set( 1, 0.1, 1 );
	platform2.position.set( 5, - 0.25, - 3 );

	const platform3 = platform1.clone();
	platform3.scale.set( 3, 0.1, 1 );
	platform3.position.set( 0, 1.5, - 6 );

	platforms.add( platform1, platform2, platform3 );


	// vr
	renderer.xr.enabled = true;
	renderer.setAnimationLoop( render );
	document.body.appendChild( VRButton.createButton( renderer ) );

	const controller0 = new XRGamepad( renderer.xr, 0 );
	const controller1 = new XRGamepad( renderer.xr, 1 );
	workspace.add( controller0, controller1 );

	activeController = new ActiveXRGamepad( [ controller0, controller1 ] );
	activeController.addEventListener( 'axis-pressed', e => {

		if ( e.name === 'LStick-X' ) {

			const direction = Math.sign( e.value );
			workspace.rotation.y += direction * Math.PI / 4;

		}

	} );
	workspace.add( activeController );

	teleportControls = new XRTeleportControls( activeController, workspace, platforms );
	teleportControls.arc.material.color.set( 0x009688 );
	scene.add( teleportControls.arc );

	const gui = new GUI();
	gui.add( teleportControls, 'minDistance', 0, 1, 0.01 );
	gui.add( teleportControls, 'maxDistance', 3, 15, 0.01 );
	gui.add( teleportControls, 'castHeight', 0, 5, 0.01 );
	gui.add( teleportControls, 'samples', 2, 50, 1 );

	onResize();
	window.addEventListener( 'resize', onResize );

}

function onResize() {

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

}

function render() {

	activeController.update();
	teleportControls.update();
	renderer.render( scene, camera );

}
