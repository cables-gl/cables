

pos = vec4(
    pos.xyz * MOD_fade +
    MOD_targetPosition * ( 1.0 - MOD_fade ),
    1.0 );

#ifdef MORPH_NORMALS
    norm= vec3(
        norm * MOD_fade +
        MOD_targetNormal * ( 1.0 - MOD_fade )
        );
#endif