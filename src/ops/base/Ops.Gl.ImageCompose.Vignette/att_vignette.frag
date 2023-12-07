IN vec2 texCoord;
UNI sampler2D tex;
UNI float lensRadius1;
UNI float aspect;
UNI float amount;
UNI float sharp;

UNI float r,g,b;

void main()
{
   vec4 vcol=vec4(r,g,b,1.0);
   vec4 col=texture(tex,texCoord);
   vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);
   float dist = distance(tcPos, vec2(0.5,0.5));
   float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));

   col=mix(col,vcol,am*amount);

   outColor= col;
}
