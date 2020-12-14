IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texDepth;

#ifdef HAS_GRADIENT_TEX
    UNI sampler2D texGradient;
#endif

UNI float nearPlane;
UNI float farPlane;
UNI float inAmount;
UNI vec4 inFogColor;
UNI float inFogDensity;
UNI float inFogStart;
UNI float inFogEnd;

{{CGL.BLENDMODES}}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

float CalcFogDensity(float depth) {
    float fogAmount = 1.;

    float newDepth = map(depth, nearPlane, farPlane, 0., 1.);
    float fogStart = map(inFogStart, nearPlane, farPlane, 0., 1.);
    float fogEnd = map(inFogEnd, nearPlane, farPlane, 0., 1.);

    #ifdef FOG_MODE_DEFAULT
        float MAGIC_NUMBER = 0.9;

        fogAmount = clamp(pow(newDepth, 1. - MAGIC_NUMBER * inFogDensity), 0., 1.);

        // same as: if (newDepth < fogStart) fogAmount = 0.;
        fogAmount *= step(fogStart, newDepth);

        //if (newDepth > fogEnd) fogAmount = 1.;

         fogAmount *= inFogDensity;
    #endif

    #ifdef FOG_MODE_LINEAR
        float MAGIC_NUMBER = 1.5;
        MAGIC_NUMBER = 1.;

        fogAmount = 1.0-clamp( (inFogEnd-depth)/(inFogEnd-inFogStart), 0.0, 1.0);

        fogAmount *= step(fogStart, newDepth);
        fogAmount *= MAGIC_NUMBER * inFogDensity;

    #endif

    #ifdef FOG_MODE_EXP
        float MAGIC_NUMBER = 10.;
        // MAGIC_NUMBER = 1.;

        fogAmount = 1. - exp(MAGIC_NUMBER * -inFogDensity * newDepth);
        fogAmount *= step(fogStart, newDepth);
    #endif

    #ifdef FOG_MODE_EXP2
        float MAGIC_NUMBER = 10.;
        // MAGIC_NUMBER = 1.;

        fogAmount = 1.0-clamp(exp(-pow(MAGIC_NUMBER * inFogDensity*newDepth, 2.0)), 0.0, 1.0);
        fogAmount *= step(fogStart, newDepth);
    #endif


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


    fogColor = color * (1.0 - fogAmount) + fogColor * fogAmount;
//    fogColor = mix(color, fogColor, fogAmount);


    outColor = cgl_blend(color, fogColor, inAmount);

}