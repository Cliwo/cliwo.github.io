//https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.fs

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

    gl_FragColor = vec4(diffuse + specular, 1.0);
    // gl_FragColor = vec4(diffuse + specular + rim, 1.0);
    
} 

        //처음에 -안했다가 이상한 곳에 생겼음
        //지금도 이상함. 나중에 고치기
        // vec3 reflectDir = reflect(-directionalLights[i].direction, normalize(NormalInWorld)); 
        // float spec = pow(max(dot(viewDirInWorldSpace, reflectDir), 0.0), 50.0);

        //됬다 ㅠㅠ 성공. viewDir이 viewSpace에 있는걸 써야하는데 worldSpace 거를 게속 써서 문제였음
        //ㅈ같은게 여기서 directionalLight의 direction은 viewSpace상의 dir인 것 같음. 아무 설명없이 ㅅ1발

         // gl_FragColor = vec4(diffuse, 1.0);
    // gl_FragColor = vec4(specular, 1.0);
    // gl_FragColor = vec4(rim, 1.0);