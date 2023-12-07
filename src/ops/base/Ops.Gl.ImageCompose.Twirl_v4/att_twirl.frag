IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float twistAmount;
UNI float times;
UNI float radius;
UNI float centerX;
UNI float centerY;
UNI float aspect;

{{CGL.BLENDMODES3}}

void main()
{
    vec2 center=vec2(centerX,centerY);
    center =((center+1.0)/2.0);
    vec2 tc = texCoord;
    tc -= center;

    float dist = length(vec2(tc.x,tc.y/aspect));
    if (dist < radius)
    {
        float percent = (radius - dist) / radius;
        float theta = percent * percent * twistAmount * 8.0;
        float s = sin(theta);
        float c = cos(theta);
        tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    }
    tc += center;

    vec4 col = texture(tex, tc);
    vec4 base=texture(tex,texCoord);
    outColor=cgl_blendPixel(base,col,amount);
}
