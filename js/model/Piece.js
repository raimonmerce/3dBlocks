import ObjectBody from './ObjectBody.js';

export default class Piece extends ObjectBody {
    constructor(name, properties) {
        super(name, properties, 'Piece');
        this.state = properties.state;
        this.type = properties.type;
    }
}