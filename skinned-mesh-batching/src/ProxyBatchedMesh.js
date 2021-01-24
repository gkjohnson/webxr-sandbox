import {
	Bone,
	SkinnedMesh,
	Group,
	BufferAttribute,
	Skeleton,
	Box3,
	Matrix4,
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

			geometry = new Box3();

		}

		if ( frustumCulled ) {

			const box = geometry.boundingBox;
			box.makeEmpty();

			for ( let i = 0, l = proxied.length; i < l; i ++ ) {

				box.expandByObject( proxied[ i ] );

			}
			inverseMatrix.copy( matrixWorld ).invert();
			box.applyMatrix4( inverseMatrix );

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
		matrixWorld.copy( proxied.matrixWorld );

	}

}

export class ProxyBatchedMesh extends Group {

	get visible() {

		return this.proxied.visible;

	}

	set visible( v ) {

		this.proxied.visible = v;

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

			const bones = [];
			const geometries = meshes.map( ( mesh, index ) => {

				const geometry = mesh.geometry.clone();
				geometry.applyMatrix4( mesh.matrixWorld );

				const count = geometry.attributes.position.count;
				geometry.addBufferAttribute(
					'skinIndex',
					new BufferAttribute( new Uint8Array( count * 4 ).fill( index ) ),
				);
				geometry.addBufferAttribute(
					'skinWeight',
					new BufferAttribute( new Uint8Array( count * 4 ).fill( 0.25 ) ),
				);

				const bone = new ProxyBone( mesh );
				bones.push( bone );

				return geometry;

			} );
			const mergedGeometry = BufferGeometryUtils.mergeBufferGeometry( geometries );

			const skeleton = new Skeleton( bones );
			const skinnedMesh = new ProxySkinnedMesh( material, mergedGeometry, meshes );
			skinnedMesh.bind( skeleton );

			this.add( skinnedMesh, ...bones );

		} );

	}

	updateMatrixWorld( ...args ) {

		const { proxied } = this;
		if ( proxied.parent && proxied.parent !== this ) {

			console.warn( 'ProxyBatchedMesh : Proxy mesh is not expected to have parent.' );

		}

		this.updateWorldMatrix( false, false );
		proxied.updateMatrixWorld( ...args );
		return this.updateMatrixWorld( ...args );

	}

}
