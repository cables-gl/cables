

float MOD_mulA=smoothstep(MOD_start,MOD_start-MOD_transDist,instanceIndex);
float MOD_mulB=smoothstep(MOD_start+MOD_width+MOD_transDist,MOD_start+MOD_width,instanceIndex);

float MOD_mul=(MOD_mulB-MOD_mulA);

mat4 MOD_rotm;

MOD_rotm[0][0]=1.0+(MOD_mul*MOD_scaleX);
MOD_rotm[1][1]=1.0+(MOD_mul*MOD_scaleY);
MOD_rotm[2][2]=1.0+(MOD_mul*MOD_scaleZ);
MOD_rotm[3][3]=1.0;

MOD_rotm=MOD_rotm*MOD_rotationMatrix(vec3(1.0,0.0,0.0),MOD_mul*MOD_rotX);
MOD_rotm=MOD_rotm*MOD_rotationMatrix(vec3(0.0,1.0,0.0),MOD_mul*MOD_rotY);
MOD_rotm=MOD_rotm*MOD_rotationMatrix(vec3(0.0,0.0,1.0),MOD_mul*MOD_rotZ);

MOD_rotm[3].x=MOD_mul*MOD_posX;
MOD_rotm[3].y=MOD_mul*MOD_posY;
MOD_rotm[3].z=MOD_mul*MOD_posZ;


mMatrix*=MOD_rotm;
