//https://threejs.org/docs/#manual/en/introduction/Installation
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';

const promise_vs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/vs.vert/')).then(res => res.text());
const promise_fs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/fs.frag/')).then(res => res.text());

Promise.all([
    promise_vs,
    promise_fs
    ]).then(([vs, fs]) => main(vs,fs)
);

var renderer;
var uniform;
var scene;
var camera;
var clock;

function main(vs, fs){
    const canvas = document.querySelector('#canvas');
    renderer = new THREE.WebGLRenderer({canvas});

    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    uniform = { time: { type: "f", value: 1.0 }}

    const material = new THREE.ShaderMaterial( {
    uniforms : uniform,
    vertexShader: vs,
    fragmentShader: fs
    } );

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    render()
}

function render()
{
    requestAnimationFrame(render)
    uniform.time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}







