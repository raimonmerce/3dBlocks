import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import ViewMediator from './ViewMediator.js';

export default class ScenarioViewMediator extends ViewMediator {
    constructor(scenario, mediatorFactory) {
        super(scenario, mediatorFactory);
        this.object.addObserver("TileCreated", (e) => this.onTileCreated(e));
        this.object.addObserver("BlockCreated", (e) => this.onBlockCreated(e));
    }

    onTileCreated(e) {
        this.addChild(e.tile);
    }

    onBlockCreated(e) {
        this.addChild(e.block);
    }
}