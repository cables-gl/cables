

MOD_pos=(pos).xyz;



float tx=mod(attrVertIndex,MOD_texSize);
float ty=float(int((attrVertIndex/MOD_texSize)));


// viewMatrix=mat4(0.0);
// mMatrix=mat4(0.0);
// gl_Position=vec4(tx,ty,0.0,0.0);

gl_PointSize=1.0;

// pos=vec4(tx,ty,0.0,0.0);

pos=vec4(tx,ty+1.0,0.0,1.0);

// MOD_pos.x=attrVertIndex;