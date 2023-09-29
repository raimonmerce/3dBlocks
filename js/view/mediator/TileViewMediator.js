import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import ViewMediator from './ViewMediator.js';
import config from '../../config.js';

export default class TileViewMediator extends ViewMediator {
    constructor(tile, mediatorFactory) {
        super(tile, mediatorFactory);
    }

    roundedRectangle( w, h, r, s ) { // width, height, radius corner, smoothness  
        // helper const's
        const wi = w / 2 - r;		// inner width
        const hi = h / 2 - r;		// inner height
        const w2 = w / 2;			// half width
        const h2 = h / 2;			// half height
        const ul = r / w;			// u left
        const ur = ( w - r ) / w;	// u right
        const vl = r / h;			// v low
        const vh = ( h - r ) / h;	// v high
        
        let positions = [
            -wi, -h2, 0,  wi, -h2, 0,  wi, h2, 0,
            -wi, -h2, 0,  wi,  h2, 0, -wi, h2, 0,
            -w2, -hi, 0, -wi, -hi, 0, -wi, hi, 0,
            -w2, -hi, 0, -wi,  hi, 0, -w2, hi, 0,
             wi, -hi, 0,  w2, -hi, 0,  w2, hi, 0,
             wi, -hi, 0,  w2,  hi, 0,  wi, hi, 0
            
        ];
        
        let uvs = [
            ul,  0, ur,  0, ur,  1,
            ul,  0, ur,  1, ul,  1,
             0, vl, ul, vl, ul, vh,
             0, vl, ul, vh,  0, vh,
            ur, vl,  1, vl,  1, vh,
            ur, vl,  1, vh,	ur, vh 
        ];
        
        let phia = 0; 
        let phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
        
        for ( let i = 0; i < s * 4; i ++ ) {
            phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
            cosa = Math.cos( phia );
            sina = Math.sin( phia );
            cosb = Math.cos( phib );
            sinb = Math.sin( phib );

            xc = i < s || i >= 3 * s ? wi : - wi;
            yc = i < 2 * s ? hi : -hi;
        
            positions.push( xc, yc, 0, xc + r * cosa, yc + r * sina, 0,  xc + r * cosb, yc + r * sinb, 0 );
            
            uc =  i < s || i >= 3 * s ? ur : ul;
            vc = i < 2 * s ? vh : vl;
            
            uvs.push( uc, vc, uc + ul * cosa, vc + vl * sina, uc + ul * cosb, vc + vl * sinb );
            
            phia = phib;
                
        }
        
        const geometry = new THREE.BufferGeometry( );
        geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
        geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );
        
        return geometry;
    };

    makeObject3D() {
        const container = new THREE.Object3D();
        const back = new THREE.Mesh(
            this.roundedRectangle(0.95,0.95,0.2,4),
            new THREE.MeshPhongMaterial({
                //color: this.object.properties.color
                color: 0xffffff
            })
        );
        const front = new THREE.Mesh(
            this.roundedRectangle(0.95,0.95,0.2,4),
            new THREE.MeshPhongMaterial({
                //color: this.object.properties.color
                color: 0x000000
            })
        );

        let cubeSize = config.cubeSize;
        if (this.object.type == "xy") {
            back.rotation.set(0, 0, 0);
            front.rotation.set(Math.PI, 0, 0);
            back.position.set(this.object.properties.x, this.object.properties.y, -cubeSize);
            front.position.set(this.object.properties.x, this.object.properties.y, cubeSize*2);
        } else if(this.object.type == "xz"){
            back.rotation.set(-Math.PI / 2, 0, 0);
            front.rotation.set(Math.PI / 2, 0, 0);
            back.position.set(this.object.properties.x, -cubeSize, this.object.properties.z);
            front.position.set(this.object.properties.x, cubeSize*2, this.object.properties.z);
        } else {
            back.rotation.set(0, Math.PI / 2, 0);
            front.rotation.set(0, -Math.PI / 2, 0);
            back.position.set(-cubeSize, this.object.properties.y, this.object.properties.z);
            front.position.set(cubeSize*2, this.object.properties.y, this.object.properties.z);
        }

        container.add(back)
        container.add(front)
        return container;
    }

}