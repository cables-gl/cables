IN vec2 texCoord;

UNI sampler2D tex;
UNI sampler2D texInput;
UNI float parity;
UNI float inputAmount;

#ifdef MASK
    UNI sampler2D texMask;
#endif

#ifdef GROUP
    UNI sampler2D texGroup;
#endif

float getValue(vec3 color)
{
    #ifdef SORT_R
        return color.r;
    #endif
    #ifdef SORT_G
        return color.g;
    #endif
    #ifdef SORT_B
        return color.b;
    #endif
    #ifdef SORT_LUM
        return dot(vec3(0.2126, 0.7152, 0.0722), color);
    #endif
}

vec4 fetchPixel(ivec2 p)
{
    vec4 col = texelFetch(tex, p, 0);
    if (inputAmount > 0.0) col = mix(col, texelFetch(texInput, p, 0), inputAmount);
    return col;
}

vec2 pixelToUv(ivec2 p, ivec2 size)
{
    return (vec2(p) + 0.5) / vec2(size);
}

void main()
{
    ivec2 size = textureSize(tex, 0);
    ivec2 p = ivec2(gl_FragCoord.xy);

    ivec2 dir = ivec2(1, 0);
    int index = p.x;
    int lineLength = size.x;

    #ifdef STR_COLS
        dir = ivec2(0, 1);
        index = p.y;
        lineLength = size.y;
    #endif

    vec4 col = fetchPixel(p);
    outColor = col;

    bool isFirstOfPair = (index + int(parity)) % 2 == 0;
    ivec2 partner = p - dir;
    int partnerIndex = index - 1;
    if (isFirstOfPair)
    {
        partner = p + dir;
        partnerIndex = index + 1;
    }
    if (partnerIndex < 0 || partnerIndex >= lineLength) return;

    #ifdef MASK
        if (texture(texMask, pixelToUv(p, size)).r <= 0.0) return;
        if (texture(texMask, pixelToUv(partner, size)).r <= 0.0) return;
    #endif

    #ifdef GROUP
        if (texture(texGroup, pixelToUv(p, size)).r != texture(texGroup, pixelToUv(partner, size)).r) return;
    #endif

    vec4 other = fetchPixel(partner);
    float value = getValue(col.rgb);
    float otherValue = getValue(other.rgb);

    bool keepLarger = isFirstOfPair;
    #ifdef INVERT
        keepLarger = !keepLarger;
    #endif

    if (keepLarger && otherValue > value) outColor = other;
    if (!keepLarger && otherValue < value) outColor = other;
}
