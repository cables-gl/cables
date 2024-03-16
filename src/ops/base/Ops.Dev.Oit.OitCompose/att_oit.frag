IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texReveal;
UNI sampler2D texAccum;


{{CGL.BLENDMODES3}}

void main()
{
    // vec4 col=texture(tex,texCoord);
    vec4 colReveal=texture(texReveal,texCoord);
    vec4 accum=texture(texAccum,texCoord);


    float a = 1.0 - accum.a;
    accum.a = colReveal.r;

    vec4 col=vec4(a * accum.rgb / clamp(accum.a, 0.001, 50000.0), a);


    outColor=col;
}

