IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D tex1;
UNI sampler2D tex2;
UNI sampler2D tex3;
UNI sampler2D tex4;
UNI sampler2D tex5;
UNI sampler2D tex6;
UNI sampler2D tex7;
UNI sampler2D tex8;


UNI sampler2D texMask1;
UNI sampler2D texMask2;
UNI sampler2D texMask3;
UNI sampler2D texMask4;
UNI sampler2D texMask5;
UNI sampler2D texMask6;
UNI sampler2D texMask7;
UNI sampler2D texMask8;

UNI float amount1;
UNI float amount2;
UNI float amount3;
UNI float amount4;
UNI float amount5;
UNI float amount6;
UNI float amount7;
UNI float amount8;

{{BLENDCODE}}

void main()
{
    vec4 col=texture(tex,texCoord);


    #ifdef USE_TEX_1
        vec4 col1=texture(tex1,texCoord);
        col=cgl_blend1(col,col1,amount1);
    #endif
    #ifdef USE_TEX_2
        vec4 col2=texture(tex2,texCoord);
        col=cgl_blend2(col,col2,amount2);
    #endif
    #ifdef USE_TEX_3
        vec4 col3=texture(tex3,texCoord);
        col=cgl_blend3(col,col3,amount3);
    #endif
    #ifdef USE_TEX_4
        vec4 col4=texture(tex4,texCoord);
        col=cgl_blend4(col,col4,amount4);
    #endif
    #ifdef USE_TEX_5
        vec4 col5=texture(tex5,texCoord);
        col=cgl_blend5(col,col5,amount5);
    #endif
    #ifdef USE_TEX_6
        vec4 col6=texture(tex6,texCoord);
        col=cgl_blend6(col,col6,amount6);
    #endif
    #ifdef USE_TEX_7
        vec4 col7=texture(tex7,texCoord);
        col=cgl_blend7(col,col7,amount7);
    #endif
    #ifdef USE_TEX_8
        vec4 col8=texture(tex8,texCoord);
        col=cgl_blend8(col,col8,amount8);
    #endif

    outColor=col;

}
