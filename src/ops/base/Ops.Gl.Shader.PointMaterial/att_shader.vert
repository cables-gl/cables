{{MODULES_HEAD}}
attribute vec3 vPosition;
attribute vec2 attrTexCoord;

varying vec3 norm;
#ifdef HAS_TEXTURES
    varying vec2 texCoord;
#endif

uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

uniform float pointSize;
uniform vec3 camPos;

uniform float canvasWidth;
uniform float canvasHeight;
uniform float camDistMul;

uniform float randomSize;

attribute float attrVertIndex;

float rand(float n){return fract(sin(n) * 43758.5453123);}

#define POINTMATERIAL

void main()
{
    float psMul=sqrt(canvasWidth*canvasHeight)*0.001+0.00000000001;
    float sizeMultiply=1.0;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    vec4 model=modelMatrix * pos;

    if(randomSize>0.0) psMul+=rand(attrVertIndex)*randomSize;

    psMul*=sizeMultiply;

    #ifndef SCALE_BY_DISTANCE
        gl_PointSize = pointSize * psMul;
    #endif
    #ifdef SCALE_BY_DISTANCE
        float cameraDist = distance(model.xyz, camPos);
        gl_PointSize = (pointSize / cameraDist) * psMul;
    #endif




    gl_Position = projMatrix * viewMatrix * model;


}
