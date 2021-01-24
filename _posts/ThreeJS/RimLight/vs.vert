//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
//https://github.com/JoeyDeVries/LearnOpenGL/blob/master/src/2.lighting/3.2.materials_exercise1/3.2.materials.vs

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