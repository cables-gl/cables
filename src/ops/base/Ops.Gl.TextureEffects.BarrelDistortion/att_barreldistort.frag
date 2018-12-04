IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;

// adapted from https://www.shadertoy.com/view/MlSXR3


vec2 brownConradyDistortion(vec2 uv)
{
// positive values of K1 give barrel distortion, negative give pincushion
    float barrelDistortion1 = 0.15-amount; // K1 in text books
    float barrelDistortion2 = 0.0-amount; // K2 in text books
    float r2 = uv.x*uv.x + uv.y*uv.y;
    uv *= 1.0 + barrelDistortion1 * r2 + barrelDistortion2 * r2 * r2;

    // tangential distortion (due to off center lens elements)
    // is not modeled in this function, but if it was, the terms would go here
    return uv;
}

void main()
{
   vec2 tc=brownConradyDistortion(texCoord-0.5)+0.5;
   vec4 col=texture(tex,tc);
   outColor= col;
}