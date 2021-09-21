float tx=mod(instanceIndex,(MOD_texSize))/MOD_texSize+(1.0/MOD_texSize*0.5);
float ty=float(int((instanceIndex/(MOD_texSize))))/MOD_texSize+(1.0/MOD_texSize*0.5);

vec3 MOD_texPos=texture(MOD_texTrans,vec2(tx,ty)).rgb;
mat4 texInstMat;

#ifdef USE_TEX_ROT
    vec3 MOD_texRota=texture(MOD_texRot,vec2(tx,ty)).rgb;
    mat3 rm=ntorot(((MOD_texRota))*2360.0);
#endif

#ifndef USE_TEX_ROT
    mat3 rm;
#endif

texInstMat=mat4(rm[0][0], rm[0][1], rm[0][2], 0.0,
			rm[1][0], rm[1][1], rm[1][2], 0.0,
			rm[2][0], rm[2][1], rm[2][2], 0.0,
			MOD_texPos.x,
			MOD_texPos.y,
			MOD_texPos.z,
			1.0 );

vec3 scale=vec3(1.0);

#ifdef USE_TEX_SCALE
    scale*=texture(MOD_texScale,vec2(tx,ty)).rgb;
#endif


texInstMat[0][0]=MOD_scale*scale.x;
texInstMat[1][1]=MOD_scale*scale.y;
texInstMat[2][2]=MOD_scale*scale.z;
texInstMat[3][3]=1.4; // ?

mMatrix*=texInstMat;

#ifdef USE_TEX_COLOR

    vec4 instColor=texture(MOD_texColor,vec2(tx,ty));

    frag_instColor=instColor;
#endif




