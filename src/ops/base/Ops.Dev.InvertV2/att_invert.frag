IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texMask;
UNI float amount;

{{CGL.BLENDMODES3}}

void main()
{
    vec4 col=texture(tex,texCoord);

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


    vec3 m=vec3( INVR , INVG , INVB );
    vec4 invert = vec4(col.rgb-m,col.a);

    outColor=cgl_blendPixel(col,invert,amount);

    // outColor.rgb=m;
}
