
IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;

#ifdef MASK
    UNI sampler2D mask;
#endif

vec3 desaturate(vec3 color, float amount)
{
   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
   return vec3(mix(color, gray, amount));
}

void main()
{
    vec4 col=texture(tex,texCoord);

    float am=amount;
    #ifdef MASK
        am*=1.0-texture(mask,texCoord).r;
    #endif

    col.rgb=desaturate(col.rgb,am);
    outColor= col;
}