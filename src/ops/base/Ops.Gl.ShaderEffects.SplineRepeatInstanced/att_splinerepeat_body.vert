float off=(MOD_index)+MOD_offset;

#ifdef METHOD_FILL
off=mod(off,float(PATHFOLLOW_POINTS));
#endif

float fr=off-floor(off);
int index=int(floor(off));
int index2=index+1;
float posOnSpline=(float(index)+fr)/float(PATHFOLLOW_POINTS);

mat4 newMatrix=mat4(1.0);
newMatrix[0][0]=MOD_scale;
newMatrix[1][1]=MOD_scale;
newMatrix[2][2]=MOD_scale;
newMatrix[3][3]=1.0;

vec3 mPos;


float mulRotPre=0.0;
#ifdef TEX_ROT
    // float scc=texture2D( MOD_texScale, vec2(posOnSpline,0.5) ).r;
    mulRotPre=texture2D( MOD_texRot, vec2(posOnSpline,0.5) ).r*116.28;
    
#endif

mat4 rotma=mat4(1.0);
rotma=rotma*rotationMatrix(vec3(1.0,0.0,0.0),MOD_preRotX+mulRotPre);
rotma=rotma*rotationMatrix(vec3(0.0,1.0,0.0),MOD_preRotY+mulRotPre);
rotma=rotma*rotationMatrix(vec3(0.0,0.0,1.0),MOD_preRotZ+mulRotPre);
// rotma[3][3]=1.0;


if(index2!=0 && index>-1 && index2<PATHFOLLOW_POINTS)
{
    mPos=mix(MOD_points[index], MOD_points[index2] ,fr);
}
else
{
    newMatrix[0][0]=0.0;
    newMatrix[1][1]=0.0;
    newMatrix[2][2]=0.0;
    newMatrix[3][3]=1.0;
}

newMatrix[3][0]+=mPos.x;
newMatrix[3][1]+=mPos.y;
newMatrix[3][2]+=mPos.z;
newMatrix[3][3]=1.0;

#ifdef TEX_SCALE
    float scc=texture2D( MOD_texScale, vec2(posOnSpline,0.5) ).r;
    
    newMatrix[0][0]*=scc;
    newMatrix[1][1]*=scc;
    newMatrix[2][2]*=scc;
#endif

#ifndef ROT_BYPOSITION
    posOnSpline=1.0;
#endif

mat4 rotm=mat4(1.0);
rotm=rotm*rotationMatrix(vec3(1.0,0.0,0.0),(posOnSpline)*MOD_rotX);
rotm=rotm*rotationMatrix(vec3(0.0,1.0,0.0),(posOnSpline)*MOD_rotY);
rotm=rotm*rotationMatrix(vec3(0.0,0.0,1.0),(posOnSpline)*MOD_rotZ);


newMatrix*=rotma;
mMatrix*=newMatrix;
mMatrix*=rotm;

