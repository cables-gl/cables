
#ifdef INSTANCING

vec4 MOD_p=vec4(instMat[3][0],instMat[3][1],instMat[3][2],0.0);
// MOD_coord=MOD_p.xy*(1.0/MOD_scale)+MOD_offset-vec2(0.5,0.5);

MOD_p*=viewMatrix;

// pos.x=mod(MOD_p.x,20.0);

mMatrix[3].x=-viewMatrix[3].x+mod(viewMatrix[3].x-mMatrix[3].x,4.0)-2.0;
mMatrix[3].y=-viewMatrix[3].y+mod(viewMatrix[3].y-mMatrix[3].y,4.0)-2.0;
// mMatrix[3].y=mMatrix[3].y;
mMatrix[3].z=mMatrix[3].z;


#endif

