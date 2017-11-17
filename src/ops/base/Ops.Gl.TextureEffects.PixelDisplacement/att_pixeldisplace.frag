
#ifdef HAS_TEXTURES
    IN vec2 texCoord;
    uniform sampler2D tex;
    uniform sampler2D displaceTex;
#endif
uniform float amountX;
uniform float amountY;

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    #ifdef HAS_TEXTURES
        float mulX=1.0;
        float mulY=1.0;
        float x=mod(texCoord.x+mulX*(texture2D(displaceTex,texCoord).g-0.5)*2.0*amountX,1.0);
        float y=mod(texCoord.y+mulY*(texture2D(displaceTex,texCoord).g-0.5)*2.0*amountY,1.0);


        col=texture2D(tex,vec2(x,y) );
//        col.rgb=desaturate(col.rgb,amount);
   #endif
   gl_FragColor = col;
}