//https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.fs

// struct Material {
//     vec3 ambient;
//     vec3 diffuse;
//     vec3 specular;    
//     float shininess;
// }; 
// struct Light {
//     vec3 position;

//     vec3 ambient;
//     vec3 diffuse;
//     vec3 specular;
// };

#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
     };
     uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif

varying vec3 FragPos;
varying vec3 Normal; 
  
//Camera, Material, Light 설정이 필요하다.
// uniform vec3 viewPos;
// uniform Material material;
// uniform Light light;

void main()
{
    // ambient
    // vec3 ambient = light.ambient * material.ambient;
  	 
    vec3 diffuse = vec3(0.0, 0.0, 0.0);
    for(int i = 0; i < NUM_DIR_LIGHTS; i++)
    {
        vec3 norm = normalize(Normal);
        vec3 lightDir = directionalLights[i].direction;
        float nDotL = max(dot(norm, lightDir), 0.0);
        diffuse += directionalLights[i].color * (nDotL);
    }
    
    // // specular
    // vec3 viewDir = normalize(viewPos - FragPos);
    // vec3 reflectDir = reflect(-lightDir, norm);  
    // float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    // vec3 specular = light.specular * (spec * material.specular);  
        
    // vec3 result = ambient + diffuse + specular;
    // gl_FragColor = vec4(result, 1.0);
    gl_FragColor = vec4(diffuse, 1.0);
} 