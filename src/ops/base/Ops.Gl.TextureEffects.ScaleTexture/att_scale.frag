IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D multiplierTex;
UNI float amount;
UNI float uScaleX,uScaleY;
UNI float offsetX,offsetY;
UNI float centerX,centerY;

{{CGL.BLENDMODES}}

void main()
{
    float multiplier = 0.0;
    vec2 uv = texCoord;

    #ifdef MASK_SCALE
        multiplier = dot(vec3(0.2126,0.7152,0.0722), texture(multiplierTex,texCoord).rgb);
    #endif

    uv.x = (uv.x - centerX) / (uScaleX * multiplier)  + centerX+offsetX ;
    uv.y = (uv.y - centerY) / (uScaleY * multiplier)  + centerY+offsetY ;

    //blend section
    vec4 col = texture(tex,uv);
    //original texture
    vec4 base = texture(tex,texCoord);

    //blend stuff

    outColor=cgl_blend(base,col,amount);
}
