import {
	Bone,
	SkinnedMesh,
	Group,
	BufferAttribute,
	Skeleton,
	Box3,
	Matrix4,
	Sphere,
} from '//unpkg.com/three@0.124.0/build/three.module.js';
import {
	BufferGeometryUtils,
} from '//unpkg.com/three@0.124.0/examples/jsm/utils/BufferGeometryUtils.js';

const inverseMatrix = new Matrix4();
class ProxySkinnedMesh extends SkinnedMesh {

	constructor( geometry, material, meshes ) {

		super( geometry, material );
		this.proxied = meshes;

	}

	raycast( ...args ) {

		const { proxied } = this;
		for ( let i = 0, l = proxied.length; i < l; i ++ ) {

			const mesh = proxied[ i ];
			mesh.raycast( ...args );

		}

	}

	updateMatrixWorld( ...args ) {

		super.updateMatrixWorld( ...args );

		const { geometry, matrixWorld, proxied, frustumCulled } = this;
		if ( ! geometry.boundingBox ) {

			geometry.boundingBox = new Box3();

		}

		if ( ! geometry.boundingSphere ) {

			geometry.boundingSphere = new Sphere();

		}

		if ( frustumCulled ) {

			const box = geometry.boundingBox;
			box.makeEmpty();

			for ( let i = 0, l = proxied.length; i < l; i ++ ) {

				box.expandByObject( proxied[ i ] );

			}
			inverseMatrix.copy( matrixWorld ).invert();
			box.applyMatrix4( inverseMatrix );
			box.getBoundingSphere( geometry.boundingSphere );

		}

	}

}

class ProxyBone extends Bone {

	constructor( proxied ) {

		super();
		this.proxied = proxied;

	}

	updateMatrixWorld() {

		const { matrixWorld, proxied } = this;
		proxied.updateMatrixWorld( true );
		matrixWorld.copy( proxied.matrixWorld );

	}

}

export class ProxyBatchedMesh extends Group {

	get visible() {

		return this.proxied.visible;

	}

	set visible( v ) {

		if ( this.proxied ) {

			this.proxied.visible = v;

		}

	}

	constructor( root ) {

		super();

		if ( root.parent ) {

			throw new Error( 'ProxyBatchedMesh : Proxied root is not expected to have a parent.' );

		}

		// Set it's parent to this so the matrix world computations
		// account for this transform.
		root.parent = this;
		this.proxied = root;

		// Find all shared materials
		const materialToMeshes = new Map();
		root.updateMatrixWorld( true );
		root.traverse( c => {

			if ( c.isMesh ) {

				const material = c.material;
				if ( Array.isArray( material ) ) {

					throw new Error( 'ProxyBatchedMesh : Material arrays not supported.' );

				}

				if ( ! materialToMeshes.get( material ) ) {

					materialToMeshes.set( material, [] );

				}

				materialToMeshes.get( material ).push( c );

			}

		} );

		// Merge all geometries with common materials into a single proxy skinned mesh
		materialToMeshes.forEach( ( meshes, material ) => {

			const weightCons = meshes.length > 256 ? Uint16Array : Uint8Array;
			const bones = [];
			const geometries = meshes.map( ( mesh, index ) => {

				const geometry = mesh.geometry.clone();
				const count = geometry.attributes.position.count;

				const weights = new Uint8Array( count * 4 );
				for ( let i = 0, l = weights.length; i < l; i ++ ) {

					const i4 = i * 4;
					weights[ i4 ] = 255;
					weights[ i4 + 1 ] = 0;
					weights[ i4 + 2 ] = 0;
					weights[ i4 + 3 ] = 0;

				}
				geometry.setAttribute(
					'skinWeight',
					new BufferAttribute( weights, 4, true ),
				);
				geometry.setAttribute(
					'skinIndex',
					new BufferAttribute( new weightCons( count * 4 ).fill( index ), 4 ),
				);

				const bone = new ProxyBone( mesh );
				bones.push( bone );

				return geometry;

			} );

			material.skinning = true;
			const skeleton = new Skeleton( bones );
			const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries( geometries );
			const skinnedMesh = new ProxySkinnedMesh( mergedGeometry, material, meshes );
			skinnedMesh.bind( skeleton );

			skinnedMesh.add( ...bones );
			this.add( skinnedMesh );

		} );

	}

	updateMatrixWorld( ...args ) {

		const { proxied } = this;
		if ( proxied.parent && proxied.parent !== this ) {

			console.warn( 'ProxyBatchedMesh : Proxy mesh is expected to not have parent.' );

		}

		if ( proxied.parent === null ) {

			proxied.parent = this;

		}
		this.updateWorldMatrix( false, false );
		proxied.updateMatrixWorld( ...args );
		return super.updateMatrixWorld( ...args );

	}

}
