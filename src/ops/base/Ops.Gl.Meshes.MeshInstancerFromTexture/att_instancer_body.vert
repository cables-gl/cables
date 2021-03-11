

float tx=mod(instanceIndex,MOD_texSize)/MOD_texSize;
float ty=float(int((instanceIndex/MOD_texSize)))/MOD_texSize;

vec3 MOD_texPos=texture(MOD_texTrans,vec2(tx,ty)).rgb;
vec3 MOD_texRota=texture(MOD_texRot,vec2(tx,ty)).rgb;

mat4 texInstMat;


mat3 rm=ntorot(((MOD_texRota)*2360.0));


texInstMat= mat4(rm[0][0], rm[0][1], rm[0][2], 0.0,
			rm[1][0], rm[1][1], rm[1][2], 0.0,
			rm[2][0], rm[2][1], rm[2][2], 0.0,
			MOD_texPos.x,
			MOD_texPos.y,
			MOD_texPos.z,
			1.0 );


// texInstMat[3][0]=MOD_texPos.x;
// texInstMat[3][1]=MOD_texPos.y;
// texInstMat[3][2]=MOD_texPos.z;

texInstMat[0][0]=MOD_scale;
texInstMat[1][1]=MOD_scale;
texInstMat[2][2]=MOD_scale;
texInstMat[3][3]=1.4; // wtf is this number

mMatrix*=texInstMat;
// pos.xyz*=MOD_scale;
frag_instColor=instColor;


