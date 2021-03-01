

float tx=mod(instanceIndex,MOD_texSize)/MOD_texSize;
float ty=float(int((instanceIndex/MOD_texSize)))/MOD_texSize;

vec3 MOD_texPos=texture(MOD_tex,vec2(tx,ty)).rgb;

mat4 texInstMat;

texInstMat[3][0]=MOD_texPos.x;
texInstMat[3][1]=MOD_texPos.y;
texInstMat[3][2]=MOD_texPos.z;

texInstMat[0][0]=texInstMat[1][1]=texInstMat[2][2]=MOD_scale;
texInstMat[3][3]=1.4; // wtf is this number

mMatrix=texInstMat;
// pos.xyz*=MOD_scale;
frag_instColor=instColor;

