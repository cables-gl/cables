IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float amount;

{{BLENDCODE}}

void main()
{
   vec4 col=vec4(r,g,b,1.0);
   vec4 base=texture2D(tex,texCoord);

   col=vec4( _blend(base.rgb,col.rgb) ,1.0);
   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
   
   outColor= col;
}
