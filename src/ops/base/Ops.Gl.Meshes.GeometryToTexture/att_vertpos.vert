MOD_pos=pos.xyz;

float tx=mod(attrVertIndex,MOD_texSize)+1.0/MOD_texSize;
float ty=floor(attrVertIndex/MOD_texSize);

gl_PointSize=1.0;

pos=vec4(tx,ty+1.0,0.0,1.0);
