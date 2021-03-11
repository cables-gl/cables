
#ifdef MULTI_COLORTARGETS
    outColor=vec4(1.0,0.0,0.0,1.0);
#endif
#ifdef MULTI_COLORTARGETS
    outColor0=vec4(MOD_pos.xyz,1.0);
    outColor1=vec4(viewSpaceNormal.x,viewSpaceNormal.y,viewSpaceNormal.z,1.0);
#endif