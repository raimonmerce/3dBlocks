import ObjectBody from './ObjectBody.js';

export default class Tile extends ObjectBody {
    constructor(properties = {}) {
        super(properties, 'Tile');
        this.state = properties.state;
        this.type = properties.type;
    }

    getColor() {
        return this.color;
    }

    getGhostColor() {
        return this.ghostColor;
    }

    getColorFromLevel(level) {
        return 0xffffff;
    }

    setLevel(level) {
        this.level = level;
        let color = getColorFromLevel(level)
        this.emit('ColorSetted', { color });
    }

    setColor(color) {
        this.color = color;
        this.emit('ColorSetted', { color });
    }
}