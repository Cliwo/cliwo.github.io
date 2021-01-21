---
layout: post
title:  "ThreeJS - PhongShading 구현 #1"
date:   2021-01-22 00:06:00 +0900
categories: ThreeJS
tags: [three]
---

## ThreeJS - RimLight 와 Phong Shading 구현 (GLSL) #1

홀리씻..

이번 포스팅은 glsl로 직접 RimLight를 구현하는 내용입니다.
RimLight에 앞서서 Light 구현을 위해 Phong Shading도 구현했습니다.
오랜만에 하려하니까 빡세네요 ㅋㅋ ㅜㅜ  

1,2는 이번 포스팅에서 다루고, 3은 다음 포스팅 (#2에서 다루도록 하겠습니다.)

**목차 :**
1. Gouraud vs Phong Shading (#1)
2. Phong Shading 구현 (#1)
   1. Three.js - glsl Shader에서 Light 사용하기
   2. Phong Shading 구현
3. Rim Light 구현 (#2)
  

### 1. Gouraud Shading vs Phong Shading

참고 :  
[https://en.wikipedia.org/wiki/Gouraud_shading](https://en.wikipedia.org/wiki/Gouraud_shading)  
[https://en.wikipedia.org/wiki/Phong_shading](https://en.wikipedia.org/wiki/Phong_shading)  
이 내용은 Wiki 기준으로 정리했습니다. 우선 가장 큰 차이는 다음과 같습니다.  

```
Lighting 연산을 Vertex 단위로 해서 interpolation 하는가 - Gouraud vs
Fragment(Pixel) 단위로 하는가 - Phong
```

Gouraud Shading이 Vertex 단위로 Lighting을 계산 후 선형 보간으로 Vertex 내부의 pixel의 색을 채우는 방식입니다.

![01](/assets/images/ThreeJS/2021-01-21-RimLightDev/01.png)
<center>(Gouraud Shading 결과)</center> <br>

이 방식은 Mesh가 충분히 Fine하지 않으면 하이라이트가 뭉개져서 보이게 된다는 단점이 있습니다.  


Phong Shading이 여기서 Lighting 계산을 Fragment Shader로 옮겨서, Pixel마다 따로 해주는 방식입니다.

![01](/assets/images/ThreeJS/2021-01-21-RimLightDev/02.png)
<center>(Phong Shading 결과)</center> <br>

하이라이트(Specular) 부분이 훨씬 자연스러운 것을 볼 수 있습니다.

### 2.Phong Shading 구현  
  
Three.js에서 Phong Shading 구현하면서 2번의 고비가 있었습니다.  
첫번째는 Scene에 Add한 **Light를 glsl에서 사용하는 것**이었습니다. 공식 문서도 제대로 된게 없고 stackoverflow 답변들도 다 오래된 것들이더라구요 ㅜㅜ  
여기서 정리해놓은 내용으로 다른 분들은 삽질하지 않으시면 좋겠습니다 ㅜ  
  
두번째는 Phong Shading을 구현하는 것이었는데 이것도 Three.js에서 제공하는 **default uniform이 어떤 space상의 vector**인지 정보가 없어서 해맸습니다. 
```
    vec3 lightDir; //world space 인가? view space 인가?
```


#### 1.Three.js - glsl Shader에서 Light 사용하기  

```javascript
...
{
  var uniforms = THREE.UniformsUtils.merge( [
    THREE.UniformsLib[ "lights" ]
    ] );
  const cubeMat = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    lights: true,
    vertexShader: vs,
    fragmentShader: fs
    } );
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
}
...
```

이번에 RimLight + Phong Shading 구현하면서 작성한 js 부분입니다. 보시면 **THREE.ShaderMaterial** 로 glsl Shader를 불러옵니다.  
이 때 Scene에 추가한 Light정보를 사용하려면 **Three.UniformsUtils.merge**로 Three.js가 제공하는 포맷에 맞는 uniform들을 설정해 줘야합니다.  
또한 이를 material에 추가하는 것 뿐만 아니라 
```
    uniforms: uniforms,
    lights: true,
```
**lights: true** 도 꼭 해줘야 합니다. 

여기까지는 쉬운데 그럼 glsl에서 uniform으로 어떻게 받아야 하는지가 문제입니다.

**틀린 예시 #1**  
[https://stackoverflow.com/questions/30151086/threejs-how-do-i-make-a-custom-shader-be-lit-by-the-scenes-lights](https://stackoverflow.com/questions/30151086/threejs-how-do-i-make-a-custom-shader-be-lit-by-the-scenes-lights)

```glsl
uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];
uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];
```
2015년도에는 이렇게 했나 봅니다. 이러면 안돌아가요 ㅠ  

**틀린 예시 #2**  
[https://stackoverflow.com/questions/35596705/using-lights-in-three-js-shader](https://stackoverflow.com/questions/35596705/using-lights-in-three-js-shader)
```glsl
#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
        int shadow;
        float shadowBias;
        float shadowRadius;
        vec2 shadowMapSize;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif
```  
이것도 안됩니다. 최종 결과랑 조금 비슷하긴 한대, 아마 추가적인 기능들을 사용하느라 member가 늘어난 것 같습니다. 다만 결론부터 말하자면 **'uniforms'에 전달한 것과 정확하게 똑같은 형태가 아니면 에러 나고 안 그려집니다.**

**정답**
```glsl
#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif
```

나중에 이 게시글을 보실 때는 또 달라질 수 있어요. 정확하게 해결하는 방법은 **uniforms를 log**찍어보는 것입니다.

```javascript
...
{
  var uniforms = THREE.UniformsUtils.merge( [
    THREE.UniformsLib[ "lights" ]
    ] );
  console.log(uniforms)
}
...
```

![03](/assets/images/ThreeJS/2021-01-21-RimLightDev/03.png)
<center>('directionalLights' 아래 'direction' 과 'color')</center> <br>
여기에서 찍히는 것과 완전히 동일하게 uniform 설정하시면 잘 될 겁니다.  


#### 2.Phong Shading 구현  
  
**참고 : ** 
Phong Shading 구현 - [http://www.opengl-tutorial.org/kr/beginners-tutorials/tutorial-8-basic-shading/](http://www.opengl-tutorial.org/kr/beginners-tutorials/tutorial-8-basic-shading/)  
Vertex Shader - [https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.vs](https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.vs)  
Fragment Shader - [https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.fs](https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.fs)  


```glsl
varying vec3 WorldPos;
varying vec3 ViewPos;

varying vec3 NormalInWorld;
varying vec3 NormalInView;


void main()
{
    WorldPos = vec3(modelMatrix * vec4(position, 1.0));
    ViewPos = vec3(viewMatrix * modelMatrix * vec4(position, 1.0));

    NormalInWorld = mat3(transpose(inverse(modelMatrix))) * normal;
    NormalInView = normalMatrix * normal; 
    gl_Position = projectionMatrix * viewMatrix * vec4(WorldPos, 1.0);
}
```
<center>(vertex shader)</center> <br>

```glsl
#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif

varying vec3 WorldPos;
varying vec3 ViewPos;
varying vec3 NormalInView;
varying vec3 NormalInWorld;


void main()
{
    // ambient
    // vec3 ambient = light.ambient * material.ambient;
  	 
    vec3 normInView = normalize(NormalInView); // in view space
    vec3 viewDirInViewSpace = -normalize(ViewPos);
    vec3 viewDirInWorldSpace = normalize(cameraPosition - WorldPos);

    // diffuse
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    for(int i = 0; i < NUM_DIR_LIGHTS; i++)
    {
        vec3 lightDir = directionalLights[i].direction;
        float nDotL = max(dot(normInView, lightDir), 0.0);
        diffuse += directionalLights[i].color * (nDotL);
    }
    
    // specular
    vec3 specular = vec3(0.0, 0.0, 0.0);
    for(int i = 0; i < NUM_DIR_LIGHTS; i++)
    {
        vec3 reflectDir = reflect(-directionalLights[i].direction, normInView); 
        float spec = pow(max(dot(viewDirInViewSpace, reflectDir), 0.0), 50.0);
        specular += directionalLights[i].color * spec;  
    }
   
    // Rim Light
    float vDn = 1.0 - max(dot(viewDirInViewSpace, normInView), 0.0);
    vec3 rim = vec3(smoothstep(0.6, 1.0, vDn));

    gl_FragColor = vec4(diffuse + specular + rim, 1.0);
} 
```
<center>(fragment shader)</center> <br>

**Vertex Shader**
```glsl
NormalInWorld = mat3(transpose(inverse(modelMatrix))) * normal;
NormalInView = normalMatrix * normal; 
```

VS는 큰 내용이 없습니다. normal을 공간변환 해줄 때 **Vertex를 공간변환 해주는 행렬의 transpose**를 곱해주는 내용만 주의하면 됩니다. (normalMatrix는 transpose(MV)와 동일합니다. (default uniform))  

**Fragment Shader**
```glsl
vec3 diffuse = vec3(0.0, 0.0, 0.0);
for(int i = 0; i < NUM_DIR_LIGHTS; i++)
{
    vec3 lightDir = directionalLights[i].direction;
    float nDotL = max(dot(normInView, lightDir), 0.0);
    diffuse += directionalLights[i].color * (nDotL);
}
```
<center>(diffuse)</center> <br>

FS는 가장 쉬운 diffuse 부터 보겠습니다. N Dot V 만 계산하면 쉬운데요. 여기서 주의할 점은 **directionalLights[i].direction 가 ViewSpace 상의 방향벡터** 라는 점입니다.  
따라서 곱해주는 normal도 **ViewSpace 상의 normal**을 곱해줘야합니다.    
작성한 코드가 잘 동작하는지 확인하는 방법은 Three.js가 기본 제공하는 MeshPhongMaterial이랑 광원을 받았을 때 똑같이 Shading 되는지 확인하는 것입니다. (저는 자꾸 달라서 계속 삽질하다가 결국 찾았습니다..)

```glsl
vec3 specular = vec3(0.0, 0.0, 0.0);
for(int i = 0; i < NUM_DIR_LIGHTS; i++)
{
    vec3 reflectDir = reflect(-directionalLights[i].direction, normInView); 
    float spec = pow(max(dot(viewDirInViewSpace, reflectDir), 0.0), 50.0);
    specular += directionalLights[i].color * spec;  
}
```
<center>(specular)</center> <br>

specular가 좀 어려웠습니다. 우선 **-directionalLights[i].direction** 부분에 주의해야합니다. 자꾸 엉뚱한 곳에서 하이라이트가 생기길레 뭐지.. 하고 이론을 찾았는데

![04](/assets/images/ThreeJS/2021-01-21-RimLightDev/04.png)
<center>(OpenGL Tutorial 캡쳐. 역시 이론이 중요하다)</center> <br>

반사되어 나가는 벡터를 구하는 것이므로 l에 -해주고 reflect를 해줘야하더군요. diffuse에서 짚은것 처럼 direction은 ViewSpace 상 vector 이므로 주의해줍니다. 

또한 **viewDirInViewSpace** 도 마찬가지로, Camera의 방향 벡터도 **View Space** 상의 방향벡터로 구해야합니다. 

![05](/assets/images/ThreeJS/2021-01-21-RimLightDev/05.png)
<center>(완성)</center> <br>

다음 시간에는 RimLight 구현 부분을 다루고 마무리하도록 하겠습니다.
