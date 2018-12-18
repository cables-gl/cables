
#ifdef HAS_TEXTURES
    IN vec2 texCoord;
    UNI sampler2D tex;
    UNI sampler2D displaceTex;
#endif
UNI float amountX;
UNI float amountY;

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    #ifdef HAS_TEXTURES
        float mulX=1.0;
        float mulY=1.0;
        float x=mod(texCoord.x+mulX*(texture(displaceTex,texCoord).g-0.5)*2.0*amountX,1.0);
        float y=mod(texCoord.y+mulY*(texture(displaceTex,texCoord).g-0.5)*2.0*amountY,1.0);


        col=texture(tex,vec2(x,y) );
//        col.rgb=desaturate(col.rgb,amount);
   #endif
   outColor= col;
}