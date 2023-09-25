import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import {DragControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/DragControls.js';

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
let roundedBoxGeometry = createBoxWithRoundedEdges(0.95, 0.95, 0.95, .15, 2);
let lastPositions = [];

let colorPlaneEmpty = 0xffffff;
let colorPlaneGhost = 0xFF7000;
let colorGridEmpty = 0xaaaaaa;
let colorGridFull = 0x006BFF;
let colorGridGhost = 0xFF7000;
let colorEmissive = 0xaaaaaa; 

let zoomDist = 0.0;


//Camera settings
let perspective = false;
//Perspective
let fov = 40;
let aspect = 2;
let near = 0.1;
let far = 1000;
//Orthgrafic

let vectorZoom = new THREE.Vector3(0, 0, 0);


let cubeSize = 6;

let windowHeight
let windowWidth

const scenes = [];

function addObject(x, y, z, rx, ry, rz, geometry, material) {
  var obj = new THREE.Mesh(geometry, material);
  obj.rotation.x = rx;
  obj.rotation.y = ry;
  obj.rotation.z = rz;

  obj.position.x = x;
  obj.position.y = y;
  obj.position.z = z;
  return obj;
}

function getGrid(){
  for(let x=0; x < cubeSize; x++) {
    grid[x] = [];
    for(let y=0; y < cubeSize; y++) {
      grid[x][y] = [];
      for(let z=0; z < cubeSize; z++) {
        grid[x][y][z] = 0;
      }
    }
  }
  return grid;
}

function gerRandomNumber(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isIn(item, array){
  for (let i = 0; i < array.length; ++i){
    let it = array[i]
    if (item[0] == it[0] && item[1] == it[1] && item[2] == it[2]) return true;
  }
  return false;
}

function getMaxMin(block, pos){
  if (block[0] < pos[0]) pos[0] = block[0];
  if (block[0] > pos[1]) pos[1] = block[0];
  if (block[1] < pos[2]) pos[2] = block[1];
  if (block[1] > pos[3]) pos[3] = block[1];
  if (block[2] < pos[4]) pos[4] = block[2];
  if (block[2] > pos[5]) pos[5] = block[2];
  return pos;
}

function generatePeace(){
  let peace = new THREE.Object3D();
  let numberBlocks = gerRandomNumber(1,6);
  let blocks = [[0,0,0]]
  let availableBlocks = [[0,0,1], [0,0,-1], [0,1,0], [0,-1,0], [1,0,0], [-1,0,0]]
  let material = new THREE.MeshPhongMaterial({color: 0x00ff00})
  peace.add(new THREE.Mesh(roundedBoxGeometry, material));
  
  let posMm = [0,0,0,0,0,0] // minX, maxX, minY, maxY, minZ, maxZ

  for (let i = 0; i < numberBlocks - 1; i++){
    let index = gerRandomNumber(0, availableBlocks.length - 1);
    let newblock = availableBlocks[index];
    posMm = getMaxMin(newblock, posMm)
    availableBlocks.splice(index, 1);
    blocks.push(newblock);

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
      if (!isIn(adj, blocks) && !isIn(adj, availableBlocks)) availableBlocks.push(adj)
    }

    let block = new THREE.Mesh(roundedBoxGeometry, material);
    block.position.set(newblock[0], newblock[1], newblock[2])
    peace.add(block);
  }

  peace.position.set(
    cubeSize/2 - (posMm[0] + posMm[1])/2,
    cubeSize/2 - (posMm[2] + posMm[3])/2,
    cubeSize/2 - (posMm[4] + posMm[5])/2
  )

  console.log(peace.position)
  return peace;
}

function grabPeace(peace, sceneDic) {
  selectedObject = peace;
  selectedScene = sceneDic;
  peace.position.set(100,100,100)
  scene.add(peace)
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

    let cubeTmp = generatePeace()
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

function onMouseMove(event) {
  if (selectedObject) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
  
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Calculate the intersection point with a plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);

    // Update the position of the selected object
    selectedObject.position.copy(intersection);
  }
}

function onMouseUp() {
  if (selectedScene && selectedObject) {
    console.log(selectedScene)
    selectedObject.position.set(
      selectedScene["position"].x,
      selectedScene["position"].y,
      selectedScene["position"].z
    )
    selectedScene["scene"].add(selectedObject)
    selectedObject = null;
  }
}

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

function defineWalls(){
  for(let i = 0; i < cubeSize; i++) {
    for(let j = 0; j < cubeSize; j++) {
      //xy
      let xy = new THREE.Object3D();
      let tmp = addObject(i, j, -cubeSize, 0, 0, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      xy.add(tmp);
      tmp = addObject(i, j, cubeSize*2, Math.PI, 0, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      xy.add(tmp);
      let dict = {
        "wall": xy,
        deep : 0.0
      };
      walls[`(${i},${j},-1)`] = dict;
      scene.add(xy);

      //xy
      let xz = new THREE.Object3D();
      tmp = addObject(i, -cubeSize, j, -Math.PI / 2, 0, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      xz.add(tmp);
      tmp = addObject(i, cubeSize*2, j, Math.PI / 2, 0, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      xz.add(tmp);
      dict = {
        "wall": xz,
        deep : 0.0
      };
      walls[`(${i},-1,${j})`] = dict;
      scene.add(xz);

      //yz
      let yz = new THREE.Object3D();
      tmp = addObject(-cubeSize, i, j, 0, Math.PI / 2, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      yz.add(tmp);
      tmp = addObject(cubeSize*2, i, j, 0, -Math.PI / 2, 0,
        new THREE.PlaneGeometry( 0.95, 0.95 ), 
        new THREE.MeshLambertMaterial({color: colorPlaneEmpty})
      );
      yz.add(tmp);
      dict = {
        "wall": yz,
        "deep" : 0.0
      };
      walls[`(-1,${i},${j})`] = dict;
      scene.add(yz);
    }
  }
};

function generateWallColor(num){
  return 0xffffff - (num*0x222222);
}

function createGrid() {
  for(let x=0; x < cubeSize; x++) {
    grid[x] = [];
    for(let y=0; y < cubeSize; y++) {
      grid[x][y] = [];
      for(let z=0; z < cubeSize; z++) {
        let cube = addObject(x, y, z, 0, 0, 0, 
          roundedBoxGeometry, 
          new THREE.MeshPhongMaterial( { color: colorGridEmpty, transparent: true, opacity: 0.2} )
        );
        let dict = {
          "state": "empty",
          "cube": cube
        };
        grid[x][y][z] = dict;
        scene.add(cube);
      }
    }
  }
};

function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
  let shape = new THREE.Shape();
  let eps = 0.00001;
  let radius = radius0 - eps;
  shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
  shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
  shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
  shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
  let geometry = new THREE.ExtrudeBufferGeometry( shape, {
    depth: depth - radius0 * 2,
    bevelEnabled: true,
    bevelSegments: smoothness * 2,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius0,
    curveSegments: smoothness
  });
  geometry.center();
  return geometry;
};

function changeStateGrid(x, y, z, state) {
  console.log("x: " + x + " y: " + " z: " + z + " state: " + state);
  if (state == "ghost" && grid[x][y][z]["state"] == "empty"){ //ghost state
    grid[x][y][z]["cube"].material.color.setHex( colorGridGhost );
    grid[x][y][z]["cube"].material.opacity = 0.8;
    grid[x][y][z]["state"] = "ghost";
    paintWall(x, y, z, true);
  } else if (state == "fill" && grid[x][y][z]["state"] != "fill") { //fill state
    grid[x][y][z]["cube"].material.color.setHex( colorGridFull );
    grid[x][y][z]["cube"].material.opacity = 1.0;
    grid[x][y][z]["state"] = "fill";
    addDeep(x, y, z);
    paintWall(x, y, z, false);
  } else if (state == "empty" && grid[x][y][z]["state"] == "ghost"){ //empty state
    grid[x][y][z]["cube"].material.color.setHex( colorGridEmpty );
    grid[x][y][z]["cube"].material.opacity = 0.1;
    grid[x][y][z]["state"] = "empty";
    paintWall(x, y, z, false);
  }
}

function addDeep(x, y, z){
  walls[`(${x},${y},-1)`]["deep"]++;
  walls[`(${x},-1,${z})`]["deep"]++;
  walls[`(-1,${y},${z})`]["deep"]++;
  let xyVal = walls[`(${x},${y},-1)`]["deep"];
  let xzVal = walls[`(${x},-1,${z})`]["deep"];
  let yzVal = walls[`(-1,${y},${z})`]["deep"];
  if (xyVal == cubeSize){
    for(let i = 0; i < cubeSize; i++) {
      grid[x][y][i]["cube"].material.color.setHex( colorGridEmpty );
      grid[x][y][i]["cube"].material.opacity = 0.1;
      grid[x][y][i]["state"] = "empty";
      remDeep(x, y, i);
    }
  }

  if (xzVal == cubeSize){
    for(let i = 0; i < cubeSize; i++) {
      grid[x][y][i]["cube"].material.color.setHex( colorGridEmpty );
      grid[x][y][i]["cube"].material.opacity = 0.1;
      grid[x][y][i]["state"] = "empty";
      remDeep(x, i, z);
    }
  }

  if (yzVal == cubeSize){
    for(let i = 0; i < cubeSize; i++) {
      grid[x][y][i]["cube"].material.color.setHex( colorGridEmpty );
      grid[x][y][i]["cube"].material.opacity = 0.1;
      grid[x][y][i]["state"] = "empty";
      remDeep(i, y, z);
    }
  }
}

function remDeep(x, y, z){
  if (walls[`(${x},${y},-1)`]["deep"] != 0) walls[`(${x},${y},-1)`]["deep"]--;
  if (walls[`(${x},-1,${z})`]["deep"] != 0) walls[`(${x},-1,${z})`]["deep"]--;
  if (walls[`(-1,${y},${z})`]["deep"] != 0) walls[`(-1,${y},${z})`]["deep"]--;
  paintWall(x, y, z, false);
}

function inLastPos(x, y, z){

  for (let i = 0; i < lastPositions.length; i++){
    if (lastPositions[i][0] == x 
    && lastPositions[i][0] == y 
    && lastPositions[i][0] == z ) return i;
  }
  return -1;
}

function ghostFills(){
  if (lastPositions.length != draggedObject.children.length) return false;
  for (let i = 0; i < lastPositions.length; i++){
    if (grid[lastPositions[i][0]][lastPositions[i][1]][lastPositions[i][2]]["state"] == "fill") return false;
  }
  return true;
}

function paintWall(x, y, z, ghost) {
  let xyChild = walls[`(${x},${y},-1)`]["wall"].children;
  let xzChild = walls[`(${x},-1,${z})`]["wall"].children;
  let yzChild = walls[`(-1,${y},${z})`]["wall"].children;
  if (ghost){
    let hex = colorPlaneGhost;
    xyChild[0].material.color.setHex( hex );
    xyChild[1].material.color.setHex( hex );

    xzChild[0].material.color.setHex( hex );
    xzChild[1].material.color.setHex( hex );

    yzChild[0].material.color.setHex( hex );
    yzChild[1].material.color.setHex( hex );
  } else {
    let hx = generateWallColor(walls[`(${x},${y},-1)`]["deep"]);
    let hy = generateWallColor(walls[`(${x},-1,${z})`]["deep"]);
    let hz = generateWallColor(walls[`(-1,${y},${z})`]["deep"]);

    xyChild[0].material.color.setHex( hx );
    xyChild[1].material.color.setHex( hx );

    xzChild[0].material.color.setHex( hy );
    xzChild[1].material.color.setHex( hy );

    yzChild[0].material.color.setHex( hz );
    yzChild[1].material.color.setHex( hz );
  }

}

function keyDown(event) {
  if (event.shiftKey){

  }
}

function keyUp(event) {
  if (event.keyCode == 16) { //Shift

  }
}

function dragStart(event) {
  console.log("dragStart")
  draggedObject =  event.object;
  dragging = true;
  let draggedChildren = draggedObject.children;
  for (let i = 0; i < draggedChildren.length; i++){
    draggedChildren[i].material.emissive.set( colorEmissive );
  }
}

function drag(event) { 
  console.log("drag")
  let x = camera.position.x - draggedObject.position.x;
  let y = camera.position.y - draggedObject.position.y;
  let z = camera.position.z - draggedObject.position.z;
  let total = Math.sqrt(x*x + y*y + z*z);
  x /= total;
  y /= total;
  z /= total;
  draggedObject.position.x += zoomDist * x;
  draggedObject.position.y += zoomDist * y;
  draggedObject.position.z += zoomDist * z;
  moveGrag();
}

function wheelMove(event) {
  if (selectedScene && selectedObject){
    let x, y, z
    if (perspective){
      x = camera.position.x;
      y = camera.position.y;
      z = camera.position.z;
    } else {
      x = cubeSize/2;
      y = cubeSize/2;
      z = cubeSize/2;
    }

    x = camera.position.x - x;
    y = camera.position.y - y;
    z = camera.position.z - z;

    zoomDist += event.deltaY/200;

    let total = Math.sqrt(x*x + y*y + z*z);
    x /= total;
    y /= total;
    z /= total;

    selectedObject.position.x += event.deltaY/200 * x;
    selectedObject.position.y += event.deltaY/200 * y;
    selectedObject.position.z += event.deltaY/200 * z;

    console.log(selectedObject.position)
    let vectorZoom = new THREE.Vector3(0, 0, 0);
    //moveGrag();
  }
}

function moveGrag(){
  let draggedChildren = draggedObject.children;
  let pos = draggedObject.position;
  let futureLastPos = [];
  let newPos = [];
  for (let i = 0; i < draggedChildren.length; i++){
    let childPos = draggedChildren[i].position;
    let x = (pos.x + childPos.x).toFixed();
    let y = (pos.y + childPos.y).toFixed();
    let z = (pos.z + childPos.z).toFixed();
    if (x >= 0 && x < cubeSize
      && y >= 0 && y < cubeSize
      && z >= 0 && z < cubeSize){
      x = Math.abs(x);
      y = Math.abs(y);
      z = Math.abs(z);
    
      futureLastPos[i] = [x, y, z];
      let ind = inLastPos(x, y, z);
      if (ind != -1){
        lastPositions.splice(ind, 1);
      } else {
        newPos.push([x, y, z]);
      }
    }
  }

  for (let i = 0; i < lastPositions.length; i++){
    changeStateGrid(lastPositions[i][0], lastPositions[i][1], lastPositions[i][2], "empty");
  }

  for (let i = 0; i < newPos.length; i++){
    changeStateGrid(newPos[i][0], newPos[i][1], newPos[i][2], "ghost");
  }

  console.log("futureLastPos" + futureLastPos)
  console.log("lastPositions" + lastPositions)
  console.log("newPos" + newPos)
  lastPositions = futureLastPos;
  console.log("lastPositions" + lastPositions)
  console.log("----")
}

function dragEnd() {
  let draggedChildren = draggedObject.children;
  for (let i = 0;i < draggedChildren.length; ++i){
    draggedChildren[i].material.emissive.set( 0x000000 );
  }
  if (ghostFills()){
    console.log("fills")
    for (let i = 0; i < lastPositions.length; i++){
      changeStateGrid(lastPositions[i][0], lastPositions[i][1], lastPositions[i][2], "fill");
    }
    scene.remove( draggedObject );    
  } else {
    console.log("not fills")
    for (let i = 0; i < lastPositions.length; i++){
      changeStateGrid(lastPositions[i][0], lastPositions[i][1], lastPositions[i][2], "empty");
    }
  }
  zoomDist = 0.0;
  draggedObject = false;
  lastPositions = [];
  dragging = false;
}

function step(){
  changeStateGrid(lastPos["x"], lastPos["y"], lastPos["z"], "fill");
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


function main() {
    canvas = document.querySelector('#mainCanvas');
    document.addEventListener('wheel', wheelMove);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setClearColor( 0x000000, 0 );
    
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;
    
    declareCamera();
    declareControls();
    
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0x5F5F5F);
    scene = getLight(scene);

    createGrid();
    defineWalls();
    peaceCanvas();
    /*
    for(let i = 0; i < numObjects; i++) {
      controlsDrag = new DragControls( objects[i], camera, renderer.domElement );
      controlsDrag.transformGroup = true;
      controlsDrag.addEventListener( 'dragstart', dragStart);
      controlsDrag.addEventListener( 'dragend', dragEnd);
      controlsDrag.addEventListener( 'drag', drag);
    }
    */
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



  //
}

function animate() {
  requestAnimationFrame( animate );
  render();
}

main();
renderer.setSize( windowWidth, windowHeight, false );
animate();