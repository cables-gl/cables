
{{MODULES_HEAD}}

OUT vec2 texCoord;
OUT vec2 texCoordOrig;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

#ifdef HAS_TEXTURES
UNI vec4 texTransform;
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
        texCoord.x=texCoord.x*texTransform.x+texTransform.z;
        texCoord.y=(1.0-texCoord.y)*texTransform.y+texTransform.w;
    #endif

    #ifdef VERTEX_COLORS
        vertCol=attrVertColor;
    #endif

    vec4 pos = vec4(vPosition, 1.0);


    {{MODULE_VERTEX_POSITION}}

        modelViewMatrix=viewMatrix * mMatrix;

        {{MODULE_VERTEX_MODELVIEW}}


        gl_Position = projMatrix * modelViewMatrix * pos;
}
