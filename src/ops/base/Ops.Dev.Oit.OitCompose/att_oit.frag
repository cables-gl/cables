IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texReveal;
UNI sampler2D texAccum;
UNI float amount;


{{CGL.BLENDMODES3}}

void main()
{
    ivec2 fragCoord = ivec2(gl_FragCoord.xy);

    vec4 tex=texelFetch(tex,fragCoord,0);
    vec4 colReveal=texelFetch(texReveal,fragCoord,0);
    vec4 accum=texelFetch(texAccum,fragCoord,0);


    float a = 1.0 - accum.a;
    accum.a = colReveal.r;

    vec4 col=vec4(a * accum.rgb / clamp(accum.a, 0.001, 50000.0), a);


    // col=mix(col,tex,1.0-a);

    // col.a=1.0-col.a;

    // col=tex+col;
    // col.a=1.0;
    float am=amount;

    // outColor=col;

    outColor=cgl_blendPixel(tex,col,am);

}

