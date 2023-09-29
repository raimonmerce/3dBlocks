import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import ViewMediator from './ViewMediator.js';

export default class BlockViewMediator extends ViewMediator {
    constructor(block, mediatorFactory) {
        super(block, mediatorFactory);
        this.object.addObserver("NewState", (e) => this.onNewState(e));
    
    }

    createBoxWithRoundedEdges() {
        let width = 0.95;
        let height = 0.95;
        let depth = 0.95;
        let radius0 = .15;
        let smoothness = 2;

        let shape = new THREE.Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
        shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
        shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
        shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
        let geometry = new THREE.ExtrudeBufferGeometry( shape, {
          depth: depth - radius0 * 2,
          bevelEnabled: true,
          bevelSegments: smoothness * 2,
          steps: 1,
          bevelSize: radius,
          bevelThickness: radius0,
          curveSegments: smoothness
        });
        geometry.center();
        return geometry;
    };

    makeObject3D() {
        const container = new THREE.Mesh(
            this.createBoxWithRoundedEdges(),
            new THREE.MeshPhongMaterial({
                color: this.object.properties.color,
                transparent: true,
                opacity: this.object.properties.opacity
            })
        );
        container.position.set(this.object.properties.x, this.object.properties.y, this.object.properties.z);
        return container;
    }

    onNewState(e) {
        this.object3D.material.color = e.color;
        this.object3D.material.opacity = e.opacity;
    }
}