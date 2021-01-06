vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

#ifdef MOD_ADD
pos.xyz+=MOD_pos.xyz;
#endif

#ifdef MOD_ABS
pos.xyz=MOD_pos.xyz;
#endif

