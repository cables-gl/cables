
// default

#ifdef SLOT_TEX_0_COLOR
    outColor0=col;
#endif
#ifdef SLOT_TEX_1_COLOR
    outColor1=col;
#endif
#ifdef SLOT_TEX_2_COLOR
    outColor2=col;
#endif
#ifdef SLOT_TEX_3_COLOR
    outColor3=col;
#endif

// normals

#ifdef SLOT_TEX_0_NORMAL
    outColor0=vec4(norm,1.);
#endif
#ifdef SLOT_TEX_1_NORMAL
    outColor1=vec4(norm,1.);
#endif
#ifdef SLOT_TEX_2_NORMAL
    outColor2=vec4(norm,1.);
#endif
#ifdef SLOT_TEX_3_NORMAL
    outColor3=vec4(norm,1.);
#endif

// texcoord

#ifdef SLOT_TEX_0_TEXCOORD
    outColor0=vec4(texCoord, 0., 1.);
#endif
#ifdef SLOT_TEX_1_TEXCOORD
    outColor1=vec4(texCoord, 0., 1.);
#endif
#ifdef SLOT_TEX_2_TEXCOORD
    outColor2=vec4(texCoord, 0., 1.);
#endif
#ifdef SLOT_TEX_3_TEXCOORD
    outColor3=vec4(texCoord, 0., 1.);
#endif

// black

#ifdef SLOT_TEX_0_BLACK
    outColor0=vec4(0.,0.,0.,1.);
#endif
#ifdef SLOT_TEX_1_BLACK
    outColor1=vec4(0.,0.,0.,1.);
#endif
#ifdef SLOT_TEX_2_BLACK
    outColor2=vec4(0.,0.,0.,1.);
#endif
#ifdef SLOT_TEX_3_BLACK
    outColor3=vec4(0.,0.,0.,1.);
#endif

// 1

#ifdef SLOT_TEX_0_1
    outColor0=vec4(1.);
#endif
#ifdef SLOT_TEX_1_1
    outColor1=vec4(1.);
#endif
#ifdef SLOT_TEX_2_1
    outColor2=vec4(1.);
#endif
#ifdef SLOT_TEX_3_1
    outColor3=vec4(1.);
#endif

// 0

#ifdef SLOT_TEX_0_0
    outColor0=vec4(0.);
#endif
#ifdef SLOT_TEX_1_0
    outColor1=vec4(0.);
#endif
#ifdef SLOT_TEX_2_0
    outColor2=vec4(0.);
#endif
#ifdef SLOT_TEX_3_0
    outColor3=vec4(0.);
#endif



#ifdef SLOT_TEX_0_POS_LOCAL
    outColor0=vec4(MOD_pos_local,1.);
#endif
#ifdef SLOT_TEX_1_POS_LOCAL
    outColor1=vec4(MOD_pos_local,1.);
#endif
#ifdef SLOT_TEX_2_POS_LOCAL
    outColor2=vec4(MOD_pos_local,1.);
#endif
#ifdef SLOT_TEX_3_POS_LOCAL
    outColor3=vec4(MOD_pos_local,1.);
#endif



#ifdef SLOT_TEX_0_POS_OBJECT
    outColor0=vec4(MOD_pos_object, 1.);
#endif
#ifdef SLOT_TEX_1_POS_OBJECT
    outColor1=vec4(MOD_pos_object, 1.);
#endif
#ifdef SLOT_TEX_2_POS_OBJECT
    outColor2=vec4(MOD_pos_object, 1.);
#endif
#ifdef SLOT_TEX_3_POS_OBJECT
    outColor3=vec4(MOD_pos_object, 1.);
#endif




#ifdef SLOT_TEX_0_POS_WORLD
    outColor0=vec4(MOD_pos_world,1.);
#endif
#ifdef SLOT_TEX_1_POS_WORLD
    outColor1=vec4(MOD_pos_world,1.);
#endif
#ifdef SLOT_TEX_2_POS_WORLD
    outColor2=vec4(MOD_pos_world,1.);
#endif
#ifdef SLOT_TEX_3_POS_WORLD
    outColor3=vec4(MOD_pos_world,1.);
#endif



#ifdef SLOT_TEX_0_NORMAL_MV
    outColor0=vec4(MOD_normal_mv,1.);
#endif
#ifdef SLOT_TEX_1_NORMAL_MV
    outColor1=vec4(MOD_normal_mv,1.);
#endif
#ifdef SLOT_TEX_2_NORMAL_MV
    outColor2=vec4(MOD_normal_mv,1.);
#endif
#ifdef SLOT_TEX_3_NORMAL_MV
    outColor3=vec4(MOD_normal_mv,1.);
#endif



#ifdef INSTANCING
    float instIdx=frag_instIndex;
#endif
#ifndef INSTANCING
    float instIdx=0.0;
#endif

#ifdef SLOT_TEX_0_MATERIALID
    outColor0=vec4(materialId,instIdx,0.0,1.);
#endif
#ifdef SLOT_TEX_1_MATERIALID
    outColor1=vec4(materialId,instIdx,0.0,1.);
#endif
#ifdef SLOT_TEX_2_MATERIALID
    outColor2=vec4(materialId,instIdx,0.0,1.);
#endif
#ifdef SLOT_TEX_3_MATERIALID
    outColor3=vec4(materialId,instIdx,0.0,1.);
#endif



#ifdef SLOT_TEX_0_FRAGZ
    outColor0=vec4(vec3(gl_FragCoord.z),1.);
#endif
#ifdef SLOT_TEX_1_FRAGZ
    outColor1=vec4(vec3(gl_FragCoord.z),1.);
#endif
#ifdef SLOT_TEX_2_FRAGZ
    outColor2=vec4(vec3(gl_FragCoord.z),1.);
#endif
#ifdef SLOT_TEX_3_FRAGZ
    outColor3=vec4(vec3(gl_FragCoord.z),1.);
#endif





