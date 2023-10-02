import ObjectBody from './ObjectBody.js';
import Scenario from './Scenario.js';
import Piece from './Piece.js';
import config from '../config.js';

export default class Game extends ObjectBody {
    constructor(properties = {}) {
        super(properties, 'Game');
        this.scenario = null;
        this.pieces = this.createPieces()
    }

    createScenario() {
        let scenario = new Scenario();
        this.scenario = scenario;
        this.emit('ScenarioCreated', { scenario });
        scenario.createBlocks();
    }

    createPieces() {
        let pieces = []
        for (let i = 0; i < config.numPieces; ++i){
            let piece = new Piece({state: "normal"});
            pieces.push(piece)
        }
        return pieces;
    }
}