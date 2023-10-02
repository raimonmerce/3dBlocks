import ObjectBody from './ObjectBody.js';
import Block from './Block.js';
import config from '../config.js';

export default class Piece extends ObjectBody {
    constructor(properties) {
        super(properties, 'Piece');
        this.blocks = [];
        this.state = properties.state;
    }

    getRandomNumber(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getMaxMin(block, pos){
        if (block[0] < pos[0]) pos[0] = block[0];
        if (block[0] > pos[1]) pos[1] = block[0];
        if (block[1] < pos[2]) pos[2] = block[1];
        if (block[1] > pos[3]) pos[3] = block[1];
        if (block[2] < pos[4]) pos[4] = block[2];
        if (block[2] > pos[5]) pos[5] = block[2];
        return pos;
    }

    isIn(item, array){
        for (let i = 0; i < array.length; ++i){
            let it = array[i]
            if (item[0] == it[0] && item[1] == it[1] && item[2] == it[2]) return true;
        }
        return false;
    }

    generateNewPiece(){
        this.blocks = [];
        let numberBlocks = this.getRandomNumber(1,config.pieceSize);
        let blocksList = [[0,0,0]]
        let availableBlocks = [[0,0,1], [0,0,-1], [0,1,0], [0,-1,0], [1,0,0], [-1,0,0]]
        
        let block = new Block({state : "piece", x: 0, y: 0, z: 0});
        this.blocks.push(block);
        this.emit('BlockCreatedPiece', { block });

        let posMm = [0,0,0,0,0,0] // minX, maxX, minY, maxY, minZ, maxZ
      
        for (let i = 0; i < numberBlocks - 1; i++){
            let index = this.getRandomNumber(0, availableBlocks.length - 1);
            let newblock = availableBlocks[index];
            posMm = this.getMaxMin(newblock, posMm)
            availableBlocks.splice(index, 1);
            blocksList.push(newblock);
        
            let adjacents = [
                [newblock[0],newblock[1],newblock[2] + 1], 
                [newblock[0],newblock[1],newblock[2] - 1], 
                [newblock[0],newblock[1] + 1,newblock[2]], 
                [newblock[0],newblock[1] - 1,newblock[2]],  
                [newblock[0] + 1,newblock[1],newblock[2]], 
                [newblock[0] - 1,newblock[1],newblock[2]]
            ];
        
            for (let i = 0; i < adjacents.length; ++i){
                let adj = adjacents[i];
                if (!this.isIn(adj, blocksList) && !this.isIn(adj, availableBlocks)) availableBlocks.push(adj)
            }

            block = new Block({state : "piece", x: newblock[0], y: newblock[1], z: newblock[2]});
            this.blocks.push(block);
            this.emit('BlockCreatedPiece', { block });
        }

        let pos = [
            config.cubeSize/2 - (posMm[0] + posMm[1])/2,
            config.cubeSize/2 - (posMm[2] + posMm[3])/2,
            config.cubeSize/2 - (posMm[4] + posMm[5])/2
        ]

        this.emit('SetPiecePosition', { pos });

        /*
        peace.position.set(
          cubeSize/2 - (posMm[0] + posMm[1])/2,
          cubeSize/2 - (posMm[2] + posMm[3])/2,
          cubeSize/2 - (posMm[4] + posMm[5])/2
        )
        */
    }
}