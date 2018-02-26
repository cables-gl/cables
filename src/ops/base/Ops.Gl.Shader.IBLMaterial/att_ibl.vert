{{MODULES_HEAD}}

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec3 v_eyeCoords;
OUT vec3 v_normal;
OUT vec3 v_pos;

IN vec3 vPosition;
IN vec3 attrVertNormal;

OUT vec2 texCoord;
IN vec2 attrTexCoord;


void main()
{
    mat4 modelview= viewMatrix * modelMatrix;
    texCoord=attrTexCoord;

    v_pos= vPosition;
    vec4 pos = vec4( vPosition, 1. );

    {{MODULE_VERTEX_POSITION}}

   vec4 eyeCoords = modelview * pos;


   gl_Position = projMatrix * eyeCoords;
   v_eyeCoords = eyeCoords.xyz;
   v_normal = normalize(attrVertNormal);
}
