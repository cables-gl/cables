
IN vec2 texCoord;
UNI sampler2D tex;
UNI float pixel;
UNI float onePixel;
UNI float amount;
UNI float lensDistort;

#ifdef MASK
UNI sampler2D texMask;
#endif

void main()
{

   vec4 col=texture(tex,texCoord);

   vec2 tc=texCoord;;
   float pix = pixel;
   if(lensDistort>0.0)
   {
       float dist = distance(texCoord, vec2(0.5,0.5));
       tc-=0.5;
       tc *=smoothstep(-0.9,1.0*lensDistort,1.0-dist);
       tc+=0.5;
   }

    #ifdef MASK
        vec4 m=texture(texMask,texCoord);
        pix*=m.r*m.a;
    #endif

    #ifdef SMOOTH
        float samples=round(pix/onePixel/4.0+1.0);
        col.r=0.0;
        col.b=0.0;
        // float b=0.0;
        for(float off=0.0;off<samples;off++)
        {
            float diff=(pix/samples)*off;
            col.r+=texture(tex,vec2(tc.x+diff,tc.y)).r/samples;
            col.b+=texture(tex,vec2(tc.x-diff,tc.y)).b/samples;
        }
    #endif

    #ifndef SMOOTH
        col.r=texture(tex,vec2(tc.x+pix,tc.y)).r;
        col.b=texture(tex,vec2(tc.x-pix,tc.y)).b;
    #endif

   outColor = col;

}
