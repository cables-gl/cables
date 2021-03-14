
float tx=mod(attrVertIndex,MOD_texSize)/MOD_texSize;
float ty=float(int((attrVertIndex/MOD_texSize)))/MOD_texSize;

vec4 col=texture(MOD_tex,vec2(tx,ty));

// vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;


#ifdef MOD_NORMALIZE
    MOD_pos=(MOD_pos.xyz-0.5)*2.0;
#endif


#ifdef MOD_AXIS_XYZ
pos.xyz=MOD_pos.xyz;
#endif
#ifdef MOD_AXIS_XY
pos.xy=MOD_pos.xy;
pos.z=0.0;
pos.w=1.0;
#endif


