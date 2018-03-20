

float off=(MOD_delta*MOD_spacing)+MOD_offset;
// if(MOD_randomSpeed)
// {
//     off*=MOD_rand(pos.xy);
// }

float rndOffset=0.0;

float fr=fract(abs(mod(off+rndOffset,float(PATHFOLLOW_POINTS))));
int index=int(abs(mod(off+rndOffset,max(0.0,float(PATHFOLLOW_POINTS))  )));
int index2=int(abs(mod(off+1.0+rndOffset,max(0.0,float(PATHFOLLOW_POINTS)) )));

vec3 mPos;

if(index2!=0)
{
    mPos = mix( MOD_points[index] ,MOD_points[index2] ,fr);

    #ifdef CHECK_DISTANCE
        // if( distance(MOD_points[index] ,MOD_points[index2]) > MOD_maxDistance ) pos.xyz=vec3(9999999.0,9999999.0,9999999.0);
    #endif
}
else
{
    mPos=MOD_points[0];
}

// pos.xyz+=rndPos;

mMatrix[3][0]+=mPos.x;
mMatrix[3][1]+=mPos.y;
mMatrix[3][2]+=mPos.z;

float scc=texture2D( MOD_texScale, vec2(MOD_delta/MOD_numInstances,0.5) ).r;

mMatrix[0][0]*=scc*MOD_scale;
mMatrix[1][1]*=scc*MOD_scale;
mMatrix[2][2]*=scc*MOD_scale;

float splinePos=float(MOD_delta)/float(MOD_numInstances);
mat4 rotm=rotationMatrix(vec3(1.0,0.0,1.0),splinePos*MOD_rotation);

mMatrix*=rotm;