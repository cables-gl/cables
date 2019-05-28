
#ifndef MOD_WORLDSPACE
    pos.xyz=MOD_deform(pos.xyz,norm.xyz);

    #ifdef MOD_CALC_NORMALS
        norm=MOD_calcNormal(pos.xyz,norm.xyz,tangent,bitangent);
    #endif
#endif

#ifdef MOD_WORLDSPACE
    pos.xyz=MOD_deform( (mMatrix*pos).xyz ,norm.xyz);

    #ifdef MOD_CALC_NORMALS
        norm=MOD_calcNormal( (mMatrix*pos).xyz,norm.xyz,tangent,bitangent);
    #endif
#endif

#ifdef MOD_CALC_NORMALS
    tangent=MOD_newTangent;
    bitangent=MOD_newBiTangent;
#endif