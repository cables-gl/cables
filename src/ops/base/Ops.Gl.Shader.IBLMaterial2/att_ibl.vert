{{MODULES_HEAD}}

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 v_eyeCoords;
OUT vec3 v_pos;

IN vec3 vPosition;
IN vec3 attrVertNormal;
UNI vec3 camPos;

OUT vec2 texCoord;
IN vec2 attrTexCoord;
OUT mat3 newNormalMatrix;

IN vec3 attrTangent,attrBiTangent;
UNI float repeatX,repeatY;

void main()
{
    mat4 mMatrix=modelMatrix;
    v_pos= vPosition;
    vec4 pos = vec4( vPosition, 1. );
    vec3 norm=attrVertNormal;

    {{MODULE_VERTEX_POSITION}}

    mat4 modelview= viewMatrix * mMatrix;
    texCoord=vec2(attrTexCoord.x*repeatX,attrTexCoord.y*repeatY);
    
    mat3 wmMatrix=mat3(modelMatrix);

    newNormalMatrix=mat3(
        normalize( wmMatrix*attrTangent ),
        normalize( wmMatrix*attrBiTangent ),
        normalize( wmMatrix*attrVertNormal )
    );

    vec4 modelPos=modelview * pos;

    v_eyeCoords = (mMatrix*pos).xyz - camPos;
    // v_eyeCoords = (mMatrix * pos).xyz - camPos;
    

    gl_Position = projMatrix * modelPos;
}
