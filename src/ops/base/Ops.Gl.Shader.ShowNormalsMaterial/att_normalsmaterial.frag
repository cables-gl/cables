IN vec3 normal;
IN vec3 outTangent;
IN vec3 outBiTangent;
IN mat4 mMatrix;

void main()
{

    #ifdef MULMODEL
        vec4 attr;
    #endif
    #ifndef MULMODEL
        vec3 attr;
    #endif


    #ifdef SHOW_NORMALS
        attr.xyz=normal;
    #endif
    #ifdef SHOW_BITANGENTS
        attr.xyz=outBiTangent;
    #endif
    #ifdef SHOW_TANGENTS
        attr.xyz=outTangent;
    #endif


    #ifdef MULMODEL
        attr*=mMatrix;
    #endif

    outColor=vec4(attr.x,attr.y,attr.z,1.0);

    #ifdef ABS
        outColor=abs(outColor);
    #endif
}