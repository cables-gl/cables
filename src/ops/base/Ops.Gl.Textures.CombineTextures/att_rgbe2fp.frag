UNI sampler2D texR;
UNI sampler2D texG;
UNI sampler2D texB;
UNI sampler2D texA;
IN vec2 texCoord;

UNI float defaultR;
UNI float defaultG;
UNI float defaultB;
UNI float defaultA;

void main()
{
    float r=defaultR, g=defaultG, b=defaultB, a=defaultA;

    #ifdef HAS_R
        #ifdef R_SRC_R
            r=texture(texR,texCoord).r;
        #endif
        #ifdef R_SRC_G
            r=texture(texR,texCoord).g;
        #endif
        #ifdef R_SRC_B
            r=texture(texR,texCoord).b;
        #endif
        #ifdef R_SRC_A
            r=texture(texR,texCoord).a;
        #endif
    #endif

    #ifdef HAS_G
        #ifdef G_SRC_R
            g=texture(texG,texCoord).r;
        #endif
        #ifdef G_SRC_G
            g=texture(texG,texCoord).g;
        #endif
        #ifdef G_SRC_B
            g=texture(texG,texCoord).b;
        #endif
        #ifdef G_SRC_A
            g=texture(texG,texCoord).a;
        #endif
    #endif

    #ifdef HAS_B
        #ifdef B_SRC_R
            b=texture(texB,texCoord).r;
        #endif
        #ifdef B_SRC_G
            b=texture(texB,texCoord).g;
        #endif
        #ifdef B_SRC_B
            b=texture(texB,texCoord).b;
        #endif
        #ifdef B_SRC_A
            b=texture(texB,texCoord).a;
        #endif
    #endif

    #ifdef HAS_A
        #ifdef A_SRC_R
            a=texture(texA,texCoord).r;
        #endif
        #ifdef A_SRC_G
            a=texture(texA,texCoord).g;
        #endif
        #ifdef A_SRC_B
            a=texture(texA,texCoord).b;
        #endif
        #ifdef A_SRC_A
            a=texture(texA,texCoord).a;
        #endif
    #endif

    #ifdef INV_R
        r=1.0-r;
    #endif
    #ifdef INV_G
        g=1.0-g;
    #endif
    #ifdef INV_B
        b=1.0-b;
    #endif
    #ifdef INV_A
        a=1.0-a;
    #endif


    outColor = vec4(r,g,b,a);
}


