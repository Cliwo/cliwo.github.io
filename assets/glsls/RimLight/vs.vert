//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
//https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.vs

varying vec3 FragPos;
varying vec3 Normal;

void main()
{
    FragPos = vec3(modelMatrix * vec4(position, 1.0));
    Normal = mat3(transpose(inverse(modelMatrix))) * normal;  
    
    gl_Position = projectionMatrix * viewMatrix * vec4(FragPos, 1.0);
}