IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D gradient;
UNI float pos;
UNI float amount;
UNI float vmin;
UNI float vmax;

{{CGL.BLENDMODES}}


float lumi(vec3 color)
{
   return vec3(dot(vec3(0.2126,0.7152,0.0722), color)).r;
}

void main()
{
    vec4 base=texture(tex,texCoord);

   base=clamp(base,vmin,vmax);

    #ifdef METH_LUMI
        vec4 color=texture(gradient,vec2(lumi(base.rgb),pos));
    #endif

    #ifdef METH_CHANNELS
        vec4 color=vec4(1.0);
        color.r=texture(gradient,vec2(base.r,pos)).r;
        color.g=texture(gradient,vec2(base.g,pos)).g;
        color.b=texture(gradient,vec2(base.b,pos)).b;
    #endif

//   outColor= vec4(color);
   outColor=cgl_blend(base,color,amount);

}
