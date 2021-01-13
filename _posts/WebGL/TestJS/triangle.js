"use strict";
exports.__esModule = true;
var THREE = require("https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js");
function main() {
    var canvas = document.querySelector('#c');
    var renderer = new THREE.WebGLRenderer({ canvas: canvas });
    var fov = 75;
    var aspect = 2; // the canvas default
    var near = 0.1;
    var far = 5;
    var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;
    var scene = new THREE.Scene();
    var boxWidth = 1;
    var boxHeight = 1;
    var boxDepth = 1;
    var geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    var material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // greenish blue
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    renderer.render(scene, camera);
}
main();
