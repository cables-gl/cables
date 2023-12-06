
IN vec2 texCoord;
UNI sampler2D tex;
UNI vec2 pixel;
UNI float strength;
UNI float sstep;

float lum(vec3 c)
{
    return dot(vec3(0.2126,0.7152,0.0722),c);
}

void main()
{
    vec4 a,b;
    // vec4 px=texture(tex, texCoord);
    vec4 pxl=texture(tex, texCoord + vec2(-sstep*pixel.x, 0.0));
    vec4 pxr=texture(tex, texCoord + vec2( sstep*pixel.x, 0.0));
    vec4 pxt=texture(tex, texCoord + vec2(0.0, -sstep*pixel.y));
    vec4 pxb=texture(tex, texCoord + vec2(0.0,  sstep*pixel.y));

    vec4 col=vec4(0.5);

    #ifdef DIR_R_HORIZONTAL
        a=pxl;
        b=pxr;
    #endif
    #ifndef DIR_R_HORIZONTAL // VERTICAL
        a=pxt;
        b=pxb;
    #endif
    #ifdef FLIP_R
        vec4 c=a;
        a=b;
        b=c;
    #endif
    #ifdef METH_R_DIFF
        #ifdef METH_R_R
            col.r+=(b.r-a.r)*strength;
        #endif
        #ifdef METH_R_G
            col.r+=(b.g-a.g)*strength;
        #endif
        #ifdef METH_R_B
            col.r+=(b.b-a.b)*strength;
        #endif
    #endif
    #ifdef METH_R_AVG
        #ifdef METH_R_R
            col.r+=(((b.r+a.r-0.5)/2.0))*strength;
        #endif
        #ifdef METH_R_G
            col.r+=(((b.g+a.g-0.5)/2.0))*strength;
        #endif
        #ifdef METH_R_B
            col.r+=(((b.b+a.b-0.5)/2.0))*strength;
        #endif
    #endif
    #ifdef METH_R_LUMI
        col.r+=(lum(b.rgb)-lum(a.rgb))*strength;
    #endif
    #ifdef METH_R_ONE
        col.r=1.0;
    #endif
    #ifdef METH_R_ZERO
        col.r=0.0;
    #endif


    ////////////////////////

    #ifdef DIR_G_HORIZONTAL
        a=pxl;
        b=pxr;
    #endif
    #ifndef DIR_G_HORIZONTAL // VERTICAL
        a=pxt;
        b=pxb;
    #endif
    #ifdef FLIP_G
        vec4 c3=a;
        a=b;
        b=c3;
    #endif
    #ifdef METH_G_DIFF
        #ifdef METH_G_R
            col.g+=(b.r-a.r)*strength;
        #endif
        #ifdef METH_G_G
            col.g+=(b.g-a.g)*strength;
        #endif
        #ifdef METH_G_B
            col.g+=(b.b-a.b)*strength;
        #endif
    #endif
    #ifdef METH_G_AVG
        #ifdef METH_G_R
            col.g+=(((b.r+a.r-0.5)/2.0))*strength;
        #endif
        #ifdef METH_G_G
            col.g+=(((b.g+a.g-0.5)/2.0))*strength;
        #endif
        #ifdef METH_G_B
            col.g+=(((b.b+a.b-0.5)/2.0))*strength;
        #endif
    #endif
    #ifdef METH_G_LUMI
        col.g+=(lum(b.rgb)-lum(a.rgb))*strength;
    #endif
    #ifdef METH_G_ONE
        col.g=1.0;
    #endif
    #ifdef METH_G_ZERO
        col.g=0.0;
    #endif


    ////////////////////////

    #ifdef DIR_B_HORIZONTAL
        a=pxl;
        b=pxr;
    #endif
    #ifndef DIR_B_HORIZONTAL // VERTICAL
        a=pxt;
        b=pxb;
    #endif
    #ifdef FLIP_B
        vec4 c2=a;
        a=b;
        b=c2;
    #endif
    #ifdef METH_B_DIFF
        #ifdef METH_B_R
            col.b+=(b.r-a.r)*strength;
        #endif
        #ifdef METH_B_G
            col.b+=(b.g-a.g)*strength;
        #endif
        #ifdef METH_B_B
            col.b+=(b.b-a.b)*strength;
        #endif
    #endif
    #ifdef METH_B_AVG
        #ifdef METH_B_R
            col.b+=(((b.r+a.r-0.5)/2.0))*strength;
        #endif
        #ifdef METH_B_G
            col.b+=(((b.g+a.g-0.5)/2.0))*strength;
        #endif
        #ifdef METH_B_B
            col.b+=(((b.b+a.b-0.5)/2.0))*strength;
        #endif
    #endif
    #ifdef METH_B_LUMI
        col.b+=(lum(b.rgb)-lum(a.rgb))*strength;
    #endif
    #ifdef METH_B_ONE
        col.b=1.0;
    #endif
    #ifdef METH_B_ZERO
        col.b=0.0;
    #endif



    col.a=1.0;

    outColor= col;

}
