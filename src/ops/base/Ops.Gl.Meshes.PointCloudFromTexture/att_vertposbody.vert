
float tx=mod(attrVertIndex,MOD_texSize)/MOD_texSize;
float ty=float(int((attrVertIndex/MOD_texSize)))/MOD_texSize;

vec4 col=texture(MOD_tex,vec2(tx,ty));

// vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

pos.xyz=MOD_pos.xyz;


