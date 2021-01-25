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
	MeshBasicMaterial,
	PlaneBufferGeometry,
	TextureLoader,
	Euler,
	Quaternion,
	IcosahedronBufferGeometry,
	MeshPhongMaterial,
	Fog,
	Clock,
	TorusKnotBufferGeometry,
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import { VRButton } from '//unpkg.com/three@0.124.0/examples/jsm/webxr/VRButton.js';
import { GUI } from '//unpkg.com/three@0.124.0/examples/jsm/libs/dat.gui.module.js';
import { XRGamepad } from '../xr-gamepad/src/XRGamepad.js';
import { ActiveXRGamepad } from '../xr-gamepad/src/ActiveXRGamepad.js';
import { ProxyBatchedMesh } from './src/ProxyBatchedMesh.js';

let scene, camera, renderer;
let activeController;
let group, skinnedProxy, clock;

const params = {

	useSkinnedBatching: true,

};

init();

function init() {

	clock = new Clock();

	scene = new Scene();
	scene.background = new Color( 0x131619 );
	scene.fog = new Fog( 0x131619, 3, 5.5 );

	camera = new PerspectiveCamera();
	scene.add( camera );

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

	group = new Group();

	const material = new MeshPhongMaterial( { flatShading: true } );
	for ( let i = 0; i < 1000; i ++ ) {

		let geometry;
		if ( i % 2 === 0 ) {

			geometry = new IcosahedronBufferGeometry(
				0.01 + Math.random() * 0.02,
				Math.floor( Math.random() * 4 ),
			);

		} else {

			const radius = 0.01 + Math.random() * 0.02;
			geometry = new TorusKnotBufferGeometry(
				radius,
				radius / 3,
				64,
				8,
				1 + Math.floor( Math.random() * 4 ),
				2 + Math.floor( Math.random() * 4 ),
			).toNonIndexed();

		}
		const mesh = new Mesh(
			geometry,
			material,
		);

		mesh.position.random();
		mesh.position.x -= 0.5;
		mesh.position.y -= 0.5;
		mesh.position.z -= 0.5;

		mesh.position.multiplyScalar( 2.0 ).multiplyScalar( 5 );

		group.add( mesh );

	}

	skinnedProxy = new ProxyBatchedMesh( group );
	scene.add( skinnedProxy );

	// vr
	renderer.xr.enabled = true;
	renderer.setAnimationLoop( render );
	document.body.appendChild( VRButton.createButton( renderer ) );

	const controller0 = new XRGamepad( renderer.xr, 0 );
	const controller1 = new XRGamepad( renderer.xr, 1 );
	activeController = new ActiveXRGamepad( [ controller0, controller1 ] );
	scene.add( activeController, controller0, controller1 );

	const gui = new GUI();
	gui.width = 300;
	gui.add( params, 'useSkinnedBatching' ).onChange( v => {

		if ( v ) {

			scene.remove( group );
			scene.add( skinnedProxy );
			material.skinning = true;
			material.needsUpdate = true;

		} else {

			scene.add( group );
			scene.remove( skinnedProxy );
			material.skinning = false;
			material.needsUpdate = true;

		}

	} );

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

	const delta = clock.getDelta();
	const objects = group.children;
	for ( let i = 0, l = objects.length; i < l; i ++ ) {

		const object = objects[ i ];
		object.position.y += delta * ( 1 + 0.5 * ( i % 5 ) ) * 0.1;

		object.rotation.x += delta * ( 1 + 0.5 * ( i % 6 ) ) * 0.1;
		object.rotation.y += delta * ( 1 + 0.5 * ( i % 7 ) ) * 0.2;
		object.rotation.z += delta * ( 1 + 0.5 * ( i % 8 ) ) * 0.3;

		if ( object.position.y > 5 ) {

			object.position.y = - 5;

		}

	}

	renderer.render( scene, camera );

	const drawCalls = renderer.info.render.calls;
	const triangles = renderer.info.render.triangles;

	document.getElementById( 'info' ).innerHTML = `DrawCalls: ${ drawCalls }, Triangles: ${ triangles }`;

}
