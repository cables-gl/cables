//taken from
//https://www.shadertoy.com/view/lsXSWl
// user : dango

#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  uniform sampler2D tex;
#endif

uniform float time;
uniform float frequency;
uniform float strength;
uniform float blockSizeA;
uniform float blockSizeB;
uniform float blockSizeC;
uniform float blockSizeD;

float rng2(vec2 seed)
{
    return fract(sin(dot(seed * floor(time * (frequency * 10.0)), vec2(127.1,311.7))) * 43758.5453123);
    //return fract(sin(dot(seed * floor(time * 12.), vec2(127.1,311.7))) * 43758.5453123);
}

float rng(float seed)
{
    return rng2(vec2(seed, 1.0));
}


void main( )
{
	vec2 uv = texCoord;
	vec2 blockSizeS = vec2(blockSizeA,blockSizeB);
    vec2 blockSizeL = vec2(blockSizeC,blockSizeD);
    
    // vec2 blockS = floor(uv * vec2(24.0, 9.0));
    // vec2 blockL = floor(uv * vec2(8.0, 4.0));
    
    vec2 blockS = floor(uv * blockSizeS);
    vec2 blockL = floor(uv * blockSizeL);
    
    float r = rng2(uv);
    vec3 noise = (vec3(r, 1. - r, r / 2. + 0.5) * 1.0 - 2.0) * 0.08;
    
    float lineNoise = pow(rng2(blockS), 8.0) * pow(rng2(blockL), 3.0) - pow(rng(7.2341), 17.0) * 2.;
    

    vec4 col1 = texture(tex, uv);
    vec4 col2 = texture(tex, uv + vec2(lineNoise * (0.05 * strength)  * rng(5.0), 0));
    vec4 col3 = texture(tex, uv - vec2(lineNoise * (0.05 * strength) * rng(31.0), 0));
    
	gl_FragColor = vec4(vec3(col1.x, col2.y, col3.z) + noise, 1.0);
}