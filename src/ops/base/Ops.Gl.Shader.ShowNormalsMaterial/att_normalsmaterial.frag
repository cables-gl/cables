IN vec3 normal;
IN vec3 outTangent;
IN vec3 outBiTangent;

void main()
{
    #ifdef SHOW_NORMALS
        outColor=vec4(normal.x,normal.y,normal.z,1.0);
    #endif
    #ifdef SHOW_BITANGENTS
        outColor=vec4(outBiTangent.x,outBiTangent.y,outBiTangent.z,1.0);
    #endif
    #ifdef SHOW_TANGENTS
        outColor=vec4(outTangent.x,outTangent.y,outTangent.z,1.0);
    #endif
}