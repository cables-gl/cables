#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  uniform sampler2D tex;
#endif

uniform float amountX;
uniform float amountY;

void main()
{
   vec4 col=vec4(0.0,0.0,0.0,1.0);
   #ifdef HAS_TEXTURES
       float x=mod(texCoord.x+amountX,1.0);
       float y=mod(texCoord.y+amountY,1.0);
        
       #ifdef NO_REPEAT
           x=texCoord.x+amountX*0.1;
           y=texCoord.y+amountY*0.1;
       #endif
    
       col=texture2D(tex,vec2(x,y));
    
       #ifdef NO_REPEAT
       if(x>1.0 || x<0.0 || y>1.0 || y<0.0) col=vec4(0.0,0.0,0.0,1.0);
       #endif
   #endif
   outColor= col;
}