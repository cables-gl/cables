IN vec2 texCoord;
UNI sampler2D tex;

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture(tex,texCoord);
   col.rgb=1.0-col.rgb;
   outColor= col;
}
