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


#ifdef TEX_NORMAL

    IN vec3 attrTangent;
    IN vec3 attrBiTangent;
    UNI mat4 normalMatrix;
    OUT vec3 N;
    OUT vec3 V;
    OUT vec3 E;
    OUT vec3 T;
    OUT vec3 B;
    
    void normalMap(mat4 modelview)
    {
        N = normalize(  (normalMatrix*vec4(v_normal,1.0)).xyz );
        V = vec3( (modelview*vec4(vPosition,1.0)) );
        E = normalize(-V);
    
        T = normalize( (normalMatrix*vec4(attrTangent,1.0)).xyz);
        B = normalize( (normalMatrix*vec4(attrBiTangent,1.0)).xyz);
    }

#endif


void main()
{
    mat4 mMatrix=modelMatrix;
    v_pos= vPosition;
    vec4 pos = vec4( vPosition, 1. );
    vec3 norm=v_normal;

    {{MODULE_VERTEX_POSITION}}
    
    
    
    mat4 modelview= viewMatrix * mMatrix;
    texCoord=attrTexCoord;
    
    #ifdef TEX_NORMAL
        normalMap(mMatrix);
    #endif
    
    

    vec4 eyeCoords = modelview * pos;

    gl_Position = projMatrix * eyeCoords;
    v_eyeCoords = eyeCoords.xyz;
    v_normal = normalize(attrVertNormal);
}
