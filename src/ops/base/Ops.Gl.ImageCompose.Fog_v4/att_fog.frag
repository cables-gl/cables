IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texDepth;

#ifdef HAS_GRADIENT_TEX
    UNI sampler2D texGradient;
#endif

#ifdef HAS_BG_TEX
    UNI sampler2D texBg;
#endif

UNI float nearPlane;
UNI float farPlane;
UNI float inAmount;
UNI vec4 inFogColor;
UNI float inFogDensity;
UNI float inFogStart;
UNI float inFogEnd;

{{CGL.BLENDMODES3}}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float CalcFogDensity(float depth) {
    float fogAmount = 1.0 - clamp((inFogEnd - depth) / (inFogEnd - inFogStart), 0.0, 1.0);

    // float newDepth = map(depth, nearPlane, farPlane, 0., 1.);
    // EXPONENTIAL: fogAmount = 1. - exp(MAGIC_NUMBER * -inFogDensity * newDepth); // smoothstep(fogStart, fogEnd, newDepth));
    // EXP2: fogAmount = 1. - exp(-pow(MAGIC_NUMBER * inFogDensity * smoothstep(fogStart, fogEnd, newDepth), 2.0));

    fogAmount *= inFogDensity;



    return fogAmount;
}

void main()
{
    vec4 color = texture(tex, texCoord);

    float depthFromTexture = texture(texDepth,texCoord).r;

    float distanceToCamera_viewSpace = (nearPlane * farPlane) / (farPlane - depthFromTexture * (farPlane - nearPlane));

    float fogAmount = CalcFogDensity(distanceToCamera_viewSpace);

    vec4 fogColor = inFogColor;

    #ifdef HAS_GRADIENT_TEX
        vec4 fogColTex = texture(texGradient, vec2(clamp(distanceToCamera_viewSpace / (farPlane - nearPlane), 0.0, 0.9999),0.5));
        fogColor *= fogColTex;
    #endif

    #ifdef HAS_BG_TEX
        vec4 fogColTexBg = texture(texBg, texCoord);
        fogColor *= fogColTexBg;

    #endif

    fogColor = color * (1.0 - fogAmount) + fogColor * fogAmount;
    // fogColor = mix(color, fogColor, fogAmount);


    #ifdef IGNORE_INF
        if(depthFromTexture>0.99999) outColor=color;
        else outColor = cgl_blendPixel(color, fogColor, inAmount);
    #endif

    #ifndef IGNORE_INF
        outColor = cgl_blendPixel(color, fogColor, inAmount);
    #endif

}
