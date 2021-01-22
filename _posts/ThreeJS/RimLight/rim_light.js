//https://threejs.org/docs/#manual/en/introduction/Installation
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js'
import { GUI } from "https://unpkg.com/three@0.124.0/examples/jsm/libs/dat.gui.module.js";

const canvas = document.querySelector('#canvas');
var renderer = new THREE.WebGLRenderer({canvas});
var scene = new THREE.Scene();

const fov = 45;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 10, 20);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

{
  const loader = new THREE.TextureLoader();
  loader.load('/assets/glsls/RimLight/checker.png/',
      function(texture) {
          const planeSize = 40;
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.magFilter = THREE.NearestFilter;
          const repeats = planeSize / 2;
          texture.repeat.set(repeats, repeats);

          const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
          const planeMat = new THREE.MeshPhongMaterial({
          map: texture,
          side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(planeGeo, planeMat);
          mesh.rotation.x = Math.PI * -.5;
          scene.add(mesh);
      },
      undefined,
      function(err) {
          console.error(err);
      });
}

const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);


const backLightColor = 0xFFFFFF;
const backLightIntensity = 1;
const backLight = new THREE.DirectionalLight(backLightColor, backLightIntensity);
backLight.position.set(-5, 0, -10);
backLight.target.position.set(-5, 0, 0);
scene.add(backLight);
scene.add(backLight.target);


class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

const promise_vs = fetch(new Request('/assets/glsls/RimLight/vs.vert/')).then(res => res.text());
const promise_fs = fetch(new Request('/assets/glsls/RimLight/fs.frag/')).then(res => res.text());

Promise.all([
    promise_vs,
    promise_fs
    ]).then(([vs, fs]) => addSphere(vs,fs)
);

var uniforms = THREE.UniformsUtils.merge( [
  THREE.UniformsLib[ "lights" ],
  {frenel_smooth_step: { type: "f", value: 0.7 }}
  ] );

function addSphere(vs, fs)
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const mySphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const mySphereMat = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    lights: true
    } );
  const mesh = new THREE.Mesh(mySphereGeo, mySphereMat);
  mesh.position.set(-sphereRadius + 7, sphereRadius + 2, 0);
  scene.add(mesh);
}
{
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereBufferGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
  const mesh = new THREE.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(mesh);
}

var uniform_controler = new function () { this.fresnel = 0.7;}

const gui = new GUI({autoPlace: false });
gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
gui.add(light, 'intensity', 0, 2, 0.01);
gui.addColor(new ColorGUIHelper(backLight, 'color'), 'value').name('back light color');
gui.add(backLight, 'intensity', 0, 2, 0.01);
gui.add(uniform_controler, 'fresnel', 0.01, 0.9, 0.01).onChange(
  function(v) {
    uniforms.frenel_smooth_step.value = uniform_controler.fresnel 
  });
var gui_holder = document.getElementById('gui_holder');
gui_holder.appendChild(gui.domElement);


function render()
{
    requestAnimationFrame(render)
    renderer.render(scene, camera);
}
render()
