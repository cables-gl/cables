
vec3 MOD_size=vec3(MOD_inSizeAmountFalloffSizeX.x);
#ifdef MOD_DOSCALE
    MOD_size*=MOD_scale.xyz;
#endif

vec3 MOD_col=MOD_color;

#ifdef MOD_USE_TEX
    MOD_col=texture(MOD_tex,gl_FragCoord.xy/float(textureSize(MOD_tex,0).xy)).rgb;
#endif

vec4 MOD_vp=MOD_vertPos;

#ifdef MOD_SPACE_SCREEN
   MOD_vp=vec4(gl_FragCoord.x,gl_FragCoord.y,0.0,1.0);
#endif



#ifdef MOD_AREA_SPHERE
    float MOD_de=MOD_sdSphere(MOD_pos.xyz-MOD_vp.xyz,MOD_size.x);
#endif

#ifdef MOD_AREA_BOX
    float MOD_r=MOD_scale.w;
    MOD_r*=MOD_inSizeAmountFalloffSizeX.x;
    float MOD_de=MOD_sdRoundBox(MOD_pos.xyz-MOD_vp.xyz,MOD_size-MOD_r,MOD_r);
#endif

#ifdef MOD_AREA_TRIPRISM
    float MOD_de=MOD_sdTriPrism(MOD_pos.xyz-MOD_vp.xyz,vec2(MOD_size.x,MOD_size.z));
#endif

#ifdef MOD_AREA_HEXPRISM
    float MOD_de=MOD_sdHexPrism(MOD_pos.xyz-MOD_vp.xyz,vec2(MOD_size.x,MOD_size.z));
#endif



// #ifndef MOD_AREA_SPHERE
// #ifndef MOD_AREA_BOX
//     float MOD_de=1.0-smoothstep(MOD_inSizeAmountFalloffSizeX.z*MOD_inSizeAmountFalloffSizeX.x,MOD_inSizeAmountFalloffSizeX.x,MOD_de);
// #endif
// #endif

#ifdef MOD_AREA_AXIS_X
    float MOD_de=abs(MOD_pos.x-MOD_vp.x);
#endif
#ifdef MOD_AREA_AXIS_Y
    float MOD_de=abs(MOD_pos.y-MOD_vp.y);
#endif
#ifdef MOD_AREA_AXIS_Z
    float MOD_de=abs(MOD_pos.z-MOD_vp.z);
#endif

#ifdef MOD_AREA_AXIS_X_INFINITE
    float MOD_de=MOD_pos.x-MOD_vp.x;
#endif
#ifdef MOD_AREA_AXIS_Y_INFINITE
    float MOD_de=MOD_pos.y-MOD_vp.y;
#endif
#ifdef MOD_AREA_AXIS_Z_INFINITE
    float MOD_de=MOD_pos.z-MOD_vp.z;
#endif


MOD_de=1.0-MOD_map(
    MOD_de,
    0.0, MOD_inSizeAmountFalloffSizeX.z,
    0.0,1.0
    );

#ifdef MOD_FALLOFF_SMOOTH
    MOD_de=smoothstep(0.0,1.0,MOD_de);
#endif
#ifdef MOD_FALLOFF_POW2
    MOD_de=pow(MOD_de,2.0);
    // MOD_de=smoothstep(0.0,1.0,MOD_de);
#endif
#ifdef MOD_FALLOFF_POW3
    MOD_de=pow(MOD_de,3.0);
    // MOD_de=smoothstep(0.0,1.0,MOD_de);
#endif


#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif

#ifdef MOD_BLEND_NORMAL
    col.rgb=mix(col.rgb,MOD_col, MOD_de*MOD_inSizeAmountFalloffSizeX.y);
#endif


#ifdef MOD_BLEND_MULTIPLY
    col.rgb=mix(col.rgb,col.rgb*MOD_col,MOD_de*MOD_inSizeAmountFalloffSizeX.y);
#endif

#ifdef MOD_BLEND_ADD
    col.rgb+=MOD_de*MOD_inSizeAmountFalloffSizeX.y*MOD_col;
#endif


#ifdef MOD_BLEND_OPACITY
    col.a*=(1.0-MOD_de*MOD_inSizeAmountFalloffSizeX.y);

    if(col.a==0.0)discard;
#endif

#ifdef MOD_BLEND_DISCARD
    if(MOD_de*MOD_inSizeAmountFalloffSizeX.y>=0.999)discard;
#endif


// col.rgb=vec3(distance(MOD_vp.xyz,MOD_pos.xyz))*0.1
// col.rgb=MOD_pos.xyz;

//