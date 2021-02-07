---
layout: post
title:  "Graphics Pipeline"
date:   2021-02-07 11:25:00 +0900
categories: Graphics
tags: [graphics, terminology]
---
## Graphics Pipeline

> **Data(3D Data, Texture, etc..)로 2D Image를 그려내기 위한 일련의 과정.** Hardware과 담당하는 부분과 Software가 담당하는 부분으로 나뉘며, Software가 담당하는 부분은 **Shader** 라고 한다.

참고 : [https://en.wikipedia.org/wiki/Graphics_pipeline](https://en.wikipedia.org/wiki/Graphics_pipeline)    

### 예시

![01](/assets/images/Graphics/2021-02-07-Graphics_Pipeline/01.png)
<center>(OpenGL 4.6 Profile) </center> <br>

출처 : [https://www.khronos.org/registry/OpenGL/specs/gl/glspec46.compatibility.pdf](https://www.khronos.org/registry/OpenGL/specs/gl/glspec46.compatibility.pdf)


![02](/assets/images/Graphics/2021-02-07-Graphics_Pipeline/02.png)  
<center>(자주 사용 되는 Graphics Pipeline 부분) </center> <br>

위의 이미지에서 빨간 박스에 해당하는 부분이 Graphics Pipeline의 큰 줄기라고 생각할 수 있다. Tessellation Shader(OpenGL 4.0)나 Geometry Shader(OpenGL 3.2)는 비교적 최근에 생겼다.

다른 포스팅에서 조금 더 자세한 내용을 다룰 것이므로 여기서는 짧게 정리하고자 한다.

* **Vertex Shader** : 각각의 **'정점' 하나를 입력**을 받아 다시 **'정점'을 출력**하는 병렬처리 단계. 보통 Object Space 상에서 정의된 Vertex를 NDC Space 로 보내는 작업이 여기서 이루어집니다.  

* **Tesellation Shader** : Tessllation Shader는 다시 Tessellation Control Shader (**TCS**), Tessellation Primitive Generator (**TPG**), Tessellation Evaluation Shader (**TES**), 총 3개의 부분으로 나뉩니다. Tessellation 은 결국 크게 보면, **큰 표면을, 세밀한 표면으로 나누는 일련의 작업**입니다. (Tessellation 포스트에서 더 자세히 다루겠습니다.)


* **Geometry Shader** : **Primitive 하나를 입력**으로 받아 **0개 또는 다수의 Primitive를 다시 출력**하는 쉐이더입니다. Vertex Shader와 가장 큰차이는 Primitive를 입력으로 받기에, Vertex와 그 주변의 Vertex에 대한 정보에 동시에 접근할 수 있다는 점입니다. 사용되는 예시로, Point를 입력으로 받아 Quad로 바꿔서 **Particle Rendering**에 사용될 수 있습니다. 

* **Fragment Shader** : **Pixel의 색상 정보를 결정**하는 Shader 입니다. 입력은 fragment입니다. 입력이 Pixel 이라고 말하기는 어려운 것이, 하나의 pixel에도 fragment shader가 여러번 호출 될 수 있지만. (fragment 여러 개가 하나의 pixel에 영향을 미치는 경우 (MSAA 예시에서 확인할 수 있습니다.)) fragment 당 fragment shader는 한 번만 불립니다.  
참고 : [https://gamedev.stackexchange.com/questions/63992/how-many-times-fragment-shader-is-executed](https://gamedev.stackexchange.com/questions/63992/how-many-times-fragment-shader-is-executed)

* **Transform Feedback** : Compute Shader가 등장하기 전에 주로 사용됬던 방법으로, **Graphics Pipeline이 계산한 결과를 Memory에 저장하거나, 기존의 Memory에 저장된 data를 변경하는 기능입니다.** 예를 들어 모든 Vertex에 force를 가해 Vertex의 위치를 변경시키는 등의 작업에 사용되었습니다 **(Simulation)**. Compute Shader를 대신에서 사용하거나, Transform Feedback을 대신해서 Compute Shader를 씁니다.

* **Compute Shader** : 다른 Shader와 달리 Rendering에 사용 될 수도, 아닐 수도 있습니다. Compute Shader를 이용한 Simulation 병렬처리 등이 가능합니다. GPU를 사용하는 병렬처리 도구라고 볼 수 있습니다. 