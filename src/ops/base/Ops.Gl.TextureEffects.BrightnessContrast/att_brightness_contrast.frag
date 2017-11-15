
#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  uniform sampler2D tex;
#endif
uniform float amount;
uniform float amountbright;


void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   #ifdef HAS_TEXTURES
       col=texture2D(tex,texCoord);

       // appl y contrast
       col.rgb = ((col.rgb - 0.5) * max(amount*2.0, 0.0))+0.5;

       // appl y brightness
       col.rgb *= amountbright*2.0;

   #endif
   gl_FragColor = col;
}