
IN vec2 texCoord;
UNI float lineSize;

void main()
{

   float total = floor(texCoord.x*lineSize-lineSize/2.0) +floor(texCoord.y*lineSize-lineSize/2.0);
   float r = mod(total,2.0);

   vec4 col=vec4(r,r,r,1.0);
    
   outColor= col;
}