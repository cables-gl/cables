
vec4 MOD_p=pos;

#ifdef POS_ATTR
    MOD_p=vec4(vPosition,1.0);
#endif

#ifdef POS_MMATRIX
    MOD_p=vec4(mMatrix[3][0],mMatrix[3][1],mMatrix[3][2],1.0);
#endif

#ifndef MOD_WORLDSPACE
    pos.xyz=MOD_deform(MOD_p.xyz,norm.xyz);

    #ifdef MOD_CALC_NORMALS
        norm=MOD_calcNormal(MOD_p.xyz,norm.xyz,tangent,bitangent);
    #endif
#endif

#ifdef MOD_WORLDSPACE
    pos.xyz=MOD_deform( (mMatrix*MOD_p).xyz ,norm.xyz);

    #ifdef MOD_CALC_NORMALS
        norm=MOD_calcNormal( (mMatrix*MOD_p).xyz,norm.xyz,tangent,bitangent);
    #endif
#endif

#ifdef MOD_CALC_NORMALS
    tangent=MOD_newTangent;
    bitangent=MOD_newBiTangent;
#endif



#ifdef MOD_FLIP_NORMALS
    norm*=-1.0;
#endif
