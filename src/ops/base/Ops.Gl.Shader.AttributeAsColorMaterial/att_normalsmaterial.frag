IN vec3 outNormal;
IN vec3 outTangent;
IN vec3 outBiTangent;
IN vec4 outPosition;
IN mat4 mMatrix;
IN vec2 texCoord;
IN vec2 texCoord1;
IN vec3 vert;
IN mat4 mvMatrix;


{{MODULES_HEAD}}

void main()
{
    #ifdef MULMODEL
        vec4 attr;
        attr.w=1.0;
    #endif
    #ifndef MULMODEL
        vec3 attr;
    #endif

    vec3 normal=outNormal;
    {{MODULE_NORMAL}}

    #ifdef SHOW_NORMALS
        attr.xyz=normal;
    #endif
    #ifdef SHOW_NORMAL_MAT
        attr.xyz=normal;
    #endif
    #ifdef SHOW_BITANGENTS
        attr.xyz=outBiTangent;
    #endif
    #ifdef SHOW_TANGENTS
        attr.xyz=outTangent;
    #endif
    #ifdef SHOW_TEXCOORDS
        attr.xy=texCoord;
    #endif
    #ifdef SHOW_TEXCOORDS1
        attr.xy=texCoord1;
    #endif
    #ifdef SHOW_POS
        attr.xyz=outPosition.xyz;
    #endif

    #ifdef MULMODEL
        attr*=mMatrix;
        attr.xyz=normalize(vec3(attr.x,attr.y,attr.z));
    #endif

    vec4 col=vec4(attr.x,attr.y,attr.z,1.0);

    #ifdef ABS
        col=abs(col);
    #endif

    {{MODULE_COLOR}}

    outColor=col;
}