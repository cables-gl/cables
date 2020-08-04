
UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;

vec4 MOD_scaler(vec4 pos,mat4 modelMatrix)
{
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 vecToOrigin=(modelMatrix*pos).xyz-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);
    
    // pos.xyz*=(1.0+(distAlpha*MOD_strength));

    mat3 rotation = mat3(
        vec3( cos(MOD_strength*distAlpha),  sin(MOD_strength*distAlpha),  0.0),
        vec3(-sin(MOD_strength*distAlpha),  cos(MOD_strength*distAlpha),  0.0),
        vec3(        0.0,         0.0,  1.0)
    );
    pos =vec4(rotation * pos.xyz, 1.0);


    return pos;
}
