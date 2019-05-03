
{{MODULES_HEAD}}

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 v_eyeCoords;
OUT vec3 v_normal;
OUT vec3 v_pos;

IN vec3 vPosition;
IN vec3 attrVertNormal;

void main()
{
    mat4 mMatrix=modelMatrix;

    v_pos= vPosition;
    vec4 pos = vec4( vPosition, 1. );
    v_normal = normalize(attrVertNormal);

    {{MODULE_VERTEX_POSITION}}

    mat4 modelview= viewMatrix * mMatrix;
    vec4 eyeCoords = modelview * pos;

    // mat3 normalMatrix = transpose(inverse(mat3(mMatrix)));
    // v_normal = normalize(normalMatrix * v_normal);

    gl_Position = projMatrix * eyeCoords;
    v_eyeCoords = eyeCoords.xyz;
    v_normal = normalize(attrVertNormal);

}