
float MOD_vca=1.0;

#ifdef MOD_INPUT_LUMI
    float MOD_lumi = dot(vec3(0.2126,0.7152,0.0722), col.rgb);

    MOD_vca=MOD_lumi;
#endif
#ifdef MOD_INPUT_R
    MOD_vca=vertColor.r;
#endif
#ifdef MOD_INPUT_G
    MOD_vca=vertColor.g;
#endif
#ifdef MOD_INPUT_B
    MOD_vca=vertColor.b;
#endif

#ifdef MOD_INVERT
    col.a=1.0-MOD_vca;
#endif
#ifndef MOD_INVERT
    col.a=MOD_vca;
#endif