UNI sampler2D tex0;
UNI sampler2D tex1;
UNI sampler2D tex2;
UNI sampler2D tex3;
UNI sampler2D tex4;
UNI sampler2D tex5;
UNI sampler2D tex6;
UNI sampler2D tex7;
UNI sampler2D tex8;
UNI sampler2D tex9;
UNI sampler2D tex10;
UNI sampler2D tex11;
UNI sampler2D tex12;
UNI sampler2D tex13;
UNI sampler2D tex14;
UNI sampler2D tex15;

IN vec2 texCoord;
UNI float numRows;
UNI float numCols;

void main()
{
    vec2 tc=texCoord;


    #ifdef ARRANGE_COLS
        float index=floor(tc.x*numCols);
        vec2 fr=vec2(fract(tc.x*numCols),tc.y);

        #ifdef FLIPORDER
            index=numCols-(index+1.0);
        #endif

    #endif

    #ifdef ARRANGE_ROWS
        float index=floor((1.0-tc.y)*numRows);
        vec2 fr=vec2(tc.x,fract(tc.y*numRows));

        #ifdef FLIPORDER
            index=numRows-(index+1.0);
        #endif

    #endif

    #ifdef ARRANGE_GRID
        float row=floor((1.0-tc.y)*numRows);
        float colm=floor(tc.x*numCols);
        float index=row+(colm*numCols);

        #ifdef FLIPORDER
            index=(numRows*numCols)-(index)-1.0;
        #endif

        vec2 fr=vec2(fract(tc.x*numCols),fract(tc.y*numRows));
    #endif

    #ifdef ARRANGE_OVERLAPX
        float index=floor(tc.x*numCols);
        vec2 fr=vec2(fract(tc.x),tc.y);

        #ifdef FLIPORDER
            index=numCols-(index+1.0);
        #endif
    #endif

    #ifdef ARRANGE_OVERLAPY
        float index=floor( (1.0-tc.y)*numRows);
        vec2 fr=vec2(fract(tc.x),tc.y);

        #ifdef FLIPORDER
            index=numCols-(index+1.0);
        #endif
    #endif

    vec4 col;
    if(index==0.0)col=texture(tex0,fr);
    if(index==1.0)col=texture(tex1,fr);
    if(index==2.0)col=texture(tex2,fr);
    if(index==3.0)col=texture(tex3,fr);
    if(index==4.0)col=texture(tex4,fr);
    if(index==5.0)col=texture(tex5,fr);
    if(index==6.0)col=texture(tex6,fr);
    if(index==7.0)col=texture(tex7,fr);
    if(index==8.0)col=texture(tex8,fr);
    if(index==9.0)col=texture(tex9,fr);
    if(index==10.0)col=texture(tex10,fr);
    if(index==11.0)col=texture(tex11,fr);
    if(index==12.0)col=texture(tex12,fr);
    if(index==13.0)col=texture(tex13,fr);
    if(index==14.0)col=texture(tex14,fr);
    if(index==15.0)col=texture(tex15,fr);

    outColor = col;
}


