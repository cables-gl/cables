#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D tex;
#endif

UNI float amount;
UNI float radius_low;
UNI float radius_high;
UNI float X;
UNI float Y;
UNI float Z;
UNI float scale;
    


{{BLENDCODE}}

float random(vec2 co)
{
   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (437511.5453));
}


//
//	Falloff defined in XSquared
//	( smoothly decrease from 1.0 to 0.0 as xsq increases from 0.0 to 1.0 )
//	http://briansharpe.wordpress.com/2011/11/14/two-useful-interpolation-functions-for-noise-development/
//
float Falloff_Xsq_C1( float xsq ) { xsq = 1.0 - xsq; return xsq*xsq; }	// ( 1.0 - x*x )^2   ( Used by Humus for lighting falloff in Just Cause 2.  GPUPro 1 )
float Falloff_Xsq_C2( float xsq ) { xsq = 1.0 - xsq; return xsq*xsq*xsq; }	// ( 1.0 - x*x )^3.   NOTE: 2nd derivative is 0.0 at x=1.0, but non-zero at x=0.0
vec4 Falloff_Xsq_C2( vec4 xsq ) { xsq = 1.0 - xsq; return xsq*xsq*xsq; }


vec4 FAST32_hash_3D_Cell( vec3 gridcell )	//	generates 4 different random numbers for the single given cell point
{
    //    gridcell is assumed to be an integer coordinate

    //	TODO: 	these constants need tweaked to find the best possible noise.
    //			probably requires some kind of brute force computational searching or something....
    const vec2 OFFSET = vec2( 50.0, 161.0 );
    const float DOMAIN = 69.0;
    const vec4 SOMELARGEFLOATS = vec4( 635.298681, 682.357502, 668.926525, 588.255119 );
    const vec4 ZINC = vec4( 48.500388, 65.294118, 63.934599, 63.279683 );

    //	truncate the domain
    gridcell.xyz = gridcell - floor(gridcell * ( 1.0 / DOMAIN )) * DOMAIN;
    gridcell.xy += OFFSET.xy;
    gridcell.xy *= gridcell.xy;
    return fract( ( gridcell.x * gridcell.y ) * ( 1.0 / ( SOMELARGEFLOATS + gridcell.zzzz * ZINC ) ) );
}


//	PolkaDot Noise 3D
//	http://briansharpe.files.wordpress.com/2011/12/polkadotsample.jpg
//	http://briansharpe.files.wordpress.com/2012/01/polkaboxsample.jpg
//	TODO, these images have random intensity and random radius.  This noise now has intensity as proportion to radius.  Images need updated.  TODO
//
//	Generates a noise of smooth falloff polka dots.
//	Allow for control on radius.  Intensity is proportional to radius
//	Return value range of 0.0->1.0
//
float PolkaDot3D( 	vec3 P,
                    float radius_low,		//	radius range is 0.0->1.0
                    float radius_high	)
{
    //	establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;



    //	calculate the hash.
    vec4 hash = FAST32_hash_3D_Cell( Pi );

    //	user variables
    float RADIUS = max( 0.0, radius_low + hash.w * ( radius_high - radius_low ) );
    float VALUE = RADIUS / max( radius_high, radius_low );	//	new keep value in proportion to radius.  Behaves better when used for bumpmapping, distortion and displacement

    //	calc the noise and return
    RADIUS = 2.0/RADIUS;
    Pf *= RADIUS;
    Pf -= ( RADIUS - 1.0 );
    Pf += hash.xyz * ( RADIUS - 2.0 );
    //Pf *= Pf;		//	this gives us a cool box looking effect
    return Falloff_Xsq_C2( min( dot( Pf, Pf ), 1.0 ) ) * VALUE;
}



void main()
{
    vec3 pos=vec3(texCoord.x+X,texCoord.y+Y,0);
    vec3 opos=vec3(texCoord.x+X,texCoord.y+Y,0);
    // pos.xy-=vec2(0.5,0.5);
    pos.xy*=scale;
    // pos.xy+=vec2(0.5,0.5);

    vec3 Pi = floor(pos);
    vec4 hash = FAST32_hash_3D_Cell( Pi );
    pos.z=Z+random(hash.zz);
    
    



    vec4 rnd=vec4(PolkaDot3D(pos,radius_low,radius_high));
    rnd.a=1.0;

    vec4 base=texture2D(tex,texCoord);
    
    vec4 col=vec4( _blend(base.rgb,rnd.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    
gl_FragColor = col;
}