IN vec2 texCoord;
UNI sampler2D tex;

UNI float num;
UNI float width;
UNI float axis;
UNI float offset;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

void main()
{
   vec4 col=texture2D(tex,texCoord);
    
   float v=0.0;
   float c=1.0;
   if(axis==0.0) v=texCoord.y;
   if(axis==1.0) v=texCoord.x;
   if(axis==2.0) v=texCoord.x+texCoord.y;
   if(axis==3.0) v=texCoord.x-texCoord.y;
   v+=offset;
    

   float m=mod(v,1.0/num);
   float rm=width*2.0*1.0/num/2.0;
    
   if(m>rm)
       col.rgb=mix(col.rgb,vec3( r,g,b ),a);

   #ifdef STRIPES_SMOOTHED    
       m*=2.0;
       col.rgb=vec3(  smoothstep(0.,1., abs(( ((m-rm) )/ (rm) )  ) ));
   #endif
    
   gl_FragColor = col;
}
