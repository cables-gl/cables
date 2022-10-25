void setPosition(vec4 pos)
{
    // vec3 tangent=attrTangent;
    pos.w=1.0;
    // vec3 bitangent=attrBiTangent;
    mat4 mMatrix=modelMatrix;

    {{MODULE_VERTEX_POSITION}}

    texCoord=attrTexCoord;

    gl_Position = projMatrix * (viewMatrix*mMatrix) * pos;
}