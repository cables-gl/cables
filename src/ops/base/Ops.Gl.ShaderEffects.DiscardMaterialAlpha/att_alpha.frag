

#ifdef ALPHA_THRESHOLD
    if(col.a<MOD_threshold) discard;
#endif

#ifdef ALPHA_ONE
    col.a=1.0;
#endif

#ifdef ALPHA_DITHERED
    if ( dither_InterleavedGradientNoise(col.a) <= 0.5 )
        discard;
#endif

#ifdef ALPHA_COVERAGE_SHARP
    // if(col.a<MOD_threshold) discard;

    col.a = (col.a - MOD_threshold) / max(fwidth(col.a), 0.0001) + 0.5;
#endif