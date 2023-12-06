IN vec2 texCoord;
UNI sampler2D tex;

UNI float width;
UNI float height;
UNI float x;
UNI float y;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

void main()
{
   vec4 col=texture(tex,texCoord);
   vec4 newcol;

   if(texCoord.x > x && texCoord.x < x+width && 1.0-texCoord.y < y+height && 1.0-texCoord.y > y)
   {
       newcol.rgba=vec4(r,g,b,1.0);
       col=mix(col,newcol,a);
   }
   outColor=col;
}
