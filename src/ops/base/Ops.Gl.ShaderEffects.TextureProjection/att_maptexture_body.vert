// OUT vec4 MOD_pos;
// UNI vec2 MOD_offset;
// UNI float MOD_scale;
// UNI float MOD_amount;
OUT vec2 MOD_tc;

const float MOD_DEG2RAD = 0.017453292519943;

#ifdef MOD_MAP_TRIPLANAR

    OUT vec2 MOD_tc1;
    OUT vec2 MOD_tc2;
    OUT vec3 MOD_blendingTri;

    void mapTriplanar(vec3 wNorm,vec3 pos)
    {
        vec3 blending = abs( wNorm );
        blending = normalize(max(blending, 0.1));
        float b = (blending.x + blending.y + blending.z);
        blending /= vec3(b);
        MOD_blendingTri=blending;

        MOD_tc = pos.yz;
        MOD_tc1 = pos.xz;
        MOD_tc2 = pos.xy;
    }

#endif

mat4 MOD_rotationX( in float angle ) {
	return mat4(	1.0,		0,			0,			0,
			 		0, 	cos(angle),	-sin(angle),		0,
					0, 	sin(angle),	 cos(angle),		0,
					0, 			0,			  0, 		1);
}

mat4 MOD_rotationY( in float angle ) {
	return mat4(	cos(angle),		0,		sin(angle),	0,
			 				0,		1.0,			 0,	0,
					-sin(angle),	0,		cos(angle),	0,
							0, 		0,				0,	1);
}

mat4 MOD_rotationZ( in float angle ) {
	return mat4(	cos(angle),		-sin(angle),	0,	0,
			 		sin(angle),		cos(angle),		0,	0,
							0,				0,		1,	0,
							0,				0,		0,	1);
}
