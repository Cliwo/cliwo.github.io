---
layout: post
title:  "[Unity] URP Custom Shadow Shader 도전하기 : Frame Debugger로 원인 찾기(3/3)"
date:   2021-01-13 01:45:00 +0900
categories: Unity
tags: [unity, shader, debug]
---
## [Unity] URP Custom Shadow Shader 도전하기 : Frame Debugger로 원인 찾기(3/3)

안녕하세요. 지난번에 이어 URP Custom Shadow Shader 마지막 편입니다. 이 글에서는 Frame Debugger로 문제 원인을 찾는 법을 살펴보겠습니다.

이번 편의 목차는 다음과 같습니다.

URP Custom Shadow Shader 도전하기 : Frame Debugger로 원인 찾기.

1. Frame Debugger 로 Shadow Map 확인하기
2. Shadow Map 에 영향을 줄 수 있도록 수정
3. 다른 방법

## **1. Frame Debugger 로 Shadow Map 확인하기**

지난 편에서 Shadow Map 을 확인하기로 하고 글을 마무리하였습니다.

![https://miro.medium.com/max/1423/1*urpb61JYVXKx4X1Azy1FcA.png](https://miro.medium.com/max/1423/1*urpb61JYVXKx4X1Azy1FcA.png)

문제의 Custom Lit (Soft Shadow) Shader와 (왼쪽) 기본으로 제공되는 Lit Shader (오른쪽) 을 Scene에 배치

확인을 위해서 우선 Scene 을 위와 같이 구성한 후

![https://miro.medium.com/max/444/1*aIO2F4CUCmUbD1kzf1Yd_w.png](https://miro.medium.com/max/444/1*aIO2F4CUCmUbD1kzf1Yd_w.png)

Window -> Analysis -> Frame Debugger를 실행해줍니다.

![https://miro.medium.com/max/1216/1*oOyhZGloQt4S48lxfFVq2w.png](https://miro.medium.com/max/1216/1*oOyhZGloQt4S48lxfFVq2w.png)

Frame Debugger 화면

왼쪽 상단의 Enable을 누르면 1 frame 이 캡쳐되면서 이 프레임이 그려지기 까지의 과정을 보여줍니다.

여기서보면 상단에 ‘Render Main ShadowMap’ 아래에 ‘ShadowLoopNewBatcher.Draw’가 있고 그 아래에 Shadow Map이 그려지는 과정이 보입니다.

지금은 보면 **영향을 주는 항목이 하나**이고, 그 항목의 **Shader는 ‘Universal Render Pipeline/Lit’** 이네요. 네 저희가 만든 **Custom Shader는 Shadow Map 을 그릴때 영향을 주지 않고 있습니다.** 저번 2편에서 Shadow 를 Receive 하지도, Cast 하지도 않는 물체를 Map 을 생성할 때 Cull 된다고 말씀 드렸는데, 현재 Cull 되는 상황인 것 같습니다.

결론적으로는 Shadow Map 이 비정상적인 것이 맞았으며, Shadow Map 에 저희가 만든 Shader가 영향을 줄 수 있다면 문제가 해결 될 것 같습니다.

## **2. Shadow Map 에 영향을 줄 수 있도록 수정**

[링크](https://baramlife.tistory.com/1)

어떻게 하면 Shadow Map 이 그려질 때 영향을 미칠 수 있을까 찾아보다가 한 글을 발견 했습니다. Shader 를 클릭 했을 때 Inspector 상에서 ‘Cast Shadow’가 yes가 되어야 Shadow Map에 반영된다는 내용이었습니다.

![https://miro.medium.com/max/946/1*Jg0p5aw84qOZrL_UtKwo-A.png](https://miro.medium.com/max/946/1*Jg0p5aw84qOZrL_UtKwo-A.png)

위처럼 마지막에 Fallback 코드를 추가하였습니다.

![https://miro.medium.com/max/650/1*gk90xq3f-V-_cU9PfB1zRg.png](https://miro.medium.com/max/650/1*gk90xq3f-V-_cU9PfB1zRg.png)

Cast Shadow가 yes로 변한 모습

![https://miro.medium.com/max/1127/1*z98T4PrYNZhzc-ssN5lHIA.gif](https://miro.medium.com/max/1127/1*z98T4PrYNZhzc-ssN5lHIA.gif)

Shadow 가 움직이지 않는다.. 띠용

![https://miro.medium.com/max/1424/1*HfsXLsEP4JXdy-CDkqFtww.gif](https://miro.medium.com/max/1424/1*HfsXLsEP4JXdy-CDkqFtww.gif)

Frame Debugger로 찍어봐도 오른쪽의 기본 Lit Shader만 변경점이 적용된다.

(사진에서 보이는 왼쪽 부분의 이상한 색상은 gif 때문에 발생한 오류입니다 ) 이 방법도 완벽하진 않은 것 같습니다. Shadow Map에 영향은 주고 있지만 실시간으로 변화하지 않습니다.

## **3. 다른 방법**

또 무한한 삽질 끝에 발견한 방법은 다음 링크입니다.

****[URP Default Unlit Based to Custom LightingToggle]_AlphaTest("Alpha Test", float) = 0 [Enum(UnityEngine.Rendering.CullMode)] _Cull("Cull Mode", Float) = 1…illu.tistory.com](https://illu.tistory.com/1407)**

**Shadow 를 Cast 하는 Pass를 추가**해준 코드입니다. 2편에서 Shadow Map에 설명드릴 때 Shadow Map은 간단히 말하면 ‘Light’의 시야에서 Scene을 Render한 결과라고 말씀 드렸습니다. 이 때 Camera에서 Render할 때 와 똑같이 Render하는 것이 아니라 Light의 시야에서 Render할 때의 행동을 정하는 Pass가 지금 추가해주는 Pass입니다.


![https://miro.medium.com/max/1424/1*GSdQWTjxvTvvA10fcHbdkQ.gif](https://miro.medium.com/max/1424/1*GSdQWTjxvTvvA10fcHbdkQ.gif)

아주 잘 바뀌는 Shadow Map

많은 우여곡절 끝에 문제를 해결할 수 있었습니다 ㅜㅜ

![https://miro.medium.com/max/1129/1*OU8IUa5mjXv-EqFMUAd92w.png](https://miro.medium.com/max/1129/1*OU8IUa5mjXv-EqFMUAd92w.png)

![https://miro.medium.com/max/685/1*i05sAA_A2nYQBurJIoqjzw.png](https://miro.medium.com/max/685/1*i05sAA_A2nYQBurJIoqjzw.png)

성공

매 Pass의 결과를 Debugger로 쉽게 볼 수 있다는건 정말 좋은 기능인 것 같습니다. 여기까지 해서 Frame Debugger로 문제 원인을 찾고, 해결 방법까지 적용해 보았습니다.

(1)hlsl 로 shader를 직접 코딩해보며 문제를 발견 (Shadow가 생기지 않는다.) 했고,   
(2)hlsl 코드를 따라가며 문제의 원인을 찾았으며 (Shadow Map이 정상이 아니다.)   
(3)Frame Debugger를 이용하여 Shadow Map이 정상적으로 수정될 때 까지 다양한 해결 방법들을 적용해 보았습니다.  

이상으로 URP Custom Shadow Shader 포스팅을 마치겠습니다. 감사합니다.