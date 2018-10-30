IN vec2 texCoord;
UNI sampler2D tex;

UNI float radius;
UNI float strength;
UNI float centerX;
UNI float centerY;

void main()
{
   vec2 center=vec2(centerX,centerY);
   vec2 coord=texCoord;
   coord -= center;
   float distance = length(coord);
   float percent = distance / radius;
   if (strength > 0.0) coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);
   else coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);
   coord += center;
   vec4 col=texture2D(tex,coord);
   outColor= col;
}