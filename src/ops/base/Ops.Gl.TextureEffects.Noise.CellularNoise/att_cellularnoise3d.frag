UNI float z;
UNI float x;
UNI float y;
UNI float scale;
IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;

{{CGL.BLENDMODES}}

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




vec4 Cellular_weight_samples( vec4 samples )
{
    samples = samples * 2.0 - 1.0;
    //return (1.0 - samples * samples) * sign(samples);	// square
    return (samples * samples * samples) - sign(samples);	// cubic (even more variance)
}


//
//	Cellular Noise 3D
//	Based off Stefan Gustavson's work at http://www.itn.liu.se/~stegu/GLSL-cellular
//	http://briansharpe.files.wordpress.com/2011/12/cellularsample.jpg
//
//	Speed up by using 2x2x2 search window instead of 3x3x3
//	produces range of 0.0->1.0
//
float Cellular3D(vec3 P)
{
    //	establish our grid cell and unit position
    vec3 Pi = floor(P);
    vec3 Pf = P - Pi;

    //	calculate the hash.
    //	( various hashing methods listed in order of speed )
    vec4 hash_x0, hash_y0, hash_z0, hash_x1, hash_y1, hash_z1;
    FAST32_hash_3D( Pi, hash_x0, hash_y0, hash_z0, hash_x1, hash_y1, hash_z1 );
    //SGPP_hash_3D( Pi, hash_x0, hash_y0, hash_z0, hash_x1, hash_y1, hash_z1 );

    //	generate the 8 random points
#if 1
    //	restrict the random point offset to eliminate artifacts
    //	we'll improve the variance of the noise by pushing the points to the extremes of the jitter window
    const float JITTER_WINDOW = 0.166666666;	// 0.166666666 will guarentee no artifacts. It is the intersection on x of graphs f(x)=( (0.5 + (0.5-x))^2 + 2*((0.5-x)^2) ) and f(x)=( 2 * (( 0.5 + x )^2) + x * x )
    hash_x0 = Cellular_weight_samples( hash_x0 ) * JITTER_WINDOW + vec4(0.0, 1.0, 0.0, 1.0);
    hash_y0 = Cellular_weight_samples( hash_y0 ) * JITTER_WINDOW + vec4(0.0, 0.0, 1.0, 1.0);
    hash_x1 = Cellular_weight_samples( hash_x1 ) * JITTER_WINDOW + vec4(0.0, 1.0, 0.0, 1.0);
    hash_y1 = Cellular_weight_samples( hash_y1 ) * JITTER_WINDOW + vec4(0.0, 0.0, 1.0, 1.0);
    hash_z0 = Cellular_weight_samples( hash_z0 ) * JITTER_WINDOW + vec4(0.0, 0.0, 0.0, 0.0);
    hash_z1 = Cellular_weight_samples( hash_z1 ) * JITTER_WINDOW + vec4(1.0, 1.0, 1.0, 1.0);
#else
    //	non-weighted jitter window.  jitter window of 0.4 will give results similar to Stefans original implementation
    //	nicer looking, faster, but has minor artifacts.  ( discontinuities in signal )
    const float JITTER_WINDOW = 0.4;
    hash_x0 = hash_x0 * JITTER_WINDOW * 2.0 + vec4(-JITTER_WINDOW, 1.0-JITTER_WINDOW, -JITTER_WINDOW, 1.0-JITTER_WINDOW);
    hash_y0 = hash_y0 * JITTER_WINDOW * 2.0 + vec4(-JITTER_WINDOW, -JITTER_WINDOW, 1.0-JITTER_WINDOW, 1.0-JITTER_WINDOW);
    hash_x1 = hash_x1 * JITTER_WINDOW * 2.0 + vec4(-JITTER_WINDOW, 1.0-JITTER_WINDOW, -JITTER_WINDOW, 1.0-JITTER_WINDOW);
    hash_y1 = hash_y1 * JITTER_WINDOW * 2.0 + vec4(-JITTER_WINDOW, -JITTER_WINDOW, 1.0-JITTER_WINDOW, 1.0-JITTER_WINDOW);
    hash_z0 = hash_z0 * JITTER_WINDOW * 2.0 + vec4(-JITTER_WINDOW, -JITTER_WINDOW, -JITTER_WINDOW, -JITTER_WINDOW);
    hash_z1 = hash_z1 * JITTER_WINDOW * 2.0 + vec4(1.0-JITTER_WINDOW, 1.0-JITTER_WINDOW, 1.0-JITTER_WINDOW, 1.0-JITTER_WINDOW);
#endif

    //	return the closest squared distance
    vec4 dx1 = Pf.xxxx - hash_x0;
    vec4 dy1 = Pf.yyyy - hash_y0;
    vec4 dz1 = Pf.zzzz - hash_z0;
    vec4 dx2 = Pf.xxxx - hash_x1;
    vec4 dy2 = Pf.yyyy - hash_y1;
    vec4 dz2 = Pf.zzzz - hash_z1;
    vec4 d1 = dx1 * dx1 + dy1 * dy1 + dz1 * dz1;
    vec4 d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;
    d1 = min(d1, d2);
    d1.xy = min(d1.xy, d1.wz);
    return min(d1.x, d1.y) * ( 9.0 / 12.0 );	//	scale return value from 0.0->1.333333 to 0.0->1.0  	(2/3)^2 * 3  == (12/9) == 1.333333
}


void main()
{


    vec2 p=vec2(texCoord.x-0.5,texCoord.y-0.5);

    #ifdef DO_TILEABLE
        p=abs(texCoord-0.5);
    #endif

    p=p*scale;

    p=vec2(p.x+0.5-x,p.y+0.5-y);

    float v=Cellular3D(vec3(p.x,p.y,z));

       //blend section
    vec4 col=vec4(v,v,v,1.0);
    //original texture
    vec4 base=texture(tex,texCoord);


    outColor=cgl_blend(base,col,amount);

}
