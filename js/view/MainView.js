import GameViewMediator from './mediator/GameViewMediator.js';
import ViewMediatorFactory from './ViewMediatorFactory.js';
import RenderingContext from './RenderingContext.js';


import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';


export default class MainView {
    constructor(controller, game) {
        this.controller = controller;
        this.game = game;
        this.renderingContext = this.createRenderingContext();
        this.gameViewMediator = new GameViewMediator(game, new ViewMediatorFactory());
        //this.objectPicker = new ObjectPicker(this.gameViewMediator, this.renderingContext);
        //this.descriptionPanel = new DescriptionPanel();
    }

    createRenderingContext() {
        const domContainer = document.querySelector('#mainCanvas');
        let numCanvas = 3;
        let containers = []
        for ( let i = 0; i < numCanvas; i ++ ) {
            containers.push( document.querySelector( '#p' + i ));
        } 

        return RenderingContext.getDefault(domContainer, containers);
    }

    initialize() {
        const scene = this.renderingContext.scene;
        const scenes = this.renderingContext.scenes;
        const object3D = this.gameViewMediator.object3D;
        scene.add(object3D);

        const axesHelper = new THREE.AxesHelper(100); // The argument is the size of the axes
        scene.add(axesHelper);

        /*
        const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
        const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
        let cubeTmp = new THREE.Mesh( geometry, material )
        scene.add(cubeTmp);

        this.objectPicker.initialize();
        this.objectPicker.addObserver('doubleclick', (e) => this.controller.onDoubleClick(e.astronomicalBody));
        this.objectPicker.addObserver('click', (e) => this.controller.onClick(e.astronomicalBody));
        this.objectPicker.addObserver('mousemove', (e) => this.controller.onMouseMove(e.astronomicalBody));

        */

        window.addEventListener( 'resize', (e) => this.onWindowResize(), false );
        this.render();
    }

    render() {
        this.renderingContext.controls.update();
        requestAnimationFrame(() => this.render());

        this.gameViewMediator.onFrameRenderered();
        this.renderingContext.renderer.render(this.renderingContext.scene, this.renderingContext.camera);
    }

    onWindowResize(){
        this.renderingContext.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderingContext.camera.updateProjectionMatrix();

        this.renderingContext.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.objectPicker.notifyWindowResize();
    }
}