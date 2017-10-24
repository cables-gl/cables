
IN vec2 texCoord;
UNI sampler2D tex;
UNI float pixel;
UNI float onePixel;
UNI float amount;
UNI float lensDistort;

void main()
{

   vec4 col=texture2D(tex,texCoord);
   vec4 colOrig=texture2D(tex,texCoord);

       vec2 tc=texCoord;;
       float pix = pixel;
       if(lensDistort>0.0)
       {
           float dist = distance(texCoord, vec2(0.5,0.5));
           tc-=0.5;
           tc *=smoothstep(-0.9,1.0*lensDistort,1.0-dist);
           tc+=0.5;
       }

   col.r=texture2D(tex,vec2(tc.x+pix,tc.y)).r;
   col.b=texture2D(tex,vec2(tc.x-pix,tc.y)).b;

   gl_FragColor = col;

}
