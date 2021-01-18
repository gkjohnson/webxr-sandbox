import {
    Group,
} from '//unpkg.com/three@0.124.0/build/three.module.js';

// Represents the last used gamepad
export class ActiveXRGamepad extends Group {

    constructor( controllers ) {

        super();

        this.controllers = controllers;
        this.activeController = controllers[ 0 ];
        this.disposeCallbacks = [];

        const disposeCallbacks = this.disposeCallbacks;
        for ( let i = 0, l = controllers.length; i < l; i ++ ) {

            const controller = controllers[ i ];

            const forwardCallback = e => {

                if ( controller === this.activeController ) {

                    this.dispatchEvent( e );

                }

            };
            const checkActiveCallback = e => {

                if ( this.activeController !== controller ) {

                    this.activeController = controller;

                } else {

                    forwardCallback( e );

                }

            };

            controller.addEventListener( 'connected', forwardCallback );
            controller.addEventListener( 'disconnected', forwardCallback );

            controller.addEventListener( 'pressed', checkActiveCallback );
            controller.addEventListener( 'released', checkActiveCallback );
            controller.addEventListener( 'selectstart', checkActiveCallback );
            controller.addEventListener( 'selectend', checkActiveCallback );

            disposeCallbacks.push( () => {

                controller.removeEventListener( 'connected', forwardCallback );
                controller.removeEventListener( 'disconnected', forwardCallback );

                controller.removeEventListener( 'pressed', checkActiveCallback );
                controller.removeEventListener( 'released', checkActiveCallback );
                controller.removeEventListener( 'selectstart', checkActiveCallback );
                controller.removeEventListener( 'selectend', checkActiveCallback );

            } );

        }

    }

    update() {

        this.position.copy( activeController.position );
        this.quaternion.copy( activeController.quaternion );
        this.scale.copy( activeController.scale );

    }

    getAxis( name ) {

        return this.activeController.getAxis( name );

    }

    getButtonValue( name ) {

        return this.activeController.getButtonValue( name );

    }

    getButtonHeld( name ) {

        return this.activeController.getButtonHeld( name );

    }

    getButtonPressed( name ) {

        return this.activeController.getButtonPressed( name );

    }

    dispose() {

        this.disposeCallbacks.forEach( cb => cb() );

    }

}
