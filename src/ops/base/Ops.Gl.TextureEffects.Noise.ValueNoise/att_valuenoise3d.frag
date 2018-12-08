
UNI float z;
UNI float x;
UNI float y;
UNI float scale;
UNI float amount;
IN vec2 texCoord;
UNI sampler2D tex;

{{BLENDCODE}}


//
//	Value Noise 3D
//	Return value range of 0.0->1.0
//	http://briansharpe.files.wordpress.com/2011/11/valuesample1.jpg
//

float Interpolation_C2( float x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }   //  6x^5-15x^4+10x^3	( Quintic Curve.  As used by Perlin in Improved Noise.  http://mrl.nyu.edu/~perlin/paper445.pdf )
vec2 Interpolation_C2( vec2 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec3 Interpolation_C2( vec3 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec4 Interpolation_C2( vec4 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
vec4 Interpolation_C2_InterpAndDeriv( vec2 x ) { return x.xyxy * x.xyxy * ( x.xyxy * ( x.xyxy * ( x.xyxy * vec2( 6.0, 0.0 ).xxyy + vec2( -15.0, 30.0 ).xxyy ) + vec2( 10.0, -60.0 ).xxyy ) + vec2( 0.0, 30.0 ).xxyy ); }
vec3 Interpolation_C2_Deriv( vec3 x ) { return x * x * (x * (x * 30.0 - 60.0) + 30.0); }


void FAST32_hash_3D( vec3 gridcell, out vec4 lowz_hash, out vec4 highz_hash )	//	generates a random number for each of the 8 cell corners
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const float SOMELARGEFLOAT = 635.298681;
    const float ZINC = 48.500388;

    //	truncate the domain
    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );

    //	calculate the noise
    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
    P *= P;
    P = P.xzxz * P.yyww;
    highz_hash.xy = vec2( 1.0 / ( SOMELARGEFLOAT + vec2( gridcell.z, gridcell_inc1.z ) * ZINC ) );
    lowz_hash = fract( P * highz_hash.xxxx );
    highz_hash = fract( P * highz_hash.yyyy );
}


float Value3D( vec3 P )
{
    //	establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;

    //	calculate the hash.
    //	( various hashing methods listed in order of speed )
    vec4 hash_lowz, hash_highz;
    FAST32_hash_3D( Pi, hash_lowz, hash_highz );
    //FAST32_2_hash_3D( Pi, hash_lowz, hash_highz );
    //BBS_hash_3D( Pi, hash_lowz, hash_highz );
    //SGPP_hash_3D( Pi, hash_lowz, hash_highz );

    //	blend the results and return
    vec3 blend = Interpolation_C2( Pf );
    vec4 res0 = mix( hash_lowz, hash_highz, blend.z );
    vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
    return dot( res0, blend2.zxzx * blend2.wwyy );
}

void main()
{
    vec4 base=texture2D(tex,texCoord);

   vec2 p=vec2(texCoord.x-0.5,texCoord.y-0.5);
   p=p*scale;

   p=vec2(p.x+0.5-x,p.y+0.5-y);

   float v=Value3D(vec3(p.x,p.y,z));
   vec4 col=vec4(v,v,v,1.0);

   col=vec4( _blend(base.rgb,col.rgb) ,1.0);
   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);

   outColor= col;
}
