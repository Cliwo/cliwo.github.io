---
layout: post
title:  "[Unity] URP Custom Shadow Shader 도전하기 : 코드 따라가며 문제 원인 찾기 (2/3)"
date:   2021-01-13 01:32:00 +0900
categories: Unity
tags: [unity, shader, debug]
---
## URP Custom Shadow Shader 도전하기 : 코드 따라가며 문제 원인 찾기 (2/3)

안녕하세요. 지난번에 이어 URP Custom Shadow Shader 2편입니다. 이 글에서는 문제 원인을 찾아가는 과정에 대해서 자세히 보여드릴 것입니다.

이번 편에서는 특히 hlsl 코드를 수정하면서 정확히 어떤 것이 잘못 되어서 원하는 결과가 나오지 않는지 알아보도록 하겠습니다.
이번 편의 목차는 다음과 같습니다.

URP Custom Shadow Shader 도전하기 : 코드 따라가며 문제 원인 찾기
1. Graphics에서 Shadow를 그리는 방법에 대해서
2. HLSL 코드 따라가며 원인 찾기


## 1. Graphics에서 Shadow를 그리는 방법에 대해서
보통 그래픽스에서 Real Time으로 Shadow를 그리는 방법은 2가지가 있습니다. (1)Shadow Map을 이용한 방법, (2) Shadow Volume을 사용하는 방법.

![01](/assets/images/Unity/02/01.png)
<center> (1) Shadow Map 방식 
<a href="http://www.downloads.redway3d.com/downloads/public/documentation/bk_re_shadow_mapping_detailed.html">http://www.downloads.redway3d.com/downloads/public/documentation/bk_re_shadow_mapping_detailed.html</a>  </center> <br>

![01](/assets/images/Unity/02/02.png)
<center>(2) Shadow Volume 방식 
<a href="https://www.researchgate.net/figure/Light-ray-projection-and-shadow-volume-limited-by-a-front-cap-and-back-cap-to-enclose-the_fig2_261295750">http://www.downloads.redway3d.com/downloads/public/documentation/bk_re_shadow_mapping_detailed.html</a> 
</center> <br>

두 방식에는 서로 장단점이 있습니다. 여기서는 (1) Shadow Map 방법에 대해 짚고 넘어가겠습니다.

Shadow Map 방식은 간단히 말하면 'Light'의 시각(시야)에서 Scene 을 Render하고 이 Render 한 결과를 Texture로 사용하는게 Shadow Map입니다. 즉 (1) Light의 위치에서 Render하고 (2) Camera 위치에서 Render 할 때 (1)의 결과를 이용해서 내가 그리는 pixel이 Shadow의 영향을 받는지 받지 않는지 결정합니다.

여기서 중요한 점은 Shadow를 Cast하지 않고 (그림자를 드리움) Receive 하지도 않는 (그림자에 드리워짐) 물체는 (1) Light의 위치에서 Render 할 때 마치 없는 물체처럼 취급된다는 것입니다. 즉 Cull 되버린다는 것이죠.

## 2. HLSL 코드 따라가며 원인찾기
이미 Shadow Map 에 대해 언급했기 때문에 아시겠지만 결국 이전 코드의 문제는 Shadow Map 의 문제였습니다. 어떻게 Shadow Map 이 범인이었는지 알게되는 과정에 대해서 알아보겠습니다.

![01](/assets/images/Unity/02/03.png)
<center>Fragment Shader</center> <br>

Fragment Shader 부터 살펴보면 (1)N dot L을 계산하는 부분, (2)Main Texture 로 albedo 가져오는 부분, (3)ambient를 계산하는 부분은 Shadow에 영향을 주지 않을 것이 분명합니다.

결국은 GetMainLight() 함수에서 shadowAttenuation과 distanceAttenuation 부분이 제일 의심됩니다.
  
![01](/assets/images/Unity/02/04.png)
<center>Vertex Shader</center> <br>
  
Vertex Shader로 올라가서 GetMainLight() 함수의 인자는 Vertex shader에서 계산된 shadowCoord 이므로 이 값이 잘 못되어도 이상한 결과가 나올 수 있습니다.

첫 번째 확인 : Shadow Coord

![01](/assets/images/Unity/02/05.gif)
<center>Shadow Coord를 output으로 해서 확인해보았을 때</center> <br>

![01](/assets/images/Unity/02/06.png)
<center>fragment shader return 값</center> <br>

Shadow Coord를 렌더했을 때 정확히 어떤 색이 나와야하는지는 모르지만 전체가 1이거나 0은 아니고, uv 에 따라 적당하게 변하는 값을 가지고 있는 것을 확인할 수 있습니다. 따라서 GetMainLight 함수 내부가 더 의심되는 상황이네요.

두 번째 확인 : GetMainLight()

![01](/assets/images/Unity/02/07.png)
<center>com.unity.render-pipelines.universal@7.1.8/ShaderLibrary/Lighting.hlsl 의 GetMainLight함수</center> <br>

Fragment Shader에서 호출하는 GetMainLight함수는 Lighting.hlsl 파일에 있습니다(마둠파님 튜토리얼 참고). 간단히 체크하시면 LIGHTMAP_ON과 _MIXED_LIGHTING_SUBTRACTIVE 키워드는 선언되지 않은 것을 알 수 있습니다. (fragment shader에서 keyword가 define 되었을 때 빨간 색, 아닐 때 검은 색을 return하도록 설정해서 체크해보면 됩니다.)

<pre><code>
// unity_LightData.z is 1 when not culled by the culling mask, otherwise 0.
</code></pre>

코드를 읽다 보면 이 주석에 따라 light.distanceAttenuation은 항상 1임을 알 수 있습니다. 즉 지금 Shadow가 생기지 않는 이유는 light.shadowAttenuation 의 문제라는 것입니다.

세 번째 확인 : MainLightRealtimeShadow()

![01](/assets/images/Unity/02/08.png)
<center>com.unity.render-pipelines.universal@7.1.8/ShaderLibrary/Shadows.hlsl 의 MainLightRealtimeShadow함수</center> <br>

light.shadowAttenuation는 MainLightRealtimeShadow()함수에 의해 결정됩니다. MainLightRealtimeShadow함수를 확인해 봅시다.

<pre><code>
(MainLightRealtimeShadow 함수 내부)
...
ShadowSamplingData shadowSamplingData = GetMainLightShadowSamplingData();
half4 shadowParams = GetMainLightShadowParams();
return SampleShadowmap(TEXTURE2D_ARGS(_MainLightShadowmapTexture, sampler_MainLightShadowmapTexture), shadowCoord, shadowSamplingData, shadowParams, false);
...
</code></pre>

keyword 선언 부분을 또 수동으로 체크하면 (개인적으로 이 과정이 제일 귀찮더라구요..) 위의 코드 부분에 범인이 있다는 걸 알 수 있습니다.

SampleShadowmap이라는 함수가 light.shadowAttenuation을 결정하는 것인데 이 함수에 필요한 인자값들을 GetMainLightShadowParams()와 GetMainLightShadowSamplingData()를 이용해서 가져오고 SampleShadowmap이라는 함수를 호출하네요.

네 번째 확인 : SampleShadowmap() / SampleShadowmapFiltered()

![01](/assets/images/Unity/02/09.png)
<center>com.unity.render-pipelines.universal@7.1.8/ShaderLibrary/Shadows.hlsl 의 SampleShadowmap함수</center> <br>

![01](/assets/images/Unity/02/10.png)
<center>com.unity.render-pipelines.universal@7.1.8/ShaderLibrary/Shadows.hlsl 의 SampleShadowmapFiltered 함수</center> <br>

이제 다 왔습니다. 여기가 끝이에요. SampleShadowmap이라는 함수에서 light.shadowAttenuation 값을 결정합니다. 여기서 함수 이름으로부터 URP의 RealtimeShadow 방식은 Shadow Volume 방식이 아니라 Shadow Map 방식임을 알 수 있습니다.

코드를 읽어보면 Soft 방식에서는 Shadow Map을 여러번 읽어와서 Blur 하는 방식임을 알 수 있고 Hard 방식에서는 한 번만 Shadow Map을 참조하는 것을 알 수 있습니다. Texture를 여러번 Lookup 해서 얻은 결과를 Weighted Sum 하는 방식은 Graphics에서 많이 사용되는 방식입니다. (MSAA도 비슷한 방식이죠)

이 쯤 되면 머리가 복잡 하실 테니 함수 Call Stack을 간단히 정리하겠습니다.

![01](/assets/images/Unity/02/11.jpeg)
<center>Call Stack</center> <br>

SampleShadowmapFiltered 에서 light.shadowAttenuation 값이 제대로 설정되지 않는 이유는 여러가지일 수 있습니다.
* Shadow map 자체가 비정상적이다
* ShadowCoord가 잘못 됬다.
* fetchesWeights 배열이 잘못 설정되었다. (죄다 0이거나 등등..)

Coord나 Weights는 내부 함수로 설정 됩니다. 만약 이 값들이 잘 못된 것이라면 기본적으로 엔진에서 제공되는 Lit 머티리얼도 잘못된 결과를 보여줄 확률이 높습니다.

![01](/assets/images/Unity/02/12.png)
<center>기본 제공하는 Lit Shader가 적용된 머티리얼로 Sphere과 Plane을 설정한 결과. Soft Shadow가 잘 보인다.</center> <br>

Lit Shader를 적용하여 확인한 결과 매우 멀쩡했습니다. 만약 Lit Shader가 Lighting.hlsl 이나 Shadows.hlsl이 아닌 다른 hlsl 파일을 이용해서 Shading 된다면야 Coord와 Weights가 잘 못 됐을 수 있는 확률이 있지만 그러진 않을 것 같으므로 Shadow map을 먼저 확인해 보도록 하겠습니다.

또한 **Shadow map을 확인하는게 더 쉽습니다.**

이 글을 정리하며 초보자 분들께 드리는 팁은 다음과 같습니다.

1. Scalar, Vector 값을 확인하고 싶을 때는 Fragment Shader의 return 값으로 해당 값을 뿌려보자 (출력해보자)
2. Keyword를 확인하고 싶다면 #if 와 #endif를 이용해서 체크해보자.


여기까지 hlsl 코드를 따라가면서 문제 원인을 찾아보았습니다. 다음 편에서는 Frame Debugger를 이용해서 직접 Shadow Map 을 확인하며 문제를 해결해 보겠습니다.