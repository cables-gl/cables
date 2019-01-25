UNI sampler2D tex;
IN vec2 texCoord;
UNI float levels;
UNI float amount;

{{CGL.BLENDMODES}}


void main(void)
{
    vec3 srcPixel = texture(tex, texCoord  ).rgb;
    vec3 amountPerLevel = vec3(1.0/levels);
    vec3 numOfLevels = floor(srcPixel/amountPerLevel);
    vec3 col = numOfLevels * (vec3(1.0) / (vec3(levels) - vec3(1.0)));


    vec4 base=texture(tex,texCoord);
    outColor= cgl_blend(base,vec4(col,1.0),amount);
}

