{{MODULES_HEAD}}

IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

OUT vec3 norm;
OUT vec2 texCoord;
OUT vec2 texCoordOrig;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

#ifdef HAS_TEXTURES
    #ifdef TEXTURE_REPEAT
        UNI float diffuseRepeatX;
        UNI float diffuseRepeatY;
        UNI float texOffsetX;
        UNI float texOffsetY;
    #endif
#endif


void main()
{
    mat4 mMatrix=modelMatrix;
    mat4 mvMatrix;

    texCoordOrig=attrTexCoord;
    texCoord=attrTexCoord;
    #ifdef HAS_TEXTURES
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
