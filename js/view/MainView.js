import GameViewMediator from './mediator/GameViewMediator.js';
import ViewMediatorFactory from './ViewMediatorFactory.js';
import RenderingContext from './RenderingContext.js';
import config from '../config.js';

import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import PieceViewMediator from './mediator/PieceViewMediator.js';


export default class MainView {
    constructor(controller, game) {
        this.controller = controller;
        this.game = game;
        this.renderingContext = this.createRenderingContext();
        //this.scenarioViewMediator = new ScenarioViewMediator(game.scenario, new ViewMediatorFactory());
        this.gameViewMediator = new GameViewMediator(game, new ViewMediatorFactory());

        //this.objectPicker = new ObjectPicker(this.gameViewMediator, this.renderingContext);
        //this.descriptionPanel = new DescriptionPanel();
    }

    createRenderingContext() {
        const domContainer = document.querySelector('#mainCanvas');
        let containers = []
        for ( let i = 0; i < config.numPieces; i ++ ) {
            containers.push( document.querySelector( '#p' + i ));
        } 
        return RenderingContext.getDefault(domContainer, containers);
    }

    initialize() {
        const scene = this.renderingContext.scene;
        let scenes = this.renderingContext.scenes;
        let pieces = this.game.pieces;
        const object3D = this.gameViewMediator.object3D;
        scene.add(object3D);
        const axesHelper = new THREE.AxesHelper(100); // The argument is the size of the axes
        scene.add(axesHelper);
        
        for (let i = 0; i < config.numPieces; ++i){
            let piece = pieces[i];
            let scenePiece = scenes[i]
            let pieceViewMediator = new PieceViewMediator(piece, new ViewMediatorFactory());
            piece.generateNewPiece();
            let pieceMesh = pieceViewMediator.object3D;
            scenePiece.add(pieceMesh)
        }
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
        let renderer = this.renderingContext.renderer;
        let camera = this.renderingContext.camera;

        renderer.setScissorTest( false );
        renderer.clear();
      
        renderer.setClearColor( 0xe0e0e0 );
        renderer.setScissorTest( true );
        
        renderer.setScissor( 0, 0, window.innerWidth, window.innerHeight );
        renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
        renderer.render(this.renderingContext.scene, camera);
        
        let scenes = this.renderingContext.scenes; 

        for (let i = 0; i < config.numPieces; ++i){
            let scene = scenes[i];
            const rect = scene.userData.element.getBoundingClientRect();
            //console.log(rect)
            // check if it's offscreen. If so skip it
            if ( rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
               rect.right < 0 || rect.left > renderer.domElement.clientWidth ) {
              return; // it's off screen
        
            }
            
            // set the viewport
            const width = rect.right - rect.left;
            const height = rect.bottom - rect.top;
            const left = rect.left;
            const bottom = renderer.domElement.clientHeight - rect.bottom;
            renderer.setScissor( left, bottom, width, height );
            renderer.setViewport( left, bottom, width, height );
            
            let cameraScene = camera.clone();
            cameraScene.zoom = 5.0; 
            cameraScene.updateProjectionMatrix();
            renderer.render( scene, cameraScene );
        }        
    }

    onWindowResize(){
        this.renderingContext.camera.aspect = window.innerWidth / window.innerHeight;
        this.renderingContext.camera.updateProjectionMatrix();

        this.renderingContext.renderer.setSize(window.innerWidth, window.innerHeight);
        //this.objectPicker.notifyWindowResize();
    }
}