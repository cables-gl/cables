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
   vec4 base=texture(tex,texCoord);
   vec4 color=texture(gradient,vec2(lumi(base.rgb),pos));
   outColor= vec4(color);
}
