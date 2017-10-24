
#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D tex;
#endif
uniform float amount;

vec3 desaturate(vec3 color, float amount)
{
   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
   return vec3(mix(color, gray, amount));
}

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   #ifdef HAS_TEXTURES
       col=texture2D(tex,texCoord);
       col.rgb=desaturate(col.rgb,amount);
   #endif
   gl_FragColor = col;
}