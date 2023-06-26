
vec2 MOD_tc=texCoord;

#ifdef MOD_COORD_MESHXY
    MOD_tc=pos.xy;
#endif
#ifdef MOD_COORD_MESHXZ
    MOD_tc=pos.xz;
#endif


#ifdef MOD_FLIP_Y
    MOD_tc.y=1.0-MOD_tc.y;
#endif
#ifdef MOD_FLIP_X
    MOD_tc.x=1.0-MOD_tc.x;
#endif
#ifdef MOD_FLIP_XY
    MOD_tc=1.0-MOD_tc;
#endif

MOD_tc*=MOD_scale;

vec4 MOD_sample=texture( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) );
vec3 MOD_disp;

#ifdef MOD_INPUT_R
    MOD_disp=vec3(MOD_sample.r);
#endif
#ifdef MOD_INPUT_G
    MOD_disp=vec3(MOD_sample.g);
#endif
#ifdef MOD_INPUT_B
    MOD_disp=vec3(MOD_sample.b);
#endif
#ifdef MOD_INPUT_A
    MOD_disp=vec3(MOD_sample.a);
#endif
#ifdef MOD_INPUT_RGB
    MOD_disp=MOD_sample.rgb;
#endif
#ifdef MOD_INPUT_LUMI
    MOD_disp=vec3(dot(vec3(0.2126,0.7152,0.0722), MOD_sample.rgb));
#endif



#ifdef MOD_HEIGHTMAP_INVERT
   MOD_disp=1.0-MOD_disp;
#endif
// #ifdef MOD_HEIGHTMAP_NORMALIZE
//   MOD_disp-=0.5;
//   MOD_disp*=2.0;
// #endif


#ifdef MOD_HEIGHTMAP_NORMALIZE
    MOD_disp=(MOD_disp-0.5)*2.0;
    // MOD_disp=(MOD_disp-0.5)*-1.0+0.5;
#endif


float MOD_zero=0.0;

#ifdef MOD_MODE_DIV
    MOD_zero=1.0;
#endif
#ifdef MOD_MODE_MUL
    MOD_zero=1.0;
#endif



vec3 MOD_mask=vec3(1.0);

#ifdef MOD_AXIS_X
    MOD_mask=vec3(1.,0.,0.);
    MOD_disp*=MOD_mask*MOD_extrude;
#endif
#ifdef MOD_AXIS_Y
    MOD_mask=vec3(0.,1.,0.);
    MOD_disp*=MOD_mask*MOD_extrude;
#endif
#ifdef MOD_AXIS_Z
    MOD_mask=vec3(0.,0.,1.);
    MOD_disp*=MOD_mask*MOD_extrude;
#endif
#ifdef MOD_AXIS_XY
    MOD_mask=vec3(1.,1.,0.);
    MOD_disp*=MOD_mask*MOD_extrude;
#endif
#ifdef MOD_AXIS_XYZ
    MOD_mask=vec3(1.,1.,1.);
    MOD_disp*=MOD_mask*MOD_extrude;
#endif


// MOD_disp=smoothstep(-1.,1.,MOD_disp*MOD_disp*MOD_disp);
// MOD_disp=MOD_disp*MOD_disp*MOD_disp;

// #ifdef MOD_FLIP_Y
//     MOD_mask.y=1.0-MOD_mask.y;
// #endif
// #ifdef MOD_FLIP_X
//     MOD_mask.x=1.0-MOD_mask.x;
// #endif
// #ifdef MOD_FLIP_XY
//     MOD_mask.xy=1.0-MOD_mask.xy;
// #endif



#ifdef MOD_MODE_DIV
    pos.xyz/=MOD_disp*MOD_mask;
#endif

#ifdef MOD_MODE_MUL
    pos.xyz*=MOD_disp*MOD_mask;
#endif

#ifdef MOD_MODE_ADD
    pos.xyz+=MOD_disp*MOD_mask;
#endif

#ifdef MOD_MODE_NORMAL

    vec3 MOD_t=norm;
    #ifdef MOD_SMOOTHSTEP
        MOD_t=smoothstep(-1.,1.,MOD_t);
    #endif

    pos.xyz+=MOD_t*MOD_disp*MOD_mask;

#endif

#ifdef MOD_MODE_TANGENT
    MOD_disp*=-1.0;

    vec3 MOD_t=attrTangent;
    #ifdef MOD_SMOOTHSTEP
        MOD_t=smoothstep(-1.,1.,MOD_t);
    #endif

    pos.xyz+=MOD_t*MOD_disp*MOD_mask;

#endif

#ifdef MOD_MODE_BITANGENT
    MOD_disp*=-1.0;
    vec3 MOD_t=attrBiTangent;

    #ifdef MOD_SMOOTHSTEP
        MOD_t=smoothstep(-1.,1.,MOD_t);
    #endif

    pos.xyz+=MOD_t*MOD_disp*MOD_mask;

#endif

#ifdef MOD_MODE_VERTCOL
    vec3 MOD_t=attrVertColor.rgb*vec3(2.0)-vec3(1.0);

    #ifdef MOD_SMOOTHSTEP
        MOD_t=smoothstep(-1.,1.,MOD_t);
    #endif

    pos.xyz+=MOD_t*MOD_disp*MOD_mask;

#endif


// pos.y*=-1.0;
    // pos.xy+=vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);


MOD_displHeightMapColor=MOD_disp;


#ifdef MOD_CALC_NORMALS
    norm+=MOD_calcNormal(MOD_texture,MOD_tc);
#endif