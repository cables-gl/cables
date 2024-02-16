
{{MODULES_HEAD}}

OUT vec2 texCoord;
OUT vec2 texCoordOrig;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

#ifdef HAS_TEXTURES
    UNI float diffuseRepeatX;
    UNI float diffuseRepeatY;
    UNI float texOffsetX;
    UNI float texOffsetY;
#endif

#ifdef VERTEX_COLORS
    in vec4 attrVertColor;
    out vec4 vertCol;

#endif


void main()
{
    mat4 mMatrix=modelMatrix;
    mat4 modelViewMatrix;

    norm=attrVertNormal;
    texCoordOrig=attrTexCoord;
    texCoord=attrTexCoord;
    #ifdef HAS_TEXTURES
        texCoord.x=texCoord.x*diffuseRepeatX+texOffsetX;
        texCoord.y=(1.0-texCoord.y)*diffuseRepeatY+texOffsetY;
    #endif

    #ifdef VERTEX_COLORS
        vertCol=attrVertColor;
    #endif

    vec4 pos = vec4(vPosition, 1.0);

    #ifdef BILLBOARD
       vec3 position=vPosition;
       modelViewMatrix=viewMatrix*modelMatrix;

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
        modelViewMatrix=viewMatrix * mMatrix;

        {{MODULE_VERTEX_MOVELVIEW}}

    #endif

    // mat4 modelViewMatrix=viewMatrix*mMatrix;

    #ifndef BILLBOARD
        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;
        gl_Position = projMatrix * modelViewMatrix * pos;
    #endif
}
