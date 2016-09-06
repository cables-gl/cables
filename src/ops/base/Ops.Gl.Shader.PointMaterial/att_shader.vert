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

void main()
{
    float psMul=sqrt(canvasWidth*canvasHeight)*0.01;

    #ifndef SCALE_BY_DISTANCE
        gl_PointSize = pointSize * psMul;
    #endif
    #ifdef SCALE_BY_DISTANCE
        float cameraDist = distance(vPosition, camPos);
        gl_PointSize = pointSize / cameraDist * psMul;
    #endif


    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * viewMatrix * modelMatrix * pos;

}
