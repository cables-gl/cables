IN vec2 texCoord;
UNI sampler2D tex;
UNI float amountX;
UNI float amountY;

#ifdef MASK
UNI sampler2D texMask;
#endif

void main()
{
    float amX=amountX;
    float amY=amountY;

    #ifdef MASK
        vec4 m=texture(texMask,texCoord);
        amX*=(m.r-0.5)*2.0;
        amY*=(m.g-0.5)*2.0;
        // amX*=m.r;
        // amY*=m.g;
    #endif

    vec4 col=vec4(0.0,0.0,0.0,1.0);
    float x=mod(texCoord.x+amX,1.0);
    float y=mod(texCoord.y+amY,1.0);


    #ifdef NO_REPEAT
        x=texCoord.x+amX*0.1;
        y=texCoord.y+amY*0.1;
    #endif

    col=texture(tex,vec2(x,y));

    #ifdef NO_REPEAT
        if(x>1.0 || x<0.0 || y>1.0 || y<0.0) col=vec4(0.0,0.0,0.0,1.0);
    #endif
    outColor= col;
}