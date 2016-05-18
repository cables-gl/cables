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

void main()
{

    gl_PointSize = pointSize;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
   #endif

   vec4 pos = vec4( vPosition, 1. );

   {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * viewMatrix * modelMatrix * pos;

}
