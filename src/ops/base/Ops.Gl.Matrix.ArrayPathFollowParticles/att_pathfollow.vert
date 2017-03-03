//sdfsd


float off=MOD_offset;
if(MOD_randomSpeed)
{
    off*=rndPos.x;
    
}

float fr=fract(abs(mod(off+rndOffset,float(PATHFOLLOW_POINTS-3))));
int index=int(abs(mod(off+rndOffset,float(PATHFOLLOW_POINTS-3))));
int index2=int(abs(mod(off+1.0+rndOffset,float(PATHFOLLOW_POINTS-3))));


pos.xyz = mix( MOD_points[index] ,MOD_points[index2] ,fr);

// pos.xyz = MOD_points[index];

pos.xyz+=rndPos;
