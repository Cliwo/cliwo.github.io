---
layout: post
title:  "jekyll에서 three.js를 써보자!"
date:   2021-01-17 00:12:00 +0900
categories: ThreeJS
tags: [three]
---

## jekyll blog 에서 Three.js 를 써보자!

**이 글의 대상 :**
1. jekyll blog에 **OpenGL Shader** 결과를 바로바로 올리고 싶다. (이미 jekyll blog를 가지고 있다.)
2. **javascript는 하나도 모르는** 그래픽스 프로그래머
3. 인스타그램이나 핀터레스트처럼, **내가 만든 쉐이더를 아카이빙 하고 싶다.**

**이 글의 목표 :**
1. jekyll blog에서 **three.js를 사용해서 3D scene**을 그린다.
2. 3D scene에 **내가 만든 커스텀 glsl shader를 사용**한다.

**목차 :**
1. html 수정하기 (canvas 사용하기)
2. three.js를 사용하는 javascript 만들기 
3. custom shader 붙이기
   

안녕하세요.  
이번 포스팅은 three.js를 이용해서 glsl shader를 이용한 3D scene 포스팅을 만드는 법에 대한 내용입니다.
  
취업 준비를 하면서 포트폴리오를 만들고 있는데, 매번 새로운 포트폴리오를 만드는게 어렵더라구요.
게다가 그래픽스 쪽이면 Visual 적인 부분을 gif 나 video로 보여줘야하는 경우도 많은데 용량 줄이는 것도 만만치 않았습니다.  

그래서 **블로그에 이런 shader 결과를 바로 보여줄 수 있으면 훨씬 좋지 않을까?** 싶어서 시도하게 되었고, 제가 시도한 결과를 정리하는 포스팅을 올리게 되었습니다.



### 1. html 수정하기 (canvas 사용하기)

첫 번째는 html수정입니다. 우선 제가 사용하는 blog theme은 이 link에서 확인할 수 있습니다.  
[https://github.com/jeffreytse/jekyll-theme-yat](https://github.com/jeffreytse/jekyll-theme-yat)

jekyll blog는 특정 markdown을 읽어서 post로 만들어줍니다. 특정 md라는 건 아래와 같은 포맷으로 시작하는 md를 의미합니다. 

    ---
    layout: post
    title:  "jekyll에서 three.js를 써보자!"
    date:   2021-01-17 00:12:00 +0900
    categories: ThreeJS
    tags: [three]
    ---

여기서 layout 키워드가 중요한데요, 제가 이해하기로는 layout에 등록된 html 아래에 markdown 내용을 추가하는 것으로 이해했습니다.   
그럼 이 'post'를 수정해서, three.js로 만들 3d scene을 그려줄 부분을 추가하면 포스트 안에 3d scene을 그릴 수 있다고 생각했습니다.  

![01](/assets/images/ThreeJS/2021-01-17-configuration/01.png)
<center>(post.html)</center> <br>

이게 원본 'post.html'의 모습입니다.  

이제 이 post를 이용해서 **'glpost'**라는 걸 만들어 줍니다.

![02](/assets/images/ThreeJS/2021-01-17-configuration/02.png)
<center>(glpost.html)</center> <br>

간단하게 'canvas'를 추가하고, width와 height를 지정해주었습니다. **이제 이걸 js 안에서 읽어서 three.js가 render하게 하면 끝입니다.**


### 2. three.js를 사용하는 javascript 만들기 
``` javascript
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
```

제가 사용한 javascript 입니다. 부분별로 살펴보겠습니다.

``` javascript
//https://threejs.org/docs/#manual/en/introduction/Installation
import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
```

먼저 three.js 모듈을 가져오는 부분입니다. 위의 주석 링크에서 module을 바로 사용하고 싶으면 unpkg 에서 module을 가져오라고 해서 바로 적용했습니다.

``` javascript
const promise_vs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/vs.vert/')).then(res => res.text());
const promise_fs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/fs.frag/')).then(res => res.text());

Promise.all([
    promise_vs,
    promise_fs
    ]).then(([vs, fs]) => main(vs,fs)
);
```
이 부분은 아래에서 자세하게 다루겠습니다.


``` javascript
function main(vs, fs){
    const canvas = document.querySelector('#canvas');
    renderer = new THREE.WebGLRenderer({canvas});
    //...

    const material = new THREE.ShaderMaterial( {
    uniforms : uniform,
    vertexShader: vs,
    fragmentShader: fs
    } );
}
function render() {
    requestAnimationFrame(render)
    uniform.time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
}
```

나머지 부분은 three.js 기초에 해당하는 부분입니다. [https://threejs.org/docs/#manual/en/introduction/Creating-a-scene](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene) canvas를 가져오고, scene을 구성하는 geometry와 geometry를 그릴 material을 설정해 줍니다.  

여기서 포인트는 glsl로 커스텀한 shader를 그리는 것이 목적이기에 THREE.ShaderMaterial 을 사용했습니다. 
ShaderMaterial은 [http://blog.302chanwoo.com/2016/08/shadermaterial1/
https://medium.com/@sidiousvic/how-to-use-shaders-as-materials-in-three-js-660d4cc3f12a
](http://blog.302chanwoo.com/2016/08/shadermaterial1/
https://medium.com/@sidiousvic/how-to-use-shaders-as-materials-in-three-js-660d4cc3f12a
) 여기서 참고해서 작성했습니다.

### 3. custom shader 붙이기

마지막 부분입니다.  
제가 원했던 것은 glsl shader를 js안에 string으로 두는게 아니라 별도의 파일로 관리하고 싶었습니다.
![03](/assets/images/ThreeJS/2021-01-17-configuration/03.png)
<center>(vs code plugin중 하나인 GLSL Lint)</center> <br>

가장 큰 이유는 **syntax highlighting** 이었는데요, GLSL Lint가 js 안의 string literal에도 glsl 오류 검사를 지원해주긴 하지만, highlighting이 제대로 안되는 문제가 있었습니다.

![04](/assets/images/ThreeJS/2021-01-17-configuration/04.png)
<center>(vs.vert)</center> <br>

위와 같이 따로 파일을 만들어주면 색깔이 제대로 들어가는 것을 확인할 수 있었습니다.


하지만 이렇게 따로 파일을 만들면 js 에서 local file read를 하거나 해야하는데, c/cpp, c# 위주 프로그래밍을 했던 저로서는 js에서 local file read를 하는게 얼마나 어려운지, 이상한 일인지 잘 몰랐습니다. (file I/O 가 어려운 언어라니..)

``` javascript
const promise_vs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/vs.vert/')).then(res => res.text());
const promise_fs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/fs.frag/')).then(res => res.text());

Promise.all([
    promise_vs,
    promise_fs
    ]).then(([vs, fs]) => main(vs,fs)
);
```

그래서 위와 같이 promise 기반으로 assets안의 파일을 읽고, 읽은 후에 render 부분이 돌아가도록 구현했습니다. 추후에 fbx나 png 파일을 사용해도 같은 방법으로 해결할 수 있을 것 같습니다.

제 블로그의 포스팅 중 **'TestJS' 포스팅**에서 모든 결과가 적용된 모습을 확인하실수 있습니다.  

질문이 있으시다면 [https://github.com/Cliwo/cliwo.github.io](https://github.com/Cliwo/cliwo.github.io) 여기에 issue 남겨주세요!
감사합니다.
