uniform float time;
void main() {
    gl_FragColor = vec4(0.5 * (sin(time) * 0.5 + 1.0), 0.0, 0.0, 1.0); // R, G, B, A
}