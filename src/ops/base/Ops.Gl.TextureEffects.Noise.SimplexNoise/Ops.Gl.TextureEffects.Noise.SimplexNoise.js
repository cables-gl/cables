op.name='SimplexNoise';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var smoothness=op.addInPort(new Port(op,"smoothness",OP_PORT_TYPE_VALUE,{  }));
var scale=op.addInPort(new Port(op,"scale",OP_PORT_TYPE_VALUE,{  }));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var x=op.addInPort(new Port(op,"x",OP_PORT_TYPE_VALUE,{  }));
var y=op.addInPort(new Port(op,"y",OP_PORT_TYPE_VALUE,{  }));
var time=op.addInPort(new Port(op,"time",OP_PORT_TYPE_VALUE,{  }));

var cgl=op.patch.cgl;

time.set(0.314);
smoothness.set(1.0);
scale.set(1.0);
x.set(0);
y.set(0);

var shader=new CGL.Shader(cgl);

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'IN vec2 texCoord;'
    .endl()+'uniform sampler2D tex;'
    .endl()+'uniform float smoothness;'
    .endl()+'uniform float scale;'
    .endl()+'uniform float seed;'
    .endl()+'uniform float x;'
    .endl()+'uniform float y;'
    .endl()+'uniform float time;'
    .endl()+''


.endl()+'void FAST32_hash_3D(    vec3 gridcell,'
.endl()+'                        vec3 v1_mask,       //  user definable v1 and v2.  ( 0s and 1s )'
.endl()+'                        vec3 v2_mask,'
.endl()+'                        out vec4 hash_0,'
.endl()+'                        out vec4 hash_1,'
.endl()+'                        out vec4 hash_2 )       //  generates 3 random numbers for each of the 4 3D cell corners.  cell  corners:  v0=0,0,0  v3=1,1,1  the other two are user definable'
.endl()+'{'
.endl()+'    //    gridcell is assumed to be an integer coordinate'
.endl()+''
.endl()+'    //  TODO:   these constants need tweaked to find the best possible noise.'
.endl()+'    //          probably requires some kind of brute force computational searching or something....'
.endl()+'    const vec2 OFFSET = vec2( 50.0, 161.0 );'
.endl()+'    const float DOMAIN = 69.0;'
.endl()+'    const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );'
.endl()+'    const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );'
.endl()+''
.endl()+'    //  truncate the domain'
.endl()+'    gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;'
.endl()+'    vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );'
.endl()+''
.endl()+'    //  compute x*x*y*y for the 4 corners'
.endl()+'    vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;'
.endl()+'    P *= P;'
.endl()+'    vec4 V1xy_V2xy = mix( P.xyxy, P.zwzw, vec4( v1_mask.xy, v2_mask.xy ) );     //  appl y mask for v1 and v2'
.endl()+'    P = vec4( P.x, V1xy_V2xy.xz, P.z ) * vec4( P.y, V1xy_V2xy.yw, P.w );'
.endl()+''
.endl()+'    //  get the lowz and highz mods'
.endl()+'    vec3 lowz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );'
.endl()+'    vec3 highz_mods = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );'
.endl()+''
.endl()+'    //  appl mask for v1 and v2 mod values'
.endl()+'    v1_mask = ( v1_mask.z < 0.5 ) ? lowz_mods : highz_mods;'
.endl()+'    v2_mask = ( v2_mask.z < 0.5 ) ? lowz_mods : highz_mods;'
.endl()+''
.endl()+'    //  compute the final hash'
.endl()+'    hash_0 = fract( P * vec4( lowz_mods.x, v1_mask.x, v2_mask.x, highz_mods.x ) );'
.endl()+'    hash_1 = fract( P * vec4( lowz_mods.y, v1_mask.y, v2_mask.y, highz_mods.y ) );'
.endl()+'    hash_2 = fract( P * vec4( lowz_mods.z, v1_mask.z, v2_mask.z, highz_mods.z ) );'
.endl()+'}'

.endl()+''
.endl()+'//'
.endl()+'//  Given an arbitrary 3D point this calculates the 4 vectors from the corners of the simplex pyramid to the point'
.endl()+'//  It also returns the integer grid index information for the corners'
.endl()+'//'
.endl()+'void Simplex3D_GetCornerVectors(    vec3 P,                 //  input point'
.endl()+'                                    out vec3 Pi,            //  integer grid index for the origin'
.endl()+'                                    out vec3 Pi_1,          //  offsets for the 2nd and 3rd corners.  ( the 4th = Pi + 1.0 )'
.endl()+'                                    out vec3 Pi_2,'
.endl()+'                                    out vec4 v1234_x,       //  vectors from the 4 corners to the intput point'
.endl()+'                                    out vec4 v1234_y,'
.endl()+'                                    out vec4 v1234_z )'
.endl()+'{'
.endl()+'    //'
.endl()+'    //  Simplex math from Stefan Gustavsons and Ian McEwans work at...'
.endl()+'    //  http://github.com/ashima/webgl-noise'
.endl()+'    //'
.endl()+''
.endl()+'    //  simplex math constants'
.endl()+'    const float SKEWFACTOR = 1.0/3.0;'
.endl()+'    const float UNSKEWFACTOR = 1.0/6.0;'
.endl()+'    const float SIMPLEX_CORNER_POS = 0.5;'
.endl()+'    const float SIMPLEX_PYRAMID_HEIGHT = 0.70710678118654752440084436210485;    // sqrt( 0.5 )  height of simplex pyramid.'
.endl()+''
.endl()+'    P *= SIMPLEX_PYRAMID_HEIGHT;        // scale space so we can have an approx feature size of 1.0  ( optional )'
.endl()+''
.endl()+'    //  Find the vectors to the corners of our simplex pyramid'
.endl()+'    Pi = floor( P + dot( P, vec3( SKEWFACTOR) ) );'
.endl()+'    vec3 x0 = P - Pi + dot(Pi, vec3( UNSKEWFACTOR ) );'
.endl()+'    vec3 g = step(x0.yzx, x0.xyz);'
.endl()+'    vec3 l = 1.0 - g;'
.endl()+'    Pi_1 = min( g.xyz, l.zxy );'
.endl()+'    Pi_2 = max( g.xyz, l.zxy );'
.endl()+'    vec3 x1 = x0 - Pi_1 + UNSKEWFACTOR;'
.endl()+'    vec3 x2 = x0 - Pi_2 + SKEWFACTOR;'
.endl()+'    vec3 x3 = x0 - SIMPLEX_CORNER_POS;'
.endl()+''
.endl()+'    //  pack them into a parallel-friendly arrangement'
.endl()+'    v1234_x = vec4( x0.x, x1.x, x2.x, x3.x );'
.endl()+'    v1234_y = vec4( x0.y, x1.y, x2.y, x3.y );'
.endl()+'    v1234_z = vec4( x0.z, x1.z, x2.z, x3.z );'
.endl()+'}'
.endl()+''
.endl()+'//'
.endl()+'//  Calculate the weights for the 3D simplex surflet'
.endl()+'//'
.endl()+'vec4 Simplex3D_GetSurfletWeights(   vec4 v1234_x,'
.endl()+'                                    vec4 v1234_y,'
.endl()+'                                    vec4 v1234_z )'
.endl()+'{'
.endl()+'    //  perlins original implementation uses the surlet falloff formula of (0.6-x*x)^4.'
.endl()+'    //  This is buggy as it can cause discontinuities along simplex faces.  (0.5-x*x)^3 solves this and gives an almost identical curve'
.endl()+''
.endl()+'    //  evaluate surflet. f(x)=(0.5-x*x)^3'
.endl()+'    vec4 surflet_weights = v1234_x * v1234_x + v1234_y * v1234_y + v1234_z * v1234_z;'
.endl()+'    surflet_weights = max(0.5 - surflet_weights, 0.0);      //  0.5 here represents the closest distance (squared) of any simplex pyramid corner to any of its planes.  ie, SIMPLEX_PYRAMID_HEIGHT^2'
.endl()+'    return surflet_weights*surflet_weights*surflet_weights;'
.endl()+'}'
.endl()+''
.endl()+''
.endl()+''
.endl()+'//'
.endl()+'//  SimplexPerlin3D  ( simplex gradient noise )'
.endl()+'//  Perlin noise over a simplex (tetrahedron) grid'
.endl()+'//  Return value range of -1.0->1.0'
.endl()+'//  http://briansharpe.files.wordpress.com/2012/01/simplexperlinsample.jpg'
.endl()+'//'
.endl()+'//  Implementation originally based off Stefan Gustavsons and Ian McEwans work at...'
.endl()+'//  http://github.com/ashima/webgl-noise'
.endl()+'//'
.endl()+'float SimplexPerlin3D(vec3 P)'
.endl()+'{'
.endl()+'    //  calculate the simplex vector and index math'
.endl()+'    vec3 Pi;'
.endl()+'    vec3 Pi_1;'
.endl()+'    vec3 Pi_2;'
.endl()+'    vec4 v1234_x;'
.endl()+'    vec4 v1234_y;'
.endl()+'    vec4 v1234_z;'
.endl()+'    Simplex3D_GetCornerVectors( P, Pi, Pi_1, Pi_2, v1234_x, v1234_y, v1234_z );'
.endl()+''
.endl()+'    //  generate the random vectors'
.endl()+'    //  ( various hashing methods listed in order of speed )'
.endl()+'    vec4 hash_0;'
.endl()+'    vec4 hash_1;'
.endl()+'    vec4 hash_2;'
.endl()+'    FAST32_hash_3D( Pi, Pi_1, Pi_2, hash_0, hash_1, hash_2 );'
.endl()+'    //SGPP_hash_3D( Pi, Pi_1, Pi_2, hash_0, hash_1, hash_2 );'
.endl()+'    hash_0 -= 0.49999;'
.endl()+'    hash_1 -= 0.49999;'
.endl()+'    hash_2 -= 0.49999;'
.endl()+''
.endl()+'    //  evaluate gradients'
.endl()+'    vec4 grad_results = inversesqrt( hash_0 * hash_0 + hash_1 * hash_1 + hash_2 * hash_2 ) * ( hash_0 * v1234_x + hash_1 * v1234_y + hash_2 * v1234_z );'
.endl()+''
.endl()+'    //  Normalization factor to scale the final result to a strict 1.0->-1.0 range'
.endl()+'    //  x = sqrt( 0.75 ) * 0.5'
.endl()+'    //  NF = 1.0 / ( x * ( ( 0.5 * x*x ) ^ 3 ) * 2.0 )'
.endl()+'    //  http://briansharpe.wordpress.com/2012/01/13/simplex-noise/#comment-36'
.endl()+'     float FINAL_NORMALIZATION = 37.837227241611314102871574478976*smoothness;'
.endl()+''
.endl()+'    //  sum with the surflet and return'
.endl()+'    return dot( Simplex3D_GetSurfletWeights( v1234_x, v1234_y, v1234_z ), grad_results ) * FINAL_NORMALIZATION;'
.endl()+'}'


    .endl()+'void main()'
    .endl()+'{'
    
    .endl()+'   vec2 p=vec2(texCoord.x-0.5,texCoord.y-0.5);'
    .endl()+'   p=p*scale;'

    .endl()+'   p=vec2(p.x+0.5-x,p.y+0.5-y);'
    
    .endl()+'   float v=SimplexPerlin3D(vec3(p.x,p.y,time))*0.5+0.5;'
    .endl()+'   vec4 col=vec4(v,v,v,1.0);'
    .endl()+'   gl_FragColor = col;'
    .endl()+'}';

shader.setSource(shader.getDefaultVertexShader(),srcFrag);
var textureUniform=new CGL.Uniform(shader,'t','tex',0);

var uniSmoothness=new CGL.Uniform(shader,'f','smoothness',smoothness.get());
var uniScale=new CGL.Uniform(shader,'f','scale',scale.get());
var uniX=new CGL.Uniform(shader,'f','x',x.get());
var uniY=new CGL.Uniform(shader,'f','y',y.get());
var uniTime=new CGL.Uniform(shader,'f','time',time.get());

x.onValueChanged=function() { uniX.setValue(x.get()/100); };
y.onValueChanged=function(){ uniY.setValue(y.get()/100); };
time.onValueChanged=function(){ uniTime.setValue(time.get()/100); };

smoothness.onValueChanged=function(){ uniSmoothness.setValue(smoothness.get());};
scale.onValueChanged=function(){ uniScale.setValue(scale.get()); };

render.onTriggered=function()
{
    if(!cgl.currentTextureEffect)return;

    cgl.setShader(shader);
    cgl.currentTextureEffect.bind();

    cgl.gl.activeTexture(cgl.gl.TEXTURE0);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, cgl.currentTextureEffect.getCurrentSourceTexture().tex );

    cgl.currentTextureEffect.finish();
    cgl.setPreviousShader();

    trigger.trigger();
};
