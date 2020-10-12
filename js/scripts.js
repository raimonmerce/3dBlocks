
var renderer, scene, camera, composer, antObj;
var matrixBase = [];
var matrixHasElement = [];
var pendingSteps = 0;
var step = 0;
var stepsPerFrame =  100;
var cubeSize = 8;
var cubeDiagonal = Math.floor( (cubeSize * Math.sqrt(3)) / 1.5 );
var floor = new THREE.Object3D();
floor.name = 'floor';
var ant = {x: 0, z: 0, dir: 0};
var directions = [1,-1,-1,1];
var grid = new Map();
var changed = new Map();
var stepCounter = document.getElementById('step');
var negativeState = false;
var cubeSelected = false;
var DemoCube;
var cubes = [];
var movingCubes = [];
var roundedBoxGeometry = createBoxWithRoundedEdges(0.95, 0.95, 0.95, .15, 2);
roundedBoxGeometry.computeFaceNormals();
var x, y;

window.onload = function() {
  init();
  animate();
}

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0.0);
  document.getElementById('canvas').appendChild(renderer.domElement);
  document.addEventListener( 'mousedown', onDocumentMouseDown );
  document.addEventListener( 'mouseup', onDocumentMouseUp );
  document.addEventListener( 'mousemove', onDocumentMouseMove );
  document.addEventListener('keydown', keyDown);
  document.addEventListener('keyup', keyUp);
  scene = new THREE.Scene();

  //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  //camera = new THREE.OrthographicCamera( window.innerWidth / - 10, window.innerWidth / 10, window.innerHeight / 10, window.innerHeight / - 10, 1, 1000 );
  
  
  camera = new THREE.OrthographicCamera( -(cubeDiagonal * window.innerWidth ) / window.innerHeight, (cubeDiagonal * window.innerWidth ) / window.innerHeight, cubeDiagonal, -cubeDiagonal,  1, 1000 );
  console.log("Widht: " + cubeDiagonal + " Height: " + cubeDiagonal);
  camera.position.set(10, 10, 10);
  camera.lookAt(new THREE.Vector3(cubeSize/2 , cubeSize/2, cubeSize/2));

  // Move camera
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableKeys = false;
  controls.target = new THREE.Vector3(cubeSize/2 , cubeSize/2, cubeSize/2);
  controls.enableZoom = false;
  controls.enablePan = false;

  //controls = new THREE.OrbitControls( camera, renderer.domElement );

  scene.add(camera);

  let material = new THREE.MeshPhongMaterial( { color:  0x00} );
  DemoCube = createCube({
    'x': 10, 'y': 10, 'z': -10,
    'material': material
  });
  movingCubes.push(DemoCube);
  scene.add(DemoCube);

  createCubes();
  //createPlanes();
  scene.add(floor);

  console.log("Floor: " + floor.size);
  console.log("Size X: " + matrixHasElement.size + "Size Y: " + matrixHasElement[0].size + "Size Z: " + matrixHasElement[0][0].size);

  var ambientLight = new THREE.AmbientLight(0x999999 );
  scene.add(ambientLight);
  
  var lights = [];
  lights[0] = new THREE.DirectionalLight( 0xffffff, 0.8);
  lights[0].position.set( -3, 3, -3 );
  scene.add( lights[0] );
  
  window.addEventListener('resize', onWindowResize, false);
  
};

function animate() {
  requestAnimationFrame(animate);

  move(stepsPerFrame);
  renderer.clear();
  renderer.render(scene,camera);
};


function createColor(x, y, z) {
  return Math.floor(x/cubeSize*0xff)*0x010000 + Math.floor(y/cubeSize*0xff)*0x000100 + Math.floor(z/cubeSize*0xff)
};

function createCubes() {
  for(let x=0; x < cubeSize; x++) {
    matrixBase[x] = [];
    matrixHasElement[x] = [];


      for(let y=0; y < cubeSize; y++) {
          matrixBase[x][y] = [];
          matrixHasElement[x][y] = [];


          for(let z=0; z < cubeSize; z++) {

                color = createColor(x, y, z);
                //console.log("x: " + x + " y: " + y + " z: " + z + " color: " + color)
                let material = new THREE.MeshPhongMaterial( { color:  color} );
                material.transparent = false;
                let cube = createCube({
                  'x': x, 'y': y, 'z': z,
                  'material': material
                });


                matrixBase[x][y][z] = cube;
                matrixHasElement[x][y][z] = true;
                cubes.push(cube);
                //floor.add(cube);
                scene.add(cube);
          }
      }
  }
  
};

function createPlanes() {
  for(let x=0; x < cubeSize; x++) {
    for(let y=0; y < cubeSize; y++) {
      addPlane(x, y, 0, 'z');
      addPlane(x, y, cubeSize, 'z');
    }
  }

  for(let x=0; x < cubeSize; x++) {
    for(let z=0; z < cubeSize; z++) {
      addPlane(x, 0, z, 'y');
      addPlane(x, cubeSize, z, 'y');
    }
  }

  for(let y=0; y < cubeSize; y++) {
    for(let z=0; z < cubeSize; z++) {
      addPlane(0, y, z, 'x');
      addPlane(cubeSize, y, z, 'x');
    }
  }
};


function addPlane(x, y, z, r) {

  var geometry = new THREE.PlaneGeometry( 1, 1);
  var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  plane.position.x = x ;
  plane.position.y = y ;
  plane.position.z = z ;
  plane.name = `(${x},${y},${z})`;
  console.log("name" + plane.name);
  if (r == 'x'){
    plane.position.x = x - 0.5 ;
    plane.rotation.y = Math.PI / 2;
  } else if ( r == 'y'){
    plane.position.y = y - 0.5 ;
    plane.rotation.x = Math.PI / 2;
  } else if (r == 'z'){
    plane.position.z = z - 0.5 ;
    //plane.rotation.y = Math.PI / 2;
  }

  var geo = new THREE.EdgesGeometry( plane.geometry );
  var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
  var wireframe = new THREE.LineSegments( geo, mat );
  wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
  plane.add( wireframe );
  //cubes.push(plane);
  scene.add( plane );
  
};

function onWindowResize() {
  camera.left = -(cubeDiagonal * window.innerWidth ) / window.innerHeight;
  camera.right = (cubeDiagonal * window.innerWidth ) / window.innerHeight;
  camera.top = cubeDiagonal;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

function createCube({x = 0, y = 0, z = 0, material} = {}) {
  var tile = new THREE.Mesh(roundedBoxGeometry, (material) ? material : materials[color%materials.length]);
  tile.position.x = x ;
  tile.position.y = y ;
  tile.position.z = z ;
  tile.name = `${x},${y},${z}`;
  return tile;
}

function move(steps = 1){
  pendingSteps += steps;
  let stepsToMove = Math.floor(pendingSteps);
  pendingSteps -= stepsToMove;
  step += stepsToMove;
  stepCounter.textContent = step;

  changed.clear();

  for(let i=0; i<stepsToMove; i++) nextStep();

}

function nextStep() {

  let key = JSON.stringify([ant.x,ant.z]);

  let gridXZ = grid.get(key);
  if(gridXZ === undefined) gridXZ = -1;
  
  let newTileStep = (gridXZ + 1) % directions.length;

  changed.set(key, newTileStep);
  grid.set(   key, newTileStep);

  let deg = (directions[newTileStep] * 90 + ant.dir) % 360;
  ant.x += Math.round(Math.cos((deg*Math.PI)/180));
  ant.z += Math.round(Math.sin((deg*Math.PI)/180));
  ant.dir = deg;
}

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
}

function onDocumentMouseDown( event ) {  
  if (event.which == 1){
    event.preventDefault();
    let mouse3D = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1,   
                            -( event.clientY / window.innerHeight ) * 2 + 1,  
                            0.5 );     
    let raycaster =  new THREE.Raycaster();                                        
    raycaster.setFromCamera( mouse3D, camera );
    let intersects = raycaster.intersectObjects( cubes );
  
    if ( intersects.length > 0 ) {
      let hit = false;
      let i = 0;
      while (hit == false && i < intersects.length){
        if (intersects[ i ].object.material.transparent == false){
          hit = true;
          intersects[ i ].object.material.transparent = true;
          intersects[ i ].object.material.opacity = 0
          let res = intersects[ 0 ].object.name.split(",");
          removeCube(parseInt(res[0]), parseInt(res[1]), parseInt(res[2]));
        }
        ++i;
      }
    }
  
    let movingIntersection = raycaster.intersectObjects( movingCubes );
    if ( movingIntersection.length > 0 ) {
      movingIntersection[0].object.material.color.setHex( 0xffffff )
      cubeSelected = true;
      x = event.pageX;
      y = event.pageY;
      console.log("X: " + x + " Y: " + y);
    }
  }
}

function onDocumentMouseUp( event ) { 
  if (event.which == 1){
    console.log("Up: " + event.which);
    cubeSelected = false;
  } 
}

function onDocumentMouseMove( event ) {  
  if (cubeSelected ) console.log("Move");
}

function addCube(x, y, z) {

}

function removeCube(x, y, z) {
  console.log("Remove X: " + x + " Y: " + y  + " Z: " + z )
  if (matrixHasElement[x][y][z]){
    //console.log("No cube");
    matrixHasElement[x][y][z] = true;

  } else {
    //console.log("Has Cube");
    matrixHasElement[x][y][z] = false;
  }
}

function keyDown(event) {
  if (!negativeState && event.shiftKey){
    negativeState = true;
    invertCubes();
  }
}

function keyUp(event) {
  if (event.keyCode == 16 && negativeState) { //Shift
    negativeState = false;
    invertCubes();
  }
}

function invertCubes (){
  let i = 0;
  while (i < cubes.length){
    if (cubes[i].material.transparent == true){
      cubes[i].material.transparent = false;
      cubes[i].material.opacity = 1;
    } else {
      cubes[i].material.transparent = true;
      cubes[i].material.opacity = 0;
    }
    ++i;
  }   
}