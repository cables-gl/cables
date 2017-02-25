// in vec3 vPosition;
// in float attrVertIndex;
in vec3 rndpos;
out vec3 col;

uniform float {{mod}}time;
uniform float {{mod}}size;
uniform float {{mod}}timeDiff;
uniform vec3 {{mod}}emitterPos;

attribute float timeOffset;

struct force
    {
        vec3 pos;
        float attraction;
        float angle;
        float range;
        float time;
    };


#define NUM_FORCES 127
// force forces[NUM_FORCES];
uniform force forces[NUM_FORCES];


in vec3 inPos;
out vec3 outPos;

// uniform mat4 projMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;



float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
