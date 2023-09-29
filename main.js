import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import {DragControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/DragControls.js';
import Game from './js/model/Game.js';
import GameController from './js/controller/GameController.js';


const game = new Game();
const gameController = new GameController(game);

game.createScenario();

//Old code
let work = false;

let renderer;
let canvas;
let camera;
let scene;
let controls;
let controlsDrag;
let selectedObject = null;
let selectedScene = null;

let grid = [];
const numObjects = 3;
let draggedObject;
let objects = [];
let walls = {};
let dragging = false;
let lastPositions = [];

let colorPlaneEmpty = 0xffffff;
let colorPlaneGhost = 0xFF7000;
let colorGridEmpty = 0xaaaaaa;
let colorGridFull = 0x006BFF;
let colorGridGhost = 0xFF7000;
let colorEmissive = 0xaaaaaa; 

let zoomDist = 0.0;

let cubeSize = 6;

let windowHeight
let windowWidth

const scenes = [];

function getLight(sceneLight){
    let color = 0xFFFFFF;
    let intensity = 1;
    let light = new THREE.DirectionalLight(color, intensity);
    light.position.set(cubeSize + 1, cubeSize + 1, cubeSize + 1);
    sceneLight.add(light)
    light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, -1, -1);
    sceneLight.add( light );
    return sceneLight;
  }

function declareCamera(){
    camera = new THREE.OrthographicCamera(
      windowWidth / -100,
      windowWidth / 100,
      windowHeight / 100,
      windowHeight / -100,
      1, // Near clipping plane
      1000 // Far clipping plane
    );
  
    camera.position.set(cubeSize*2, cubeSize*2, cubeSize*2);
    camera.lookAt(cubeSize/2, cubeSize/2, cubeSize/2);
  }
  
  function declareControls(){
    controls = new OrbitControls(camera, canvas);
    controls.target.set(cubeSize/2, cubeSize/2, cubeSize/2);
    controls.mouseButtons = {
      RIGHT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      LEFT: THREE.MOUSE.PAN
    }
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.update();
  }

  function peaceCanvas(){
    let numCanvas = 3;
    for ( let i = 0; i < numCanvas; i ++ ) {
      let sceneTmp = new THREE.Scene();
      sceneTmp.userData.element = document.querySelector( '#p' + i );
      const camera = new THREE.OrthographicCamera(
        windowWidth / -100,
        windowWidth / 100,
        windowHeight / 100,
        windowHeight / -100,
        1,
        1000
      );
      camera.position.set(cubeSize*2, cubeSize*2, cubeSize*2);
      camera.lookAt(cubeSize/2, cubeSize/2, cubeSize/2);
      sceneTmp.userData.camera = camera;
  
      const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
      const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
      let cubeTmp = new THREE.Mesh( geometry, material )
      sceneTmp.add(cubeTmp);
      sceneTmp = getLight(sceneTmp);
      //sceneTmp.background = null;
      //sceneTmp.setClearColor( 0x000000, 0 );
      let sceneDict = {
          "scene" : sceneTmp, 
          "position" : cubeTmp.position.clone()
        }
  
      scenes.push(sceneDict);
      console.log(sceneDict)
      let divPeace = document.getElementById("thumb" + i);
      divPeace.onmousedown = function() {
        grabPeace(cubeTmp, sceneDict);
      };
    }
  }

function main() {
    canvas = document.querySelector('#mainCanvas');

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor( 0x000000, 0 );
    
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    
    declareCamera();
    declareControls();
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x5F5F5F);
    scene = getLight(scene);

    const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
    let cubeTmp = new THREE.Mesh( geometry, material )
    scene.add(cubeTmp)

    peaceCanvas();

}

function updateSize() {

  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height);
  }
  return needResize;
}

function render() {
  updateSize()
  renderer.setScissorTest( false );
  renderer.clear();

  renderer.setClearColor( 0xe0e0e0 );
  renderer.setScissorTest( true );
  
  renderer.setScissor( 0, 0, windowWidth, windowHeight );
  renderer.setViewport( 0, 0, windowWidth, windowHeight );
  renderer.render(scene, camera);



  scenes.forEach( function ( elementPeace ) {
    const sceneElement = document.querySelector( '#p1');
    
    let scenePeace = elementPeace["scene"]
    const rect = scenePeace.userData.element.getBoundingClientRect();

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
    renderer.render( scenePeace, cameraScene );
  } );
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

if (work){
    main();
    renderer.setSize( windowWidth, windowHeight, false );
    animate();
}
