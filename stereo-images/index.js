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
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import { VRButton } from '//unpkg.com/three@0.124.0/examples/jsm/webxr/VRButton.js';
import { GUI } from '//unpkg.com/three@0.124.0/examples/jsm/libs/dat.gui.module.js';
import { XRGamepad } from '../xr-gamepad/src/XRGamepad.js';
let scene, camera, renderer, workspace;
let controller0, controller1;
let plane0, plane1, planeGroup;
const images = {};

const params = {

	image: 'apollo',

};

const tempEuler = new Euler();
const tempQuaternion = new Quaternion();

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

	new TextureLoader().load( './images/apollo.jpg', tex => {

		const tex0 = tex.clone();
		tex0.repeat.x = 0.5;
		tex0.needsUpdate = true;

		const tex1 = tex.clone();
		tex1.repeat.x = 0.5;
		tex1.offset.x = 0.5;
		tex1.needsUpdate = true;

		images[ 'apollo' ] = [ tex0, tex1 ];

	} );

	new TextureLoader().load( './images/jupiter.jpg', tex => {

		const tex0 = tex.clone();
		tex0.repeat.x = 0.5;
		tex0.needsUpdate = true;

		const tex1 = tex.clone();
		tex1.repeat.x = 0.5;
		tex1.offset.x = 0.5;
		tex1.needsUpdate = true;

		images[ 'jupiter' ] = [ tex0, tex1 ];

	} );

	new TextureLoader().load( './images/mars.jpg', tex => {

		const tex0 = tex.clone();
		tex0.repeat.x = 0.5;
		tex0.needsUpdate = true;

		const tex1 = tex.clone();
		tex1.repeat.x = 0.5;
		tex1.offset.x = 0.5;
		tex1.needsUpdate = true;

		images[ 'mars' ] = [ tex0, tex1 ];

	} );

	planeGroup = new Group();
	scene.add( planeGroup );

	plane0 = new Mesh( new PlaneBufferGeometry(), new MeshBasicMaterial() );
	plane1 = new Mesh( new PlaneBufferGeometry(), new MeshBasicMaterial() );
	planeGroup.add( plane0, plane1 );

	window.plane0 = plane0;
	window.plane1 = plane1;

	// vr
	renderer.xr.enabled = true;
	renderer.setAnimationLoop( render );
	document.body.appendChild( VRButton.createButton( renderer ) );

	controller0 = new XRGamepad( renderer.xr, 0 );
	controller1 = new XRGamepad( renderer.xr, 1 );
	workspace.add( controller0, controller1 );

	const gui = new GUI();
	gui.add( params, 'image', [ 'apollo', 'mars', 'jupiter' ] );

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

	const tex = images[ params.image ];
	if ( tex && plane0.material.map !== tex[ 0 ] ) {

		plane0.material.map = tex[ 0 ];
		plane1.material.map = tex[ 1 ];

		plane0.material.needsUpdate = true;
		plane1.material.needsUpdate = true;

		const aspect = tex[ 0 ].image.width / tex[ 0 ].image.height;
		plane0.scale.set( aspect / 2, 1, 1 );
		plane1.scale.set( aspect / 2, 1, 1 );

	}

	controller0.update();
	controller1.update();

	let targetController = null;
	if ( controller0.selectPressed ) {

		targetController = controller0;

	} else if ( controller1.selectPressed ) {

		targetController = controller1;

	}

	if ( targetController === null ) {

		planeGroup.position.set( 0, 1.5, 0 );
		planeGroup.quaternion.identity();

	} else {

		planeGroup.position.set( 0, 0, - 0.05 );
		targetController.localToWorld( planeGroup.position );

		tempEuler.set( 0, 0, Math.PI / 4 );
		targetController.getWorldQuaternion( tempQuaternion );
		planeGroup.quaternion.setFromEuler( tempEuler ).premultiply( tempQuaternion );

		planeGroup.scale.setScalar( 0.1 );

	}

	renderer.render( scene, camera );

}
