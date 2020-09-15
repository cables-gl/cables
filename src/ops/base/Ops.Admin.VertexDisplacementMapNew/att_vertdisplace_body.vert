
vec2 MOD_tc=texCoord;

#ifdef MOD_FLIP_Y
    MOD_tc.y=1.0-MOD_tc.y;
#endif
#ifdef MOD_FLIP_X
    MOD_tc.x=1.0-MOD_tc.x;
#endif
#ifdef MOD_FLIP_XY
    MOD_tc=1.0-MOD_tc;
#endif

vec4 MOD_sample=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) );
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


// MOD_disp=smoothstep(0.,1.,MOD_disp*MOD_disp*MOD_disp);
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
    pos.xyz+=norm*MOD_disp*MOD_mask;//*normalize(norm.xyz);
#endif
#ifdef MOD_MODE_TANGENT

    // vec3 t=attrTangent;
    // t.z*=-1.0;
    MOD_disp*=-1.0;
    pos.xyz+=(attrTangent)*MOD_disp*MOD_mask;//*normalize(attrTangent.xyz);
#endif
#ifdef MOD_MODE_BITANGENT



    // vec3 t=vec3(attrBiTangent);// attrBiTangent.x-=0.07;

    MOD_disp*=-1.0;
    // MOD_disp=vec3(MOD_tc,0.0);
    // MOD_disp+=norm;

    // t.z*=-1.0;
    // t.y*=-1.0;
    // t.x*=-1.0;
    // t=normalize(t);
// t.x-=0.29;

    pos.xyz+=attrBiTangent*MOD_disp*MOD_mask;//*normalize(attrBiTangent.xyz);
#endif


// pos.y*=-1.0;
    // pos.xy+=vec2(MOD_texVal*MOD_extrude)*normalize(pos.xy);


MOD_displHeightMapColor=MOD_disp;


#ifdef CALC_NORMALS
    norm+=MOD_calcNormal(MOD_texture,MOD_tc);
#endif