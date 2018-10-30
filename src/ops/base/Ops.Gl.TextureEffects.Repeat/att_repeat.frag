IN vec2 texCoord;
UNI sampler2D tex;
UNI float amountX;
UNI float amountY;

void main()
{
   vec2 coord = vec2( 
            mod(texCoord.x*amountX,1.0), 
            mod(texCoord.y*amountY,1.0));
   
   outColor = texture2D(tex,coord);
}