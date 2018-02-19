
float off=MOD_offset;
if(MOD_randomSpeed)
{
    // off*=rndPos.x;
    off*=MOD_rand(pos.xy);
}

float fr=fract(abs(mod(off+rndOffset,float(PATHFOLLOW_POINTS))));
int index=int(abs(mod(off+rndOffset,max(0.0,float(PATHFOLLOW_POINTS))  )));
int index2=int(abs(mod(off+1.0+rndOffset,max(0.0,float(PATHFOLLOW_POINTS)) )));

if(index2!=0)
{
    pos.xyz = mix( MOD_points[index] ,MOD_points[index2] ,fr);

    #ifdef CHECK_DISTANCE
        if( distance(MOD_points[index] ,MOD_points[index2]) > MOD_maxDistance ) pos.xyz=vec3(9999999.0,9999999.0,9999999.0);
    #endif
}
else
{
    pos.xyz=MOD_points[0];
}

pos.xyz+=rndPos;