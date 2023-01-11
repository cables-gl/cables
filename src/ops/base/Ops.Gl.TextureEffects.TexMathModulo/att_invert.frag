IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texMask;
UNI float amount;
UNI float modulo;

{{CGL.BLENDMODES}}

void main()
{
   vec4 col=vec4(1.0);
   col=texture(tex,texCoord);

    #ifdef USE_MASK
        #ifdef MASK_INVERT
            if(texture(texMask,texCoord).r>0.5)
            {
                outColor= col;
                return;
            }
        #endif

        #ifndef MASK_INVERT
            if(texture(texMask,texCoord).r<0.5)
            {
                outColor= col;
                return;
            }
        #endif
    #endif

   vec4 invert = vec4(mod(col.rgb,modulo),1.0);

   outColor=cgl_blend(col,invert,amount);
}
