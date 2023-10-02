import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import config from '../config.js';

export default class RenderingContext {
    constructor(scene, scenes, camera, renderer, controls) {
        this.scene = scene;
        this.scenes = scenes;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
    }

    static getCamera(width, height){
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
        camera.position.set(config.cubeSize*2, config.cubeSize*2, config.cubeSize*2);
        camera.lookAt(config.cubeSize/2 - 0.5, config.cubeSize/2 - 0.5, config.cubeSize/2 - 0.5);
        return camera;
    }

    static getOrbitControls(camera, canvas){
        let controls = new OrbitControls(camera, canvas);
        controls.target.set(config.cubeSize/2 - 0.5, config.cubeSize/2 - 0.5, config.cubeSize/2 - 0.5);
        controls.mouseButtons = {
          RIGHT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          LEFT: THREE.MOUSE.PAN
        }
        controls.enablePan = false;
        controls.enableZoom = false;
        return controls;
    }

    static getLight(sceneLight){
        let color = 0xFFFFFF;
        let intensity = 1;
        let light = new THREE.DirectionalLight(color, intensity);
        light.position.set(config.cubeSize + 1, config.cubeSize + 1, config.cubeSize + 1);
        sceneLight.add(light)
        light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, -1, -1);
        sceneLight.add( light );
        return sceneLight;
      }

    static getDefault(containerElement, containers) {
        const width  = window.innerWidth, height = window.innerHeight;
        let scene = new THREE.Scene();
        const scenes = [];

        for ( let i = 0; i < containers.length; i ++ ) {
            let sceneTmp = new THREE.Scene();
            sceneTmp.userData.element = containers[i];
            sceneTmp.add(this.getCamera(width, height))
            sceneTmp = this.getLight(sceneTmp);
            sceneTmp.background = new THREE.Color(0x5F5F5F);
            scenes.push(sceneTmp);
        }

        scene.background = new THREE.Color(0x5F5F5F);
        //const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        //const renderer = new THREE.WebGLRenderer();
        const camera = this.getCamera(width, height)
        const renderer = new THREE.WebGLRenderer({ canvas: containerElement, alpha: true });
        const controls = this.getOrbitControls(camera, renderer.domElement);

        renderer.setSize(width, height);
        scene.add(new THREE.AmbientLight(0x333333));

        scene = this.getLight(scene);

        //containerElement.appendChild(renderer.domElement);

        return new RenderingContext(scene, scenes, camera, renderer, controls);
    }
}