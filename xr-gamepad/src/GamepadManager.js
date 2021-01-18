import { WrappedGamepad } from './WrappedGamepad.js';

export class GamepadManager {

    constructor() {

        this.controllers = [];

        window.addEventListener( 'gamepadconnected', e => {

            const { gamepad } = e;
            const { controllers } = this;
            if ( ! controllers[ gamepad.index ] ) {

                controllers[ gamepad.index ] = new WrappedGamepad();

            }

            controllers[ gamepad.index ].connect( gamepad );

        } );

        window.addEventListener( 'gamepaddisconnected', e => {


            const { gamepad } = e;
            const { controllers } = this;
            if ( controllers[ gamepad.index ] ) {

                controllers[ gamepad.index ].disconnect();

            }

        } );

    }

    getController( index ) {

        const { controllers } = this;
        if ( ! controllers[ index ] ) {

            const gamepad = navigator.getGamepads()[ index ];
            controllers[ index ] = new WrappedGamepad( gamepad );

        }
        return controllers[ index ];

    }

    update() {

        const { controllers } = this;
        const gamepads = navigator.getGamepads();
        for ( let i = 0, l = controllers.length; i < l; i ++ ) {

            const controller = controllers[ i ];
            if ( controller ) {

                controller.update( gamepads[ i ] );

            }

        }

    }

}
