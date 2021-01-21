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

//위에 이거 링크 대로하면 개망함, 'model의 transpose'가 아니라 model * view의 transpose 써야함.
//근데 왜지? 이거 정리해봐야할 듯
//참고 : https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html 
//와 그래도 normal이 문제라는걸 생각해 내내 ㅋㅌㅋ