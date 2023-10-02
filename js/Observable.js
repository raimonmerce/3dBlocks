import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
export default class Observable {
    constructor() {
        this.observers = new Map();
    }

    addObserver(label, callback) {
        this.observers.has(label) || this.observers.set(label, []);
        this.observers.get(label).push(callback);
    }

    emit(label, e) {
        //console.log("emit")
        //console.log(e)
        //console.log(this.observers)
        const observers = this.observers.get(label);

        if (observers && observers.length) {
            observers.forEach((callback) => {
                callback(e);
            });
        }
    }

}