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

float CalcFogDensity(float depth) {
    float fogAmount = 1.;

    #ifdef FOG_MODE_DEFAULT
        fogAmount = pow(depth, inFogDensity);
        fogAmount = smoothstep(inFogStart, inFogEnd, fogAmount);
    #endif

    #ifdef FOG_MODE_LINEAR
        fogAmount = (inFogEnd - depth) / (inFogEnd - inFogStart);
    #endif

    #ifdef FOG_MODE_EXP
        fogAmount = exp(-inFogDensity * depth);
    #endif

    #ifdef FOG_MODE_EXP2
        fogAmount = exp(-pow(inFogDensity * depth, 2.0));
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
    // fogColor = mix(fogColor, color, 1.0 - fogAmount);

    if(distanceToCamera_viewSpace > inFogStart) outColor = cgl_blend(color, fogColor, inAmount);

    else outColor = color;
}