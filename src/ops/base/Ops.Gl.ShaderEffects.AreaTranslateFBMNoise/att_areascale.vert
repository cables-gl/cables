UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_tx,MOD_ty,MOD_tz;
UNI float MOD_strength;
UNI float MOD_size;
UNI float MOD_noiseScale;




float MOD_mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 MOD_mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 MOD_perm(vec4 x){return MOD_mod289(((x * 34.0) + 1.0) * x);}

float MOD_noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = MOD_perm(b.xyxy);
    vec4 k2 = MOD_perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = MOD_perm(c);
    vec4 k4 = MOD_perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}



float MOD_fbm(vec3 x)
{
    const int NUM_OCTAVES=8;
    float time=0.0;

	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100.0+time);
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * MOD_noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}



mat4 MOD_rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}


mat4 MOD_translate(mat4 mat)
{
    vec3 forcePos=vec3(MOD_x,MOD_y,MOD_z);
    vec3 noisePos=vec3(MOD_tx,MOD_ty,MOD_tz);
    vec3 worldPos=vec3(mat[3][0],mat[3][1],mat[3][2]);
    // vec3 worldPosInst=vec3(instMat[3][0],instMat[3][1],instMat[3][2]);

    vec3 vecToOrigin=worldPos-forcePos;
    float dist=abs(length(vecToOrigin));
    float distAlpha = (MOD_size - dist) ;

    if(MOD_smooth) distAlpha=smoothstep(0.0,MOD_size,distAlpha);
    else
    {
        if(distAlpha>0.0) distAlpha=1.0;
        else distAlpha=0.0;
    }

    distAlpha*=MOD_strength;

    vec3 tr=vec3(distAlpha);

    float nois=(MOD_fbm(MOD_noiseScale*(worldPos+noisePos))-0.5);
    float nois2=(MOD_fbm(MOD_noiseScale*(worldPos+noisePos*5.711))-0.5);
    float nois3=(MOD_fbm(MOD_noiseScale*(worldPos+noisePos*2.0))-0.5);
    // tr=nois*tr;


    #ifdef MOD_DO_ROTATE
        if(distAlpha>0.0) mat*=MOD_rotation3d( vec3(distAlpha)*vec3(nois,nois2,nois3), MOD_strength/57.297);
    #endif

    #ifdef MOD_DO_TRANSLATE
        mat[3][0] += nois*distAlpha;
        mat[3][1] += nois2*distAlpha;
        mat[3][2] += nois3*distAlpha;
    #endif

    return mat;
}
