import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import ViewMediator from './ViewMediator.js';

export default class GameViewMediator extends ViewMediator {
    constructor(piece, mediatorFactory) {
        super(piece, mediatorFactory);
        this.object.addObserver("ScenarioCreated", (e) => this.onScenarioCreated(e));

    }

    onScenarioCreated(e) {
        this.addChild(e.scenario);
    }
}