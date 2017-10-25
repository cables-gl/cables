
IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;


const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);


void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture2D(tex,texCoord);


   float luma = dot(col, lumcoeff);
   vec4 mask = (col - vec4(luma));
   mask = clamp(mask, 0.0, 1.0);
   float lumaMask = dot(lumcoeff, mask);
   lumaMask = 1.0 - lumaMask;
   vec4 vibrance = mix(vec4(luma), col, 1.0 + amount * lumaMask);
   gl_FragColor = vibrance;

}