
UNI bool MOD_smooth;
UNI float MOD_x,MOD_y,MOD_z;
UNI float MOD_strength;
UNI float MOD_size;
UNI float MOD_scale;
UNI float MOD_scrollx;
UNI float MOD_scrolly;
UNI float MOD_scrollz;


float Interpolation_C2( float x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }   //  6x^5-15x^4+10x^3	( Quintic Curve.  As used by Perlin in Improved Noise.  http://mrl.nyu.edu/~perlin/paper445.pdf )
vec2 Interpolation_C2( vec2 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec3 Interpolation_C2( vec3 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec4 Interpolation_C2( vec4 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec4 Interpolation_C2_InterpAndDeriv( vec2 x ) { return x.xyxy * x.xyxy * ( x.xyxy * ( x.xyxy * ( x.xyxy * vec2( 6.0, 0.0 ).xxyy + vec2( -15.0, 30.0 ).xxyy ) + vec2( 10.0, -60.0 ).xxyy ) + vec2( 0.0, 30.0 ).xxyy ); }
vec3 Interpolation_C2_Deriv( vec3 x ) { return x * x * (x * (x * 30.0 - 60.0) + 30.0); }


void FAST32_hash_3D( 	vec3 gridcell,
                        out vec4 lowz_hash_0,
                        out vec4 lowz_hash_1,
                        out vec4 lowz_hash_2,
                        out vec4 highz_hash_0,
                        out vec4 highz_hash_1,
                        out vec4 highz_hash_2	)		//	generates 3 random numbers for each of the 8 cell corners
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );
    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	calculate the noise
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    P = P.xzxz * P.yyww;
    vec3 lowz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );
    vec3 highz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );
    lowz_hash_0 = fract( P * lowz_mod.xxxx );
    highz_hash_0 = fract( P * highz_mod.xxxx );
    lowz_hash_1 = fract( P * lowz_mod.yyyy );
    highz_hash_1 = fract( P * highz_mod.yyyy );
    lowz_hash_2 = fract( P * lowz_mod.zzzz );
    highz_hash_2 = fract( P * highz_mod.zzzz );
}

//
//	Perlin Noise 3D  ( gradient noise )
//	Return value range of -1.0->1.0
//	http://briansharpe.files.wordpress.com/2011/11/perlinsample.jpg
//
float Perlin3D( vec3 P )
{
    //	establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;
    vec3 Pf_min1 = Pf - 1.0;

#if 1
    //
    //	classic noise.
    //	requires 3 random values per point.  with an efficent hash function will run faster than improved noise
    //

    //	calculate the hash.
    //	( various hashing methods listed in order of speed )
    vec4 hashx0, hashy0, hashz0, hashx1, hashy1, hashz1;
    FAST32_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );
    //SGPP_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );

    //	calculate the gradients
    vec4 grad_x0 = hashx0 - 0.49999;
    vec4 grad_y0 = hashy0 - 0.49999;
    vec4 grad_z0 = hashz0 - 0.49999;
    vec4 grad_x1 = hashx1 - 0.49999;
    vec4 grad_y1 = hashy1 - 0.49999;
    vec4 grad_z1 = hashz1 - 0.49999;
    vec4 grad_results_0 = inversesqrt( grad_x0 * grad_x0 + grad_y0 * grad_y0 + grad_z0 * grad_z0 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x0 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y0 + Pf.zzzz * grad_z0 );
    vec4 grad_results_1 = inversesqrt( grad_x1 * grad_x1 + grad_y1 * grad_y1 + grad_z1 * grad_z1 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x1 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y1 + Pf_min1.zzzz * grad_z1 );

#if 1
    //	Classic Perlin Interpolation
    vec3 blend = Interpolation_C2( Pf );
    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );
    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
    float final = dot( res0, blend2.zxzx * blend2.wwyy );
    final *= 1.1547005383792515290182975610039;		//	(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/sqrt(0.75)
    return final;
#else
    //	Classic Perlin Surflet
    //	http://briansharpe.wordpress.com/2012/03/09/modifications-to-classic-perlin-noise/
    Pf *= Pf;
    Pf_min1 *= Pf_min1;
    vec4 vecs_len_sq = vec4( Pf.x, Pf_min1.x, Pf.x, Pf_min1.x ) + vec4( Pf.yy, Pf_min1.yy );
    float final = dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf.zzzz ) ), grad_results_0 ) + dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf_min1.zzzz ) ), grad_results_1 );
    final *= 2.3703703703703703703703703703704;		//	(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/cube(0.75)
    return final;
#endif

#else
    //
    //	improved noise.
    //	requires 1 random value per point.  Will run faster than classic noise if a slow hashing function is used
    //

    //	calculate the hash.
    //	( various hashing methods listed in order of speed )
    vec4 hash_lowz, hash_highz;
    FAST32_hash_3D( Pi, hash_lowz, hash_highz );
    //BBS_hash_3D( Pi, hash_lowz, hash_highz );
    //SGPP_hash_3D( Pi, hash_lowz, hash_highz );

    //
    //	"improved" noise using 8 corner gradients.  Faster than the 12 mid-edge point method.
    //	Ken mentions using diagonals like this can cause "clumping", but we'll live with that.
    //	[1,1,1]  [-1,1,1]  [1,-1,1]  [-1,-1,1]
    //	[1,1,-1] [-1,1,-1] [1,-1,-1] [-1,-1,-1]
    //
    hash_lowz -= 0.5;
    vec4 grad_results_0_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_lowz );
    hash_lowz = abs( hash_lowz ) - 0.25;
    vec4 grad_results_0_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_lowz );
    vec4 grad_results_0_2 = Pf.zzzz * sign( abs( hash_lowz ) - 0.125 );
    vec4 grad_results_0 = grad_results_0_0 + grad_results_0_1 + grad_results_0_2;

    hash_highz -= 0.5;
    vec4 grad_results_1_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_highz );
    hash_highz = abs( hash_highz ) - 0.25;
    vec4 grad_results_1_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_highz );
    vec4 grad_results_1_2 = Pf_min1.zzzz * sign( abs( hash_highz ) - 0.125 );
    vec4 grad_results_1 = grad_results_1_0 + grad_results_1_1 + grad_results_1_2;

    //	blend the gradients and return
    vec3 blend = Interpolation_C2( Pf );
    vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );
    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
    return dot( res0, blend2.zxzx * blend2.wwyy ) * (2.0 / 3.0);	//	(optionally) mult by (2.0/3.0) to scale to a strict -1.0->1.0 range
#endif
}

vec4 MOD_deform(mat4 instMat,vec4 pos)
{

    vec3 ppos=vec3(instMat[3][0]+MOD_scrollx,instMat[3][1]+MOD_scrolly,instMat[3][2]+MOD_scrollz);
    float p=Perlin3D(ppos)*MOD_strength;
    pos.x+=p;
    pos.y+=p;
    pos.z+=p;
    
    return pos;
}

