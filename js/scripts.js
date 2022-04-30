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
    const cubeSize = 8;
    let cubes = [];
    let grid = [];
    let walls = {};
    let dragging = false;
    let controls, controlsDrag;
    let roundedBoxGeometry = createBoxWithRoundedEdges(0.95, 0.95, 0.95, .15, 2);

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
    createCubes();
    defineWalls();

    
    controlsDrag = new DragControls( cubes, camera, renderer.domElement );
    controlsDrag.addEventListener( 'dragstart', dragStart);
    controlsDrag.addEventListener( 'dragend', dragEnd);
    controlsDrag.addEventListener( 'drag', drag);
    

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
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          xy.add(tmp);
          tmp = addObject(i, j, cubeSize*2, Math.PI, 0, 0,
            new THREE.PlaneGeometry( 0.95, 0.95 ), 
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          xy.add(tmp);
          let name = `(${i},${j},-1)`;
          walls[name] = xy;
          scene.add(xy);

          //xy
          let xz = new THREE.Object3D();
          tmp = addObject(i, -cubeSize, j, -Math.PI / 2, 0, 0,
            new THREE.PlaneGeometry( 0.95, 0.95 ), 
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          xz.add(tmp);
          tmp = addObject(i, cubeSize*2, j, Math.PI / 2, 0, 0,
            new THREE.PlaneGeometry( 0.95, 0.95 ), 
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          xz.add(tmp);
          name = `(${i},-1,${j})`;
          walls[name] = xz;
          scene.add(xz);

          //yz
          let yz = new THREE.Object3D();
          tmp = addObject(-cubeSize, i, j, 0, Math.PI / 2, 0,
            new THREE.PlaneGeometry( 0.95, 0.95 ), 
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          yz.add(tmp);
          tmp = addObject(cubeSize*2, i, j, 0, -Math.PI / 2, 0,
            new THREE.PlaneGeometry( 0.95, 0.95 ), 
            new THREE.MeshLambertMaterial({color: 0xffffff})
          );
          yz.add(tmp);
          name = `(-1,${i},${j})`;
          walls[name] = yz;
          scene.add(yz);
        }
      }
    };

    function createColor(x, y, z) {
      return Math.floor(x/cubeSize*0xff)*0x010000 + Math.floor(y/cubeSize*0xff)*0x000100 + Math.floor(z/cubeSize*0xff)
    };

    function createGrid() {
      for(let x=0; x < cubeSize; x++) {
        grid[x] = [];
    
          for(let y=0; y < cubeSize; y++) {
            grid[x][y] = [];
              for(let z=0; z < cubeSize; z++) {
                    let cube = addObject(x, y, z, 0, 0, 0, 
                      roundedBoxGeometry, 
                      new THREE.MeshPhongMaterial( { color: 0xaaaaaa, transparent: true, opacity: 0.2} )
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

    function createCubes() {

      for(let x = 0; x < 3; x++) {
        let cube = addObject(cubeSize + 2 + x, 0, 0, 0, 0, 0, 
          roundedBoxGeometry, 
          new THREE.MeshPhongMaterial( { color: 0x00ff00} )
        );
        cubes[x] = cube;
        scene.add(cube);
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
      if (state == "ghost" && grid[x][y][z]["state"] != "ghost" && grid[x][y][z]["state"] != "full"){ //ghost state
        grid[x][y][z]["cube"].material.color.setHex( 0x0000ff );
        grid[x][y][z]["cube"].material.opacity = 1.0;
      } else if (state = "fill" && grid[x][y][z]["state"] != "fill") { //fill state

      } else if (grid[x][y][z]["state"] != "empty"){ //empty state

      }
    }

    function paintWall(x, y, z) {
      console.log("Paint X: " + x + " Y: " + y  + " Z: " + z );

      let xyChild = walls[`(${x},${y},-1)`].children;
      xyChild[0].material.color.setHex( 0x0000ff );
      xyChild[1].material.color.setHex( 0x0000ff );
      let xzChild = walls[`(${x},-1,${z})`].children;
      xzChild[0].material.color.setHex( 0x0000ff );
      xzChild[1].material.color.setHex( 0x0000ff );
      let yzChild = walls[`(-1,${y},${z})`].children;
      yzChild[0].material.color.setHex( 0x0000ff );
      yzChild[1].material.color.setHex( 0x0000ff );
    }

    function wheelMove(event) {
      if (dragging){
        console.log(event.deltaY);
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

    function dragStart( event ) {
      event.object.material.emissive.set( 0xaaaaaa );
      dragging = false;
    }

    function dragEnd( event ) {
      event.object.material.emissive.set( 0x000000 );
      dragging = true;
    }

    function drag( event ) {
      let pos = event.object.position;
      let x = (pos.x).toFixed();
      let y = (pos.y).toFixed();
      let z = (pos.z).toFixed();
      if (x >= 0 && x < cubeSize
        && y >= 0 && y < cubeSize
        && z >= 0 && z < cubeSize){
        console.log("x: " + x + " y: " + y + " z: " + z);
        changeStateGrid(Math.abs(x), Math.abs(y), Math.abs(z), "ghost");
      }
      
    }
}

main();