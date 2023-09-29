import ObjectBody from './ObjectBody.js';
import Scenario from './Scenario.js';
import WallBackground from './WallBackground.js';

export default class Game extends ObjectBody {
    constructor(properties = {}) {
        super(properties, 'Game');
        this.scenario = null;
        this.walls = [];
        this.scenes = []
    }

    createScenario() {
        let scenario = new Scenario();
        this.scenario = scenario;
        this.emit('ScenarioCreated', { scenario });
        scenario.createBlocks();
    }
}