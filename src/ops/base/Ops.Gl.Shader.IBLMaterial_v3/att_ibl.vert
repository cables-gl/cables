{{MODULES_HEAD}}

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 viewDirection;

IN vec3 vPosition;
IN vec3 attrVertNormal;
IN float attrVertIndex;
UNI vec3 camPos;

OUT vec2 texCoord;
IN vec2 attrTexCoord;
OUT mat3 newNormalMatrix;
OUT vec3 vertPos;

IN vec3 attrTangent,attrBiTangent;
UNI float repeatX,repeatY;
UNI float offsetX,offsetY;



#ifdef ORIG_TEXCOORD
    OUT vec2 texCoordOrig;
#endif

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    OUT vec3 eye_relative_pos;
    OUT vec3 mPos;
#endif

void main()
{
    mat4 mMatrix=modelMatrix;
    vec4 pos=vec4(vPosition,1.);
    vec3 norm=attrVertNormal;
    vec3 tangent=attrTangent;
    vec3 bitangent=attrBiTangent;

    vertPos=vPosition;

    #ifdef ORIG_TEXCOORD
        texCoordOrig=attrTexCoord;
    #endif

    texCoord=vec2(
        (attrTexCoord.x+offsetX)*repeatX,
        (attrTexCoord.y+offsetY)*repeatY);

    mat3 wmMatrix=mat3(modelMatrix);


    {{MODULE_VERTEX_POSITION}}

    mat4 modelview=viewMatrix * mMatrix;
    vec4 modelPos=modelview * pos;

    #ifdef CALC_SSNORMALS
        // eye_relative_pos=(modelMatrix * pos).xyz-camPos;
        eye_relative_pos=(mMatrix*pos).xyz-camPos;

        // mPos=(modelview*vec4(0.0,1.0,0.0,1.0)).xyz;
        mPos=(mMatrix*pos).xyz;
    #endif

    newNormalMatrix=mat3(
        normalize( wmMatrix*tangent ),
        normalize( wmMatrix*bitangent ),
        normalize( wmMatrix*norm )
    );


    viewDirection = normalize((mMatrix * pos).xyz - camPos);

    gl_Position = projMatrix * modelPos;
}
