#define NUM_FORCES 30
uniform bool MOD_smooth;

uniform mat4 MOD_modelMatrix;


struct force
{
    vec3 pos;
    float attraction;
    float angle;
    float range;
    float time;
};


uniform force forces[NUM_FORCES];

float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
