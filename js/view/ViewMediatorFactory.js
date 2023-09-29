import ScenarioViewMediator from './mediator/ScenarioViewMediator.js';
import WallBackgroundViewMediator from './mediator/WallBackgroundViewMediator.js';
import PieceViewMediator from './mediator/PieceViewMediator.js';
import BlockViewMediator from './mediator/BlockViewMediator.js';
import TileViewMediator from './mediator/TileViewMediator.js';

export default class ViewMediatorFactory {
    getMediator(object) {
        switch (object.className) {
            case 'Scenario':
                return new ScenarioViewMediator(object, this);
            case 'WallBackground':
                return new WallBackgroundViewMediator(object, this);
            case 'Piece':
                return new PieceViewMediator(object, this);
            case 'Block':
                return new BlockViewMediator(object, this);
            case 'Tile':
                return new TileViewMediator(object, this);
        }
    }
}
