---
layout: post
title:  "three.js 용 glsl shader 관리하기"
date:   2021-01-24 19:00:36 +0900
categories: ThreeJS
tags: [three]
---

## three.js 용 glsl shader 관리하기

이전 포스팅에서 glsl shader를 관리하는 방법에 문제가 있었다.

이전 포스트 : [https://cliwo.github.io/threejs/2021/01/16/three_configuration.html]()

```javascript
const promise_vs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/vs.vert/')).then(res => res.text());
const promise_fs = fetch(new Request('http://' + window.location.host + '/assets/glsls/TestJS/fs.frag/')).then(res => res.text());

Promise.all([
    promise_vs,
    promise_fs
    ]).then(([vs, fs]) => main(vs,fs)
);
```

기존의 방식은 Request를 써서 http request를 때리는 식이었는데 크게 2가지 문제가 있다.

1. Mixed content 문제
2. url이 만들어지지 않는 문제

### 1. Mixed Content 문제

![01](/assets/images/ThreeJS/2021-01-24-glsl_shader_config/01.png)
<center>(Mixed content 오류시 오류 내용)</center> <br>

**https 로 접근하는 페이지에서 http request가 발생했을 때 브라우저가 이를 막아버린다.** 위의 코드를 보면 http request를 보내기 때문에 문제가 생겼었다. 그럼 https 로 바꾸면 되는 쉬운 문제 아닌가? 싶지만... (만약 사이트가 http, https 둘 다 지원한다면)

### 2. url이 만들어지지 않는 문제

예를 들어 이전 포스팅이었던 'ThreeJS - RimLight 와 Phong Shading 구현 (GLSL) #2' 포스트에서 이미지는 아래의 url로 접근가능하다.

    https://cliwo.github.io/assets/images/ThreeJS/2021-01-21-RimLightDev/07.png

하지만 'RimLight'포스트에서 사용하려고 했던 checker.png는 아래와 같은 url로 접근할 수 없다.

    https://cliwo.github.io/assets/glsls/RimLight/checker.png/

무슨차이인가 싶어서 이것 저것 조사해보다가
Chrome 디버그창에서 실마리를 찾을 수 있었다. 

![01](/assets/images/ThreeJS/2021-01-24-glsl_shader_config/02.png)
<center>(assets 폴더 아래 images)</center> <br>

아마도 Jekyll이 markdown을 읽어서 html을 생성할 때는, **assets라는 폴더 안의 모든 자료들을 url로 접근할 수 있게 만들어주는 것이 아니라, 딱 사용 되는 자료들만 url로 접근하게 만드는** 느낌이었다.

즉, http/https 오류를 고쳐도, 접근할 수 없다면 소용이 없다.

### 해결

1. html script tag 사용
2. 사용할 이미지 markdown에 추가

### 1. html 'script' tag 사용

![01](/assets/images/ThreeJS/2021-01-24-glsl_shader_config/03.png)
<center>(script tag로 shader import)</center> <br>

위와 같이 'glpost.html'을 수정해주었다.
html에서 shader를 선언하되, 직접 작성하는게 아니라 source로 부터 읽어오게 만든다. (별개의 파일로 편하게 관리할 수 있게)

### 2. 사용할 이미지 markdown에 추가

![01](/assets/images/ThreeJS/2021-01-24-glsl_shader_config/04.png)
<center>(vs, fs가 추가되고, png 추가된 Markdown)</center> <br>

또한 특정 이미지를 사용해야 한다면 (Texture 등) markdown에 추가해주면 끝이다.  
이전에는 sources 탭에서 보이지 않던 .png가 보인다.

![05](/assets/images/ThreeJS/2021-01-24-glsl_shader_config/05.png)
<center>(이제 보이는 chekcer.png)</center> <br>


최종 결과 :  
[https://cliwo.github.io/threejs/2021/01/18/RimLight.html](https://cliwo.github.io/threejs/2021/01/18/RimLight.html)

드디어 ... ㅠ 그렇게 삽질하던 결과가 remote에서도 잘 보인다. 앞으로도 이거 저거 더 구현해 봐야겠다.