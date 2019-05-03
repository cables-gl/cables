
float MOD_oneMFade=1.0-MOD_fade;
pos = vec4( pos.xyz * MOD_fade + MOD_targetPosition * MOD_oneMFade, 1.0 );

#ifdef MORPH_NORMALS
    norm      = vec3( norm * MOD_fade + MOD_targetNormal * MOD_oneMFade );
    tangent   = vec3( attrTangent * MOD_fade + MOD_targetTangent * MOD_oneMFade );
    bitangent = vec3( attrBiTangent * MOD_fade + MOD_targetBiTangent * MOD_oneMFade );
#endif
