
mat4 MOD_translate(mat4 mat)
{
    // vec3 forcePos=vec3(MOD_posx,MOD_posy,MOD_posz);
    vec3 worldPos=vec3(mat[3][0],mat[3][1],mat[3][2]);
    vec3 vecToOrigin=worldPos-MOD_pos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    distAlpha=clamp(distAlpha,0.0,1.0);

    distAlpha*=MOD_strength;

    vec3 tr=normalize(vecToOrigin)*distAlpha;

tr*=MOD_mul;

    mat[3][0] += tr.x;
    mat[3][1] += tr.y;
    mat[3][2] += tr.z;

    return mat;
}

