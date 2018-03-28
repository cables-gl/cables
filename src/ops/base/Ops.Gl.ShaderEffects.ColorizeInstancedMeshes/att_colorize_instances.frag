

// col.rgb*=MOD_random(vec2(instanceIndexFrag/1000.0,instanceIndexFrag/1000.0));

float MOD_rand=fract(sin(instanceIndexFrag));

#ifdef LOOKUPTEX
    // col.rgb*= (texture2D( MOD_lut, vec2(MOD_rand,0.5) ).rgb-vec3(0.5))*2.0*MOD_strength;
    col.rgb*=  ( (texture2D( MOD_lut, vec2(MOD_rand,0.5) ).rgb+0.5)*MOD_strength);
    // col.rgb*=MOD_strength;
#endif

#ifdef MULCOLOR
    col.rgb*=(MOD_rand*2.0)*MOD_strength;
#endif

