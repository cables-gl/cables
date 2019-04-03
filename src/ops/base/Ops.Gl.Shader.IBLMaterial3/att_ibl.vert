{{MODULES_HEAD}}

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 viewDirection;

IN vec3 vPosition;
IN vec3 attrVertNormal;
UNI vec3 camPos;

OUT vec2 texCoord;
IN vec2 attrTexCoord;
OUT mat3 newNormalMatrix;
OUT vec3 vertPos;

IN vec3 attrTangent,attrBiTangent;
UNI float repeatX,repeatY;
UNI float offsetX,offsetY;

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    OUT vec3 eye_relative_pos;
    OUT vec3 mPos;
#endif



void main()
{
    mat4 mMatrix=modelMatrix;
    vec4 pos = vec4( vPosition, 1. );
    vec3 norm=attrVertNormal;

    vertPos=vPosition;

    texCoord=vec2(
        (attrTexCoord.x+offsetX)*repeatX,
        (attrTexCoord.y+offsetY)*repeatY);

    mat3 wmMatrix=mat3(modelMatrix);

    newNormalMatrix=mat3(
        normalize( wmMatrix*attrTangent ),
        normalize( wmMatrix*attrBiTangent ),
        normalize( wmMatrix*attrVertNormal )
    );

    {{MODULE_VERTEX_POSITION}}

    mat4 modelview=viewMatrix * mMatrix;

    vec4 modelPos=modelview * pos;

    #ifdef CALC_SSNORMALS
        // eye_relative_pos=(modelMatrix * pos).xyz-camPos;
        eye_relative_pos=(modelPos).xyz-camPos;

        // mPos=(modelview*vec4(0.0,1.0,0.0,1.0)).xyz;
        mPos=(modelPos).xyz;
    #endif

    viewDirection = normalize((mMatrix * pos).xyz - camPos);

    gl_Position = projMatrix * modelPos;
}
