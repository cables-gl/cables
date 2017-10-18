IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D gradient;
UNI float pos;

float lumi(vec3 color)
{
   return vec3(dot(vec3(0.2126,0.7152,0.0722), color)).r;
}

void main()
{
   vec4 base=texture2D(tex,texCoord);
   vec4 color=texture2D(gradient,vec2(lumi(base.rgb),pos));
   gl_FragColor = vec4(color);
}
