precision mediump float;
{{MODULES_HEAD}}

attribute vec3 vPosition;
uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
attribute vec3 attrVertNormal;
attribute vec2 attrTexCoord;

attribute vec3 attrTangent;
attribute vec3 attrBiTangent;
varying vec3 vTangent;
varying vec3 vBiTangent;


varying mediump vec3 norm;
varying mediump vec3 vert;
varying mat4 mvMatrix;
uniform mat4 normalMatrix;

#ifdef HAS_TEXTURES
    varying mediump vec2 texCoord;
#endif

void main()
{
    norm=attrVertNormal;
    vert=vPosition;

    vTangent=attrTangent;
    vBiTangent=attrBiTangent;

    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
    #endif

    vec4 pos = vec4( vPosition, 1. );
    mvMatrix=viewMatrix * modelMatrix;
    {{MODULE_VERTEX_POSITION}}

    gl_Position = projMatrix * mvMatrix * pos;
}
