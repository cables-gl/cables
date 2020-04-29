
UNI sampler2D tex0;
UNI sampler2D tex1;
UNI sampler2D tex2;
UNI sampler2D tex3;
IN vec2 texCoord;
UNI vec4 color;
UNI vec2 texSize;

#ifdef BORDER
    UNI float borderWidth;
    UNI float borderSmooth;
#endif

#ifdef TEXTURE_COLOR
UNI sampler2D texMulColor;
#endif
#ifdef TEXTURE_MASK
UNI sampler2D texMulMask;
#endif

IN float texIndex;

#ifdef SHADOW
    UNI float shadowWidth;
#endif


float median(float r, float g, float b)
{
    return max(min(r, g), min(max(r, g), b));
}

void main()
{
    vec4 bgColor=vec4(0.0,0.0,0.0,0.0);
    vec4 fgColor=color;
    float opacity=1.0;

    #ifndef SDF
        outColor=texture(tex,texCoord);;
        return;
    #endif


    #ifdef TEXTURE_COLOR
        fgColor.rgb *= texture(texMulColor, vec2(0.0,0.0)).rgb; //todo texcoords from char positioning
    #endif
    #ifdef TEXTURE_MASK
        opacity *= texture(texMulMask, vec2(0.0,0.0)).r; //todo texcoords from char positioning
    #endif


    #ifdef SHADOW
        vec2 msdfUnit1 = texSize;
        vec2 tcv=vec2(texCoord.x-0.002,texCoord.y-0.002);
        vec3 smpl1;
        if(int(texIndex)==0) smpl1 = texture(tex0, tcv).rgb;
        if(int(texIndex)==1) smpl1 = texture(tex1, tcv).rgb;
        if(int(texIndex)==2) smpl1 = texture(tex2, tcv).rgb;
        if(int(texIndex)==3) smpl1 = texture(tex3, tcv).rgb;

        float sigDist1 = median(smpl1.r, smpl1.g, smpl1.b) - 0.001;
        float opacity1 = smoothstep(0.0,0.9,sigDist1*sigDist1);
        outColor = mix(bgColor, vec4(0.0,0.0,0.0,1.0), opacity1);
    #endif

    vec2 msdfUnit = 8.0/texSize;
    vec3 smpl;

    if(int(texIndex)==0) smpl = texture(tex0, texCoord).rgb;
    if(int(texIndex)==1) smpl = texture(tex1, texCoord).rgb;
    if(int(texIndex)==2) smpl = texture(tex2, texCoord).rgb;
    if(int(texIndex)==3) smpl = texture(tex3, texCoord).rgb;




    float sigDist = median(smpl.r, smpl.g, smpl.b) - 0.5;
    sigDist *= dot(msdfUnit, 0.5/fwidth(texCoord));
    opacity *= clamp(sigDist + 0.5, 0.0, 1.0);

    #ifdef BORDER
        float sigDist1 = median(smpl.r, smpl.g, smpl.b) - 0.01;
        float bw=borderWidth*0.6+0.24;
        float opacity1 = smoothstep(bw-borderSmooth,bw+borderSmooth,sigDist1*sigDist1);
        fgColor=mix(fgColor,vec4(0.0,0.0,0.0,1.0),1.0-opacity1);
    #endif


    outColor = mix(outColor, fgColor, opacity*color.a);

}











