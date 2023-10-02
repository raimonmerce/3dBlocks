import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import Observable from '../../Observable.js';

export default class ViewMediator extends Observable {
    constructor(object, mediatorFactory) {
        super();
        this.object = object;
        this.mediatorFactory = mediatorFactory;
        this.object3D = this.makeObject3D();
        //this.object3D.name = object.name;
        this.childMediators = new Map();
        this.object3D.traverse((object3D) => {
            object3D.mediator = this;
        });
    }

    makeObject3D() {
        const container = new THREE.Object3D();
        return container;
    }

    addChild(child) {
        const mediator = this.mediatorFactory.getMediator(child);
        this.childMediators.set(child, mediator);
        this.object3D.add(mediator.object3D);
        //Mirar
        //mediator.addChild(child);
        /*
        for (const childofChild of child) {
            mediator.addChild(childofChild);
        }
        */
    }

    removeChild(child) {
        const mediator = this.childMediators.get(child);

        if (mediator) {
            this.object3D.remove(mediator.object3D);
            this.childMediators.delete(child);
        }
    }

    onFrameRenderered() {
        for (const childMediator of this.childMediators.values()) {
            childMediator.onFrameRenderered();
        }
    }
}