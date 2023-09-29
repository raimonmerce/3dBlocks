import ObjectBody from './ObjectBody.js';
import Block from './Block.js';
import Tile from './Tile.js';
import config from '../config.js';

export default class Scenario extends ObjectBody {
    constructor(properties = {}) {
        super(properties, 'Scenario');
        this.grid = [];
        this.xy = {};
        this.xz = {};
        this.yz = {};
        this.cubeSize = config.cubeSize;
    }

    createWalls(x, y, z){
        let tiles = []

        //XY
        let keyXY = x + '_' + y; 
        let tile = this.xy[keyXY]
        if (!tile) {
            tile = new Tile({state : "empty", type : "xy", x: x, y: y, z: -10});
            this.emit('TileCreated', { tile });
            this.xy[keyXY] = tile 
        }
        tiles.push(tile)

        //XZ
        let keyXZ = x + '_' + z;
        tile = this.xz[keyXZ] 
        if (!tile) {
            tile = new Tile({state : "empty", type : "xz", x: x, y: -10, z: z});
            this.emit('TileCreated', { tile });
            this.xz[keyXZ] = tile
        }
        tiles.push(tile)

        //YY
        let keyYZ = y + '_' + z; 
        tile = this.yz[keyYZ] 
        if (!tile) {
            tile = new Tile({state : "empty", type : "yz", x: -10, y: y, z: z});
            this.emit('TileCreated', { tile });
            this.yz[keyYZ] = tile
        }
        tiles.push(tile)
    }

    createBlocks(){
        for(let x=0; x < this.cubeSize; x++) {
            this.grid[x] = [];
            for(let y=0; y < this.cubeSize; y++) {
                this.grid[x][y] = [];
                for(let z=0; z < this.cubeSize; z++) {
                    let tiles = this.createWalls(x, y, z)
                    let block = new Block({state : "empty", x: x, y: y, z: z});
                    block.addTiles(tiles);
                    this.grid[x][y][z] = block;
                    this.emit('BlockCreated', { block });
                }
            }
        }
    }
}
