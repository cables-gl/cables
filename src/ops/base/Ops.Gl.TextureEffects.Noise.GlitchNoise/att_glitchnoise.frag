IN vec2 texCoord;
UNI sampler2D tex;

{{CGL.BLENDMODES}}

UNI float amount;
UNI float time;
UNI float frequency;
UNI float strength;
UNI float blockSizeA;
UNI float blockSizeB;
UNI float blockSizeC;
UNI float blockSizeD;
UNI float scrollX;
UNI float scrollY;
float rng2(vec2 seed)
{
    return fract(sin(dot(seed * floor(time * (frequency * 10.0)), vec2(127.1,311.7))) * 43758.5453123);
}

float rng(float seed)
{
    return rng2(vec2(seed, 1.0));
}

void main( )
{
    //add scroll for x and y
    vec2 scrollXY = vec2(scrollX,scrollY);
    vec2 blockS = floor((texCoord + scrollXY ) * vec2(blockSizeA,blockSizeB));
    vec2 blockL = floor((texCoord )  * vec2(blockSizeC,blockSizeD));

    float r = rng2(texCoord);
    vec3 noise = (vec3(r, 1. - r, r / 2. + 0.5) * 1.0 - 2.0) * 0.08;

    float lineNoise = pow(rng2(blockS), 8.0) * pow(rng2(blockL), 3.0) - pow(rng(7.2341), 17.0) * 2.;

    vec4 col1 = texture(tex, texCoord);
    vec4 col2 = texture(tex, texCoord + vec2(lineNoise * (0.05 * strength)  * rng(5.0), 1));
    vec4 col3 = texture(tex, texCoord - vec2(lineNoise * (0.05 * strength) * rng(31.0), 1));

    float glitch = (lineNoise * strength * rng(5.0)) + (lineNoise * strength * rng(31.));
    float glitch2 = lineNoise * strength * rng(31.);

    //blend section
    vec4 col=vec4(vec3(glitch),1.0);
    //original texture
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,col,amount);

}