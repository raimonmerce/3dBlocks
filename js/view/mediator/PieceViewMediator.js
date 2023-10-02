import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import ViewMediator from './ViewMediator.js';

export default class PieceViewMediator extends ViewMediator {
    constructor(piece, mediatorFactory) {
        super(piece, mediatorFactory);
        this.object.addObserver("BlockCreatedPiece", (e) => this.onBlockCreatedPiece(e));
        this.object.addObserver("SetPiecePosition", (e) => this.onSetPiecePosition(e));
    }

    onBlockCreatedPiece(e) {
        this.addChild(e.block);
    }

    onSetPiecePosition(e) {
        this.object3D.position.set(e.pos[0], e.pos[1], e.pos[2]);
    }

    
    makeObject3D() {
        /*
        const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        const container = new THREE.Mesh( geometry, material )
        */
        const container = new THREE.Object3D();
        //container.position.set(3, 3, 3);
        return container;
    }
    
    
}