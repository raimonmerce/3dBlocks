import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import {DragControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/DragControls.js';

function main() {
    const canvas = document.querySelector('#c');
    document.addEventListener('wheel', wheelMove);
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    const fov = 40;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const cubeSize = 6;
    const numObjects = 3;
    let draggedObject;
    let objects = [];
    let grid = [];
    let walls = {};
    let dragging = false;
    let controls, controlsDrag;
    let roundedBoxGeometry = createBoxWithRoundedEdges(0.95, 0.95, 0.95, .15, 2);
    let lastPositions = [];
    let objPos = [
      ["000"], //.
      ["000", "001"], //..
      ["000", "001", "002"],//...
      ["000", "001", "100"],//L
      ["000", "001", "002", "003"],//
      ["000", "001", "002", "100"],
      ["000", "001", "010", "100"],
      ["000", "001", "011", "012"],
      ["000", "001", "011", "010"],
      ["000", "001", "002", "100", "200"],
  ];

    let colorPlaneEmpty = 0xffffff;
    let colorPlaneGhost = 0xFF7000;
    let colorGridEmpty = 0xaaaaaa;
    let colorGridFull = 0x006BFF;
    let colorGridGhost = 0xFF7000;
    let colorEmissive = 0xaaaaaa; 

    let zoomDist = 0.0;


    camera.position.set(cubeSize*2, cubeSize*2, cubeSize*2);
    //camera.up.set(0, 0, 1);
    camera.lookAt(cubeSize/2, cubeSize/2, cubeSize/2);
    
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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x5F5F5F);

    {
      let color = 0xFFFFFF;
      let intensity = 1;
      let light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-1, -1, -1);
      scene.add(light);
      light = new THREE.DirectionalLight(color, intensity);
      light.position.set(cubeSize + 1, cubeSize + 1, cubeSize + 1);
      scene.add(light);
    }

    createGrid();
    createObjects();
    defineWalls();
    
    for(let i = 0; i < numObjects; i++) {
      controlsDrag = new DragControls( objects[i], camera, renderer.domElement );
      controlsDrag.transformGroup = true;
      controlsDrag.addEventListener( 'dragstart', dragStart);
      controlsDrag.addEventListener( 'dragend', dragEnd);
      controlsDrag.addEventListener( 'drag', drag);
    }


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

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function render() {
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

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

    function createObjects() {
      /*
      for(let i = 0; i < 3; i++) {
        let obj = new THREE.Object3D();
        let positions =  objPos[Math.floor(Math.random() * objPos.length)];
        for(let j = 0; j < positions.length; j++) {
          //Rotate and get values
          let cube = addObject(x, y, z, 0, 0, 0, 
            roundedBoxGeometry, 
            new THREE.MeshPhongMaterial( { color: 0x00ff00} )
          );
          obj.add(cube);
        }
        obj.position.x = cubeSize + 1;
        obj.position.z = i;
        objects[i] = [];
        objects[i][0] = obj;
        scene.add(obj);
      } */
      
      
      for(let i = 0; i < 3; i++) {
        let obj = new THREE.Object3D();
        for(let j = 0; j < 2; j++) {
          let cube = addObject(j, 0, 0, 0, 0, 0, 
            roundedBoxGeometry, 
            new THREE.MeshPhongMaterial( { color: 0x00ff00} )
          );
          obj.add(cube);
        }
        obj.position.x = cubeSize + 1;
        obj.position.z = i;
        objects[i] = [];
        objects[i][0] = obj;
        scene.add(obj);
      } 
      
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
      draggedObject =  event.object;
      dragging = true;
      let draggedChildren = draggedObject.children;
      for (let i = 0; i < draggedChildren.length; i++){
        draggedChildren[i].material.emissive.set( colorEmissive );
      }
    }

    function drag(event) { 
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
      if (dragging){
        zoomDist += event.deltaY/200;

        let x = camera.position.x - draggedObject.position.x;
        let y = camera.position.y - draggedObject.position.y;
        let z = camera.position.z - draggedObject.position.z;
        let total = Math.sqrt(x*x + y*y + z*z);
        x /= total;
        y /= total;
        z /= total;

        draggedObject.position.x += event.deltaY/200 * x;
        draggedObject.position.y += event.deltaY/200 * y;
        draggedObject.position.z += event.deltaY/200 * z;

        moveGrag();
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
}

main();