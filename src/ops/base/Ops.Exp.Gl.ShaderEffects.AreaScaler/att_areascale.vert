
UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;

vec4 MOD_scaler(vec4 pos,vec4 worldPos)
{
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 vecToOrigin=worldPos.xyz-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);
    
    pos.xyz*=(1.0+(distAlpha*MOD_strength));

    return pos;
}
