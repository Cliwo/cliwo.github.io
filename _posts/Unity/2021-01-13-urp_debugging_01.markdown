---
layout: post
title:  "[Unity] URP Custom Shadow Shader 도전하기 : 문제편 (1/3)"
date:   2021-01-13 01:18:00 +0900
categories: Unity
---

## URP Custom Shadow Shader 도전하기 : 문제편 (1/3) 

![01](/assets/images/Unity/01/01.png)
<center>(왼쪽이 Custom N dot L Shader 오른쪽이 기본 Lit Shader)</center> <br>
이 글은 URP에서 Soft Shadow를 hlsl shader 코드로 만들어내는 내용을 다룹니다 (마둠파님의 튜토리얼을 따라하며). 사실 URP에서 SoftShadow를 얻는 것은 이제 설정 한번이면 가능합니다. Pipeline Asset에서 Shadows 항목에서 Soft Shadow를 체크해주면 한 방에 해결.

![02](/assets/images/Unity/01/02.png)
<center>(Shadows -> Soft Shadows를 체크하면 Lit Shader에서 예쁜 Soft Shadow가 나옵니다.)</center> <br>

그럼에도 불구하고 이 글을 쓰는 이유는 다음과 같습니다.

* 저처럼 Unity Shader 에 익숙하지 않은, 학교에서 그래픽스 수업만 들어 glsl/hlsl shader 코드만 대충 읽을 수 있는 사람이 어떻게 Shader 문제를 해결하는지 공유하고 싶어서
* 여기서 적용해본 문제 원인을 찾는 방법을 다른 문제에도 똑같이 적용해 볼 수 있으므로


이 시리즈의 목차는 다음과 같습니다.
1. URP Custom Shadow Shader 도전하기 : 문제편
2. URP Custom Shadow Shader 도전하기 : 코드 따라가며 문제 원인 찾기
3. URP Custom Shadow Shader 도전하기 : Frame Debugger 로 문제 원인 찾기

이번 편인 URP Custom Shadow Shader 도전하기 : 문제편은 다음과 같이 나뉩니다.

1. 마둠파님 튜토리얼 따라하기
2. 문제 확인하기 (Shadow가 나오지 않음)


## 1. 마둠파님 튜토리얼 따라하기
마둠파 테크니컬 아트 연구소 : 네이버 블로그
[descriptionblog.naver.com](descriptionblog.naver.com)

먼저 마둠파님의 튜토리얼을 따라했습니다. 전 URP와 HDRP 이전에도 Unity Shader를 직접 작성해본적 없는 뉴비 이기에 일단 무작정 튜토리얼부터 따라해봤습니다.
![03](/assets/images/Unity/01/03.png)

제 유니티 버전은 2019.3.7f1 버전입니다. URP를 사용할 것이므로 Universal Project Template 으로 만듭니다. (URP 버전은 7.1.8입니다)

![04](/assets/images/Unity/01/04.png)
Project Settings에 보면 UniversalRP-HighQuality 라는 이름의 Pipeline Asset이 설정된 것이 보입니다.

![05](/assets/images/Unity/01/05.png)
Test Scene 하나를 만들고 Unlit Shader를 하나 만들어줍니다(사진에서 URP_Unlit…) 왼쪽에 보이는 머티리얼은 이 Shader를 적용한 머티리얼입니다.  

<pre><code>
Shader "Unlit/URP_Unlit_SoftShadow"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
    }
    SubShader
    {
        Tags { 
            "RenderPipeline" = "UniversalPipeline"
            "RenderType"="Opaque" 
            "Queue"="Geometry+0"
        }
        LOD 100

        Pass
        {
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            // GPU Instancing
            #pragma multi_compile_instancing
            // make fog work
            #pragma multi_compile_fog

            // Receive Shadow
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS_CASCADE
            #pragma multi_compile _ _ADDITIONAL_LIGHTS
            #pragma multi_compile _ _ADDITIONAL_LIGHT_SHADOWS
            #pragma multi_compile _ _SHADOWS_SOFT

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                float3 normal : NORMAL;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float2 uv : TEXCOORD0;
                float fogCoord : TEXCOORD1;
                float3 normal : NORMAL;
                float4 shadowCoord : TEXCOORD2;
                UNITY_VERTEX_INPUT_INSTANCE_ID
                UNITY_VERTEX_OUTPUT_STEREO
            };

            CBUFFER_START(UnityPerMaterial)

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);
            half4 _MainTex_ST;

            CBUFFER_END

            v2f vert (appdata v)
            {
                v2f o;
                UNITY_SETUP_INSTANCE_ID(v);
                UNITY_TRANSFER_INSTANCE_ID(v, o); 
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(o); //VR 설정

                o.vertex = TransformObjectToHClip(v.vertex.xyz); //MVP랑 같음 이름만 달라짐.
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                o.normal = TransformObjectToWorldNormal(v.normal); // Normal Transform은 따로 행렬이 필요.
                o.fogCoord = ComputeFogFactor(o.vertex.z);

                VertexPositionInputs vertexInput = GetVertexPositionInputs(v.vertex.xyz);
                o.shadowCoord = GetShadowCoord(vertexInput);
                return o;
            }

            half4 frag (v2f i) : SV_Target
            {
                UNITY_SETUP_INSTANCE_ID(i);
                UNITY_SETUP_STEREO_EYE_INDEX_POST_VERTEX(i);

                Light mainLight = GetMainLight(i.shadowCoord);

                float4 col = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv);

                float NdotL = saturate(dot(_MainLightPosition.xyz, i.normal)); // NdotL로 간단히 라이팅한다.
                half3 ambient = SampleSH(i.normal);

                col.rgb *= NdotL * _MainLightColor.rgb * mainLight.shadowAttenuation * mainLight.distanceAttenuation + ambient;
                col.rgb = MixFog(col.rgb, i.fogCoord);
                
                return col;
            }
            ENDHLSL
        }
    }
}
</code></pre>

SHADER GRAPH CUSTOM NODE 부분 이전까지 완료한 결과튜토리얼에서 Shader Graph Custom Node 이전까지 완성한 결과입니다.  

## 2. 문제 확인 하기

![06](/assets/images/Unity/01/06.png)
<center>(N Dot L 라이팅은 잘 먹지만 Shadow는 보이지 않는다.)</center> <br>

![07](/assets/images/Unity/01/07.png)
<center>(기대한 결과 (정답))</center> <br>

사진에서도 보실 수 있듯 Sphere의 그림자가 Plane에 렌더되지 않고 있습니다. 작성한 코드 부분에서 문제가 있는 것 같습니다.
여기까지 문제 확인을 마치고 다음 문제 원인을 찾는 편으로 돌아오겠습니다