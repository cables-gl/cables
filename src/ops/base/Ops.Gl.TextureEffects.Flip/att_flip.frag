IN vec2 texCoord;
UNI sampler2D tex;
UNI float x;
UNI float y;

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture(tex,vec2(abs(x-texCoord.x),abs(y-texCoord.y)));
   outColor= col;
}