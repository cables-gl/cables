
// float tx=mod(attrVertIndex,(MOD_texSize))/(MOD_texSize);
// float ty=float(int((attrVertIndex/(MOD_texSize))))/(MOD_texSize);

vec4 col=texture(MOD_tex,texCoord);//vec2(tx,ty));

// vec4 col=texture(MOD_tex,texCoord);


vec3 MOD_pos=col.xyz;

// MOD_pos.x+=attrVertIndex/10000.0;
// MOD_pos.y+=attrVertIndex/1000.0;

pos.xyz=MOD_pos.xyz;

// texCoord.x=tx;