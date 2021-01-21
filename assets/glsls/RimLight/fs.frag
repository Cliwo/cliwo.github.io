//https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.fs

#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif

// uniform float fresnel;

varying vec3 WorldPos;
varying vec3 ViewPos;
varying vec3 NormalInView;
varying vec3 NormalInWorld;

uniform float frenel_smooth_step;

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
        diffuse += directionalLights[i].color * nDotL;
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
    vec3 rim = vec3(smoothstep(frenel_smooth_step, 1.0, vDn));

    gl_FragColor = vec4(diffuse + specular + rim, 1.0);
} 
