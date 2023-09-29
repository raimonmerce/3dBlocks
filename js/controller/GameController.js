import MainView from '../view/MainView.js';

export default class GameController {
    constructor(game) {
        this.game = game;
        this.view = new MainView(this, game);
        this.view.initialize();
    }

    onMouseUp(astronomicalBody) {
        this.setDescriptionPanelText(astronomicalBody, 'Clicked');

        if (astronomicalBody && astronomicalBody.className === 'Planet') {
            astronomicalBody.isMoving = !astronomicalBody.isMoving;
        }
    }

    onMouseDown(astronomicalBody) {
        if (astronomicalBody) {
            const parentElement = astronomicalBody.parent;

            if (parentElement.className === 'Planet') {
                parentElement.removeSatellite(astronomicalBody);
            } else if (parentElement.className === 'SolarSystem') {
                parentElement.removePlanet(astronomicalBody);
            }
        }
    }

    onMouseMove(astronomicalBody) {
        this.setDescriptionPanelText(astronomicalBody, 'Hovered');
    }
}