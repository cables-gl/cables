UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;

mat4 MOD_translate(mat4 mat)
{
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 worldPos=vec3(mat[3][0],mat[3][1],mat[3][2]);
    vec3 vecToOrigin=worldPos-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);
    else
    {
        if(distAlpha>0.0) distAlpha=1.0;
        else distAlpha=0.0;
    }

    distAlpha*=MOD_strength;

    vec3 tr=normalize(vecToOrigin)*distAlpha;

    mat[3][0] += tr.x;
    mat[3][1] += tr.y;
    mat[3][2] += tr.z;

    return mat;
}
