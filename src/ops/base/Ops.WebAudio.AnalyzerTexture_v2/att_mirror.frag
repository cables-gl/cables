IN vec2 texCoord;

UNI sampler2D tex;
UNI float width;

void main()
{
   vec4 col = vec4(1.0, 0.0, 0.0, 1.0);

   float x = texCoord.x;

   if (texCoord.x >= 0.5) x = 1.0 - texCoord.x;

    x *= (1. - width) * 2.0;

   col = texture(tex, vec2(x, texCoord.y));

   outColor = col;
}