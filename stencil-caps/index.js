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
	PlaneBufferGeometry,
	TorusKnotBufferGeometry,
	FrontSide,
	BackSide,
	IncrementWrapStencilOp,
	DecrementWrapStencilOp,
	MeshStandardMaterial,
	ZeroStencilOp,
	NotEqualStencilFunc,
	Clock,
	ShadowMaterial,
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import { VRButton } from '//unpkg.com/three@0.124.0/examples/jsm/webxr/VRButton.js';
import { XRGamepad } from '../xr-gamepad/src/XRGamepad.js';
let scene, camera, renderer;
let group, clock, ground;

init();

function init() {

	clock = new Clock();

	scene = new Scene();
	scene.background = new Color( 0x263238 );

	camera = new PerspectiveCamera();
	camera.near = 0.5;
	console.log( camera.near );
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
	directionalLight.shadow.bias = 1e-4;
	directionalLight.shadow.normalBias = 0.01;

	const shadowCam = directionalLight.shadow.camera;
	shadowCam.left = shadowCam.bottom = - 1;
	shadowCam.right = shadowCam.top = 1;
	shadowCam.updateProjectionMatrix();

	scene.add( directionalLight );

	const ambientLight = new AmbientLight( 0xffffff, 0.25 );
	scene.add( ambientLight );

	group = new Group();
	group.position.z = - 0.5;
	scene.add( group );

	const geometry = new TorusKnotBufferGeometry(
		1,
		.3,
		200,
		25,
		2,
		3,
	);
	const frontMesh = new Mesh(
		geometry,
		new MeshStandardMaterial( {
			side: FrontSide,
			color: 0xFFC107,
			stencilWrite: true,
			stencilZPass: IncrementWrapStencilOp,
			stencilZFail: IncrementWrapStencilOp,
		} ),
	);
	frontMesh.castShadow = true;
	frontMesh.receiveShadow = true;
	frontMesh.renderOrder = 1;

	const backMesh = new Mesh(
		geometry,
		new MeshStandardMaterial( {
			side: BackSide,
			colorWrite: false,
			stencilWrite: true,
			stencilZPass: DecrementWrapStencilOp,
			stencilZFail: DecrementWrapStencilOp,
		} ),
	);
	backMesh.castShadow = true;
	backMesh.renderOrder = 1;

	group.add( frontMesh, backMesh );

	const clipPlane = new Mesh(
		new PlaneBufferGeometry(),
		new MeshStandardMaterial( {
			color: 0xE91E63,
			stencilWrite: true,
			stencilFunc: NotEqualStencilFunc,
			stencilRef: 0,
			stencilZPass: ZeroStencilOp,
			stencilZFail: ZeroStencilOp,
			stencilFail: ZeroStencilOp,
			depthTest: false,
		} ),
	);
	clipPlane.position.z = - camera.near - 1e-5;
	clipPlane.renderOrder = 2;
	camera.add( clipPlane );

	ground = new Mesh(
		new PlaneBufferGeometry(),
		new ShadowMaterial( { opacity: 0.25 } ),
	);
	ground.receiveShadow = true;
	ground.rotation.x = - Math.PI / 2;
	ground.scale.setScalar( 10 );
	window.ground = ground;
	scene.add( ground );

	// vr
	renderer.xr.enabled = true;
	renderer.setAnimationLoop( render );
	document.body.appendChild( VRButton.createButton( renderer ) );

	const controller0 = new XRGamepad( renderer.xr, 0 );
	const controller1 = new XRGamepad( renderer.xr, 1 );
	scene.add( controller0, controller1 );

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

	if ( renderer.xr.isPresenting ) {

		const xrCamera = renderer.xr.getCamera( camera );
		xrCamera.near = camera.near;
		xrCamera.cameras.forEach( c => {

			c.near = camera.near;

		} );

	}

	group.rotation.y += clock.getDelta() * 1;
	group.position.y = 1;
	group.scale.setScalar( 0.25 );
	renderer.render( scene, camera );

}
