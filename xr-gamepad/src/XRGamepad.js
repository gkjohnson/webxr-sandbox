import {
    Group,
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import {
    XRControllerModelFactory,
} from '//unpkg.com/three@0.124.0/examples/jsm/webxr/XRControllerModelFactory.js';
import {
    WrappedGamepad
} from './WrappedGamepad.js';

export class XRGamepad extends Group {

    get showControllerModel() {

        return this.grip.visible;

    }

    set showControllerModel( v ) {

        this.grip.visible = v;

    }

    get connected() {

        return ! ! this.gamepad;

    }

    constructor( xrManager, index ) {

        super();

        const grip = xrManager.getControllerGrip( index );
        const controller = xrManager.getController( index );

        // TODO: how do we position this as expected
        const modelRoot = new XRControllerModelFactory().createControllerModel( grip );
        grip.add( modelRoot );
        this.add( grip );

        controller.addEventListener( 'connected', e => {

            const gamepad = new WrappedGamepad( e.data.gamepad );
            gamepad.addEventListener( 'pressed', e => this.dispatchEvent( e ) );
            gamepad.addEventListener( 'released', e => this.dispatchEvent( e ) );
            gamepad.addEventListener( 'axis-pressed', e => this.dispatchEvent( e ) );
            gamepad.addEventListener( 'axis-released', e => this.dispatchEvent( e ) );

            this.targetRayMode = e.data.targetRayMode;
            this.hand = e.data.handedness;
            this.gamepad = gamepad;

            this.dispatchEvent( e );

        } );

        controller.addEventListener( 'disconnected', e => {

            this.targetRayMode = null;
            this.hand = 'none';
            this.gamepad = null;

            this.dispatchEvent( e );

        } );

        controller.addEventListener( 'selectstart', e => {

            this.dispatchEvent( e );

        } );

        controller.addEventListener( 'selectend', e => {

            this.dispatchEvent( e );

        } );

        this.index = index;
        this.grip = grip;
        this.controller = controller;
        this.hand = 'none';
        this.gamepad = null;
        this.targetRayMode = null;

    }

    update() {

        const { controller, gamepad } = this;
        if ( gamepad ) {

            gamepad.update();

        }

        this.position.copy( controller.position );
        this.quaternion.copy( controller.quaternion );
        this.scale.copy( controller.scale );

    }

    getAxis( name ) {

        return this.gamepad.getAxis( name );

    }

    getButtonValue( name ) {

        return this.gamepad.getButtonValue( name );

    }

    getButtonHeld( name ) {

        return this.gamepad.getButtonHeld( name );

    }

    getButtonPressed( name ) {

        return this.gamepad.getButtonPressed( name );

    }

}
