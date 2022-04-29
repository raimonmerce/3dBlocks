import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

function main() {
    const canvas = document.querySelector('#c');
    document.addEventListener( 'mousedown', onDocumentMouseDown );
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    const objects = [];

    const fov = 40;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    const cubeSize = 8;
    let matrixBase = [];
    let matrixHasElement = [];
    let cubes = [];
    let walls = {};
    let negativeState = false;
    let roundedBoxGeometry = createBoxWithRoundedEdges(0.95, 0.95, 0.95, .15, 2);

    camera.position.set(cubeSize*2, cubeSize*2, cubeSize*2);
    //camera.up.set(0, 0, 1);
    camera.lookAt(cubeSize/2, cubeSize/2, cubeSize/2);
    
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(cubeSize/2, cubeSize/2, cubeSize/2);
    controls.mouseButtons = {
      RIGHT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      LEFT: THREE.MOUSE.PAN
    }
    controls.enablePan = false;
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

    createCubes();
    defineWalls();

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

    function createCubes() {
      for(let x=0; x < cubeSize; x++) {
        matrixBase[x] = [];
        matrixHasElement[x] = [];
    
          for(let y=0; y < cubeSize; y++) {
              matrixBase[x][y] = [];
              matrixHasElement[x][y] = [];
              for(let z=0; z < cubeSize; z++) {
                    let cube = addObject(x, y, z, 0, 0, 0, 
                      roundedBoxGeometry, 
                      new THREE.MeshPhongMaterial( { color:  createColor(x, y, z)} )
                    );
                    cube.name = `${x},${y},${z}`;
    
                    matrixBase[x][y][z] = cube;
                    matrixHasElement[x][y][z] = true;
                    cubes.push(cube);
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

    function removeCube(x, y, z) {
      console.log("Remove X: " + x + " Y: " + y  + " Z: " + z )
      if (matrixHasElement[x][y][z]){
        matrixHasElement[x][y][z] = true;
      } else {
        matrixHasElement[x][y][z] = false;
      }
    }

    function paintWall(x, y, z) {
      console.log("Paint X: " + x + " Y: " + y  + " Z: " + z )
      
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
              paintWall(parseInt(res[0]), parseInt(res[1]), parseInt(res[2]))
            }
            ++i;
          }
        }
        /*
        let movingIntersection = raycaster.intersectObjects( movingCubes );
        if ( movingIntersection.length > 0 ) {
          movingIntersection[0].object.material.color.setHex( 0xffffff )
          cubeSelected = true;
          x = event.pageX;
          y = event.pageY;
          console.log("X: " + x + " Y: " + y);
        }
        */
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
}

main();