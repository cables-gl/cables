{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertNormal;
OUT vec3 norm;
OUT vec2 texCoord;
OUT vec2 texCoordOrig;

#ifdef HAS_TEXTURES
    IN vec2 attrTexCoord;
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
    mat4 mMatrix=modelMatrix;
    mat4 mvMatrix;
    
    #ifdef HAS_TEXTURES
        texCoordOrig=attrTexCoord;
        texCoord=attrTexCoord;
        #ifdef TEXTURE_REPEAT
            texCoord.x=texCoord.x*diffuseRepeatX+texOffsetX;
            texCoord.y=texCoord.y*diffuseRepeatY+texOffsetY;
        #endif
   #endif

   vec4 pos = vec4( vPosition, 1. );


    #ifdef BILLBOARD
       vec3 position=vPosition;
       mvMatrix=viewMatrix*modelMatrix;

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

    {{MODULE_VERTEX_POSITION}}

    #ifndef BILLBOARD
        mvMatrix=viewMatrix * mMatrix;
    #endif


    #ifndef BILLBOARD
        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;
        gl_Position = projMatrix * mvMatrix * pos;
    #endif
}
