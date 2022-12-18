
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
