
float noise(vec2 a)
{
    return fract(sin(dot(a, vec2(12.9898, 78.233))) * 43758.5453);
}