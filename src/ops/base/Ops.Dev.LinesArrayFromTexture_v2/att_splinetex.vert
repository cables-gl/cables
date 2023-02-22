
vec4 col=texture(MOD_tex,texCoord);

vec3 MOD_pos=col.xyz;

pos.xyz=MOD_pos.xyz;

mulAlpha=1.0;
if(col.a<1.0) mulAlpha=0.0;

#ifdef MASK_PARTICLES
    float MOD_e=texture(MOD_particleMask,texCoord).r;

    if(MOD_e<0.95 && MOD_e>0.001) mulAlpha*=1.0;
    else mulAlpha=0.0;
#endif