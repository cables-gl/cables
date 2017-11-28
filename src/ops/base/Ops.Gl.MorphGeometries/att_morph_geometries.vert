

pos = vec4(
        pos.xyz * MOD_fade +
        MOD_morphTarget * ( 1.0 - MOD_fade ),
        1.0 );
