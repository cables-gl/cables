
float size=128.0;
float tx=mod(attrVertIndex,size)/size;
float ty=float(int((attrVertIndex/size)))/size;

vec4 col=texture(MOD_tex,vec2(tx,ty));

// vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

pos.xyz=MOD_pos.xyz;


