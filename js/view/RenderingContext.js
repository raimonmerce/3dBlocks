import * as THREE from 'https://cdn.skypack.dev/three@0.136.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';

export default class RenderingContext {
    constructor(scene, camera, renderer, controls) {
        this.scene = scene;
        this.scanes = []
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;
    }

    static getDefault(containerElement, containers) {
        const width  = window.innerWidth, height = window.innerHeight;
        const scene = new THREE.Scene();

        /*
        for ( let i = 0; i < containers.length; i ++ ) {
            let sceneTmp = new THREE.Scene();
            sceneTmp.userData.element = containers[i];
            const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000)
            camera.position.set(cubeSize*2, cubeSize*2, cubeSize*2);
            camera.lookAt(cubeSize/2, cubeSize/2, cubeSize/2);
            sceneTmp.userData.camera = camera;
        
            let cubeTmp = generatePeace()
            sceneTmp.add(cubeTmp);
            sceneTmp = getLight(sceneTmp);
            containers.push(sceneTmp);
        }*/ 

        scene.background = new THREE.Color(0x5F5F5F);
        //const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        //const renderer = new THREE.WebGLRenderer();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: containerElement, alpha: true });
        const controls = new OrbitControls(camera, renderer.domElement);

        camera.position.z = 20;
        renderer.setSize(width, height);
        scene.add(new THREE.AmbientLight(0x333333));

        const light = new THREE.DirectionalLight(0xffffff, 1);

        light.position.set(15,15,15);
        scene.add(light);

        //containerElement.appendChild(renderer.domElement);

        return new RenderingContext(scene, camera, renderer, controls);
    }
}