// Author: Stefan Gustavson
// Title: Worley noise 2x2x2

IN vec2 texCoord;

UNI float amount;
UNI float x;
UNI float y;
UNI float z;
UNI float scale;
UNI sampler2D tex;
UNI float rangeA;
UNI float rangeB;
UNI float aspect;
UNI float harmonics;

#ifdef HAS_MASK
    UNI sampler2D texMask;
#endif

#ifdef HAS_TEX_OFFSETMAP
    UNI sampler2D texOffsetZ;
    UNI float offMul;
#endif

{{CGL.BLENDMODES3}}
{{CGL.LUMINANCE}}

// Cellular noise ("Worley noise") in 3D in GLSL.
// Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved.
// This code is released under the conditions of the MIT license.
// See LICENSE file for details.

// Permutation polynomial: (34x^2 + x) mod 289
vec4 permute(vec4 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}
vec3 permute(vec3 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Speeded up by using 2x2x2 search window instead of 3x3x3,
// at the expense of some pattern artifacts.
// F2 is often wrong and has sharp discontinuities.
// If you need a good F2, use the slower 3x3x3 version.
vec2 cellular2x2x2(vec3 P) {
	#define K 0.142857142857 // 1/7
	#define Ko 0.428571428571 // 1/2-K/2
	#define K2 0.020408163265306 // 1/(7*7)
	#define Kz 0.166666666667 // 1/6
	#define Kzo 0.416666666667 // 1/2-1/6*2
	#define jitter 0.8 // smaller jitter gives less errors in F2
	vec3 Pi = mod(floor(P), 289.0);
 	vec3 Pf = fract(P);
	vec4 Pfx = Pf.x + vec4(0.0, -1.0, 0.0, -1.0);
	vec4 Pfy = Pf.y + vec4(0.0, 0.0, -1.0, -1.0);
	vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));
	p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));
	vec4 p1 = permute(p + Pi.z); // z+0
	vec4 p2 = permute(p + Pi.z + vec4(1.0)); // z+1
	vec4 ox1 = fract(p1*K) - Ko;
	vec4 oy1 = mod(floor(p1*K), 7.0)*K - Ko;
	vec4 oz1 = floor(p1*K2)*Kz - Kzo; // p1 < 289 guaranteed
	vec4 ox2 = fract(p2*K) - Ko;
	vec4 oy2 = mod(floor(p2*K), 7.0)*K - Ko;
	vec4 oz2 = floor(p2*K2)*Kz - Kzo;
	vec4 dx1 = Pfx + jitter*ox1;
	vec4 dy1 = Pfy + jitter*oy1;
	vec4 dz1 = Pf.z + jitter*oz1;
	vec4 dx2 = Pfx + jitter*ox2;
	vec4 dy2 = Pfy + jitter*oy2;
	vec4 dz2 = Pf.z - 1.0 + jitter*oz2;
	vec4 d1 = dx1 * dx1 + dy1 * dy1 + dz1 * dz1; // z+0
	vec4 d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2; // z+1

	// Sort out the two smallest distances (F1, F2)
#if 0
	// Cheat and sort out only F1
	d1 = min(d1, d2);
	d1.xy = min(d1.xy, d1.wz);
	d1.x = min(d1.x, d1.y);
	return sqrt(d1.xx);
#else
	// Do it right and sort out both F1 and F2
	vec4 d = min(d1,d2); // F1 is now in d
	d2 = max(d1,d2); // Make sure we keep all candidates for F2
	d.xy = (d.x < d.y) ? d.xy : d.yx; // Swap smallest to d.x
	d.xz = (d.x < d.z) ? d.xz : d.zx;
	d.xw = (d.x < d.w) ? d.xw : d.wx; // F1 is now in d.x
	d.yzw = min(d.yzw, d2.yzw); // F2 now not in d2.yzw
	d.y = min(d.y, d.z); // nor in d.z
	d.y = min(d.y, d.w); // nor in d.w
	d.y = min(d.y, d2.x); // F2 is now in d.y
	return sqrt(d.xy); // F1 and F2
#endif
}

void main(void) {
	vec2 st = texCoord;//gl_FragCoord.xy/u_resolution.xy;

	#ifdef DO_TILEABLE
	    st=abs(texCoord-0.5);
	#endif

    vec3 offset;
    #ifdef HAS_TEX_OFFSETMAP
        vec4 offMap=texture(texOffsetZ,texCoord);

        #ifdef OFFSET_X_R
            offset.x=offMap.r;
        #endif
        #ifdef OFFSET_X_G
            offset.x=offMap.g;
        #endif
        #ifdef OFFSET_X_B
            offset.x=offMap.b;
        #endif

        #ifdef OFFSET_Y_R
            offset.y=offMap.r;
        #endif
        #ifdef OFFSET_Y_G
            offset.y=offMap.g;
        #endif
        #ifdef OFFSET_Y_B
            offset.y=offMap.b;
        #endif

        #ifdef OFFSET_Z_R
            offset.z=offMap.r;
        #endif
        #ifdef OFFSET_Z_G
            offset.z=offMap.g;
        #endif
        #ifdef OFFSET_Z_B
            offset.z=offMap.b;
        #endif
        offset*=offMul;
    #endif

    st.x-=0.5;
    st.y-=0.5;
	st *= scale;
    st.x+=0.5;
    st.y+=0.5;

    st.y/=aspect;

	st.x+=x;
	st.y+=y;

	vec2 F = cellular2x2x2(vec3(st,z)+offset);

    if (harmonics >= 2.0) F.x += cellular2x2x2(vec3(st,z)*2.2+offset).x * 0.5;
    if (harmonics >= 3.0) F.x += cellular2x2x2(vec3(st,z)*4.3+offset).x * 0.25;
    if (harmonics >= 4.0) F.x += cellular2x2x2(vec3(st,z)*8.4+offset).x * 0.125;
    if (harmonics >= 5.0) F.x += cellular2x2x2(vec3(st,z)*16.5+offset).x * 0.0625;

	float n = smoothstep(rangeA,rangeB, F.x);

    #ifdef DO_INVERT
        n=1.0-n;
    #endif

    vec4 col=vec4(n,n,n,1.0);
    vec4 base=texture(tex,texCoord);

    float am=amount;
    #ifdef HAS_MASK
        #ifdef MASK_SRC_R
            float mul=texture(texMask,texCoord).r;
        #endif
        #ifdef MASK_SRC_G
            float mul=texture(texMask,texCoord).g;
        #endif
        #ifdef MASK_SRC_B
            float mul=texture(texMask,texCoord).b;
        #endif
        #ifdef MASK_SRC_A
            float mul=texture(texMask,texCoord).a;
        #endif
        #ifdef MASK_SRC_LUM
            float mul=cgl_luminance(texture(texMask,texCoord).rgb);
        #endif
        #ifdef MASK_INV
            mul=1.0-mul;
        #endif
        am*=mul;
    #endif

    outColor=cgl_blendPixel(base,col,am);

}
