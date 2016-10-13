{{MODULES_HEAD}}
attribute vec3 vPosition;
attribute vec2 attrTexCoord;

varying vec3 norm;
#ifdef HAS_TEXTURES
    varying vec2 texCoord;
    #ifdef TEXTURE_REPEAT
        uniform float diffuseRepeatX;
        uniform float diffuseRepeatY;
        uniform float texOffsetX;
        uniform float texOffsetY;

    #endif
#endif

uniform mat4 projMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

void main()
{
    #ifdef HAS_TEXTURES
        texCoord=attrTexCoord;
        #ifdef TEXTURE_REPEAT
            texCoord.s=texCoord.s*diffuseRepeatX+texOffsetX;
            texCoord.t=texCoord.t*diffuseRepeatY+texOffsetY;
        #endif
   #endif

   vec4 pos = vec4( vPosition, 1. );


    #ifdef BILLBOARD
       vec3 position=vPosition;
       mat4 mvMatrix=viewMatrix*modelMatrix;

       gl_Position = projMatrix * mvMatrix * vec4((
           position.x * vec3(
               mvMatrix[0][0],
               mvMatrix[1][0],
               mvMatrix[2][0] ) +
           position.y * vec3(
               mvMatrix[0][1],
               mvMatrix[1][1],
               mvMatrix[2][1]) ), 1.0);
    #endif
    #ifndef BILLBOARD
        mvMatrix=viewMatrix * modelMatrix;
    #endif

    {{MODULE_VERTEX_POSITION}}

    #ifndef BILLBOARD
        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;
        gl_Position = projMatrix * mvMatrix * pos;
    #endif
}
