---
layout: post
title:  "ThreeJS - PhongShading 구현 #2"
date:   2021-01-22 00:06:00 +0900
categories: ThreeJS
tags: [three]
---

## ThreeJS - RimLight 와 Phong Shading 구현 (GLSL) #2

두 번째 포스팅입니다. RimLight 구현 부분을 다룹니다.

**목차 :**
1. Gouraud vs Phong Shading (#1)
2. Phong Shading 구현 (#1)
   1. Three.js - glsl Shader에서 Light 사용하기
   2. Phong Shading 구현
3. Rim Light 구현 (#2)
  

### 3. Rim Light 구현
참고 :  
[https://www.roxlu.com/2014/037/opengl-rim-shader](https://www.roxlu.com/2014/037/opengl-rim-shader)



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



**Fragment Shader**
```glsl
// Rim Light
float vDn = 1.0 - max(dot(viewDirInViewSpace, normInView), 0.0);
vec3 rim = vec3(smoothstep(0.6, 1.0, vDn));

gl_FragColor = vec4(diffuse + specular + rim, 1.0);
```
<center>(rim light)</center> <br>

rim light는 **fresnel 방정식**에 의해서 설명되고, 백라이트가 강할 때 물체의 테두리 부분에 강한 반사가 일어나는 현상을 의미합니다. **백라이트가 강해야** 잘 보여서 Scene에 back light를 추가하고 intensity를 충분히 주는 것이 중요합니다. 

#### Fresnel 방정식
코드를 보기전에 프레넬 방정식을 짚고 넘어갑시다. 프레넬 방정식은  
    
    빛이 매질의 경계에 입사할 때 굴절(투과), 반사량을 설명하는 방정식

입니다.  
여기서 입사각에 따른 굴절각, 전반사 등을 설명하는 법칙이 Snell의 굴절 법칙 (Snell's law) 가 있습니다. (프레넬 방정식의 일부)  

![07](/assets/images/ThreeJS/2021-01-21-RimLightDev/07.png)
<center>(Snell's law)</center> <br>

![06](/assets/images/ThreeJS/2021-01-21-RimLightDev/06.png)
<center>(Snell's law)</center> <br>

n1과 n2는 주어지는 상수 (굴절률) 이고 입사각이 커질수록 굴절각도 커지는 것을 볼 수 있습니다. (비례하니까요) 여기서 **굴절각이 커저서 90도를 이루게 되면 이 후, 더 이상 굴절은 일어나지 않고 반사만 일어납니다.** 즉 입사하는 모든 빛이 매질 안으로 들어가지 않고 다 반사된다는 것이죠.  

이걸 눈의 입장에서 생각하면, **표면과 비스듬하게 바라보면, 입사하는 빛이 물체에 흡수되지 않고 죄다 눈으로 반사**된다는 말이 됩니다. 
그래서 **물체가 밝게 보이게 되죠**.  

여기서 '비스듬하게'는 결국 **표면의 법선 벡터와 거의 90도**를 이루게 본다는 뜻입니다.

    즉, 림라이트가 발생하는 위치는 카메라와 normal이 거의 90도를 이루는 부분입니다.



따라서 viewDir와 normal에 적절한 연산을 해서 밝게 해줄 곳을 찾으면 됩니다.

다시 코드로 돌아가서
```glsl
// Rim Light
float vDn = 1.0 - max(dot(viewDirInViewSpace, normInView), 0.0);
vec3 rim = vec3(smoothstep(0.6, 1.0, vDn));

gl_FragColor = vec4(diffuse + specular + rim, 1.0);
```
<center>(rim light)</center> <br>

vDn은 viewDir과 normal이 얼마나 90도에 가까운 각을 이루는지 설명합니다.  
smoothstep부분은 trick에 가깝습니다. 

![08](/assets/images/ThreeJS/2021-01-21-RimLightDev/08.png)
<center>(제대로 된 Fresnel)</center> <br>

제대로 하려면 위의 함수를 사용해서(점선이 Reflection입니다.) 90도에 가까우면 급격하게 상승시켜야 하지만 **비용도 비싸고**, 정확히 묘사하려면 **매질마다 함수가 달라져야**해서 (굴절율이 다르므로) smoothstep으로 적당히 조절합니다. 

따라서 단 2줄 안에 Rim Light 구현이 끝나게 됩니다.


이상으로 Phong Shading과 Rim Light 구현 포스팅을 마치도록 하겠습니다. 궁금하신점 있다면 issue 로 달아주세요!