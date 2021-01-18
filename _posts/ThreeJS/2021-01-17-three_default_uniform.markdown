---
layout: post
title:  "three.js에서 projectionMatrix를 바로 쓸 수 있는 이유 - default uniform"
date:   2021-01-17 00:10:00 +0900
categories: ThreeJS
tags: [three]
---

## three.js 사용 시, vertex shader에서 projectMatrix를 바로 쓸 수 있는 이유

![01](/assets/images/ThreeJS/2021-01-17-default_uniform/01.png)
<center>(default uniform 들)</center> <br>

[https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram](https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram)

위의 링크에서 확인할 수 있다.
modelMatrix, modelViewMatrix, normalMatrix (mv의 transpose) 등등 많이 쓰이는 uniform들은 아에 default uniform으로 정의 해놓은 것을 확인할 수 있다.

괜히 또 만들어서 쓰지 말자!