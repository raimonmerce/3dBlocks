import ObjectBody from './ObjectBody.js';

export default class Block extends ObjectBody {
    constructor(properties) {
        super(properties, 'Block');
        this.setNewProperties(properties.state)
        this.tiles = []
    }

    addTiles(tiles){
        this.tiles = tiles
    }

    setNewProperties(state){
        switch (state) {
            case 'ghost':
                this.properties.color = 0xFF7000
                this.properties.opacity = 0.8
                break;
            case 'empty':
                this.properties.color = 0xaaaaaa
                this.properties.opacity = 0.2
                break;
            case 'fill':
                this.properties.color = 0x006BFF
                this.properties.opacity = 1.0
                break;
            case 'ghostPiece':
                this.properties.color = 0x34eb6b
                this.properties.opacity = 0.8
                break;
            case 'piece':
                this.properties.color = 0x11993a
                this.properties.opacity = 1.0
                break;
          }
    }



    setNewState(state) {
        //Update state, color etc of block
    }
}