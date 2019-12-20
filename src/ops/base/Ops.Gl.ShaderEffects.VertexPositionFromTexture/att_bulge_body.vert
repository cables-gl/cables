vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

pos.xyz=MOD_pos.xyz;

// pos.xyz=vec3(0.0);
// mMatrix[3].xyz+=MOD_pos.xyz;
