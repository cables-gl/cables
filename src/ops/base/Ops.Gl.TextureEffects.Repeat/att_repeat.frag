IN vec2 texCoord;
UNI sampler2D tex;
UNI float amountX;
UNI float amountY;

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);

   float x=1.0/amountX;
   float y=1.0/amountY;
   vec2 coord = vec2( mod(texCoord.x*amountX,1.0), mod(texCoord.y*amountY,1.0));
   col=texture2D(tex,coord);

   gl_FragColor = col;
}