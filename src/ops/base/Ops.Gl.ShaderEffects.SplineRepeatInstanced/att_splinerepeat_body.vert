highp float off=(MOD_index)+MOD_offset;

#ifdef METHOD_FILL
off=mod(off,float(PATHFOLLOW_POINTS));
#endif

highp float fr=off-floor(off);
highp int index=int(floor(off));
highp int index2=index+1;

highp mat4 newMatrix;
newMatrix[0][0]=MOD_scale;
newMatrix[1][1]=MOD_scale;
newMatrix[2][2]=MOD_scale;
newMatrix[3][3]=1.0;

highp vec3 mPos;

if(index2!=0 && index>-1 && index2<PATHFOLLOW_POINTS)
{
    mPos=mix(MOD_points[index], MOD_points[index2] ,fr);
}
else
{
    newMatrix[0][0]=0.0;
    newMatrix[1][1]=0.0;
    newMatrix[2][2]=0.0;
    newMatrix[3][3]=0.0;
}

newMatrix[3][0]+=mPos.x;
newMatrix[3][1]+=mPos.y;
newMatrix[3][2]+=mPos.z;

highp float posOnSpline=(float(index)+fr)/float(PATHFOLLOW_POINTS);

#ifdef TEX_SCALE
    highp float scc=texture2D( MOD_texScale, vec2(posOnSpline,0.5) ).r;
    
    newMatrix[0][0]*=scc;
    newMatrix[1][1]*=scc;
    newMatrix[2][2]*=scc;
#endif

highp mat4 rotm=rotationMatrix(vec3(MOD_rotX,MOD_rotY,MOD_rotZ),(posOnSpline)*MOD_rotation);


mMatrix*=newMatrix;
mMatrix*=rotm;