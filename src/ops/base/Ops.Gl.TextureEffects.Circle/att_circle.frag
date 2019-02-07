IN vec2 texCoord;
UNI sampler2D tex;

UNI float amount;
UNI float size;
UNI float inner;
UNI float fadeOut;

UNI float r;
UNI float g;
UNI float b;
UNI float a;
UNI float aspect;
UNI float stretch;

UNI float x;
UNI float y;

{{BLENDCODE}}

float dist(float x,float y,float x2,float y2)
{
	float xd = x2-x;
	float yd = y2-y;
	return abs(sqrt(xd*xd + yd*yd*(1.0-stretch)));

}


void main()
{
   vec4 base=texture(tex,texCoord);
   vec4 col=vec4(0.0,0.0,0.0,1.0);
    // .endl()+'   float dist = distance(vec2(0.5,0.5),vec2(texCoord.x,texCoord.y/aspect));'
//   float dist = distance(vec2( x,y),vec2(texCoord.x,(texCoord.y-0.5)*aspect)+0.5);
float dist = dist(x,y,texCoord.x+0.5,(texCoord.y-0.5)*aspect+0.5);

   float sz=size*0.5;
   float v=0.0;
   float fade=fadeOut+0.002;

   if(dist<sz && dist>inner*sz) v=1.0;

   #ifdef FALLOFF_SMOOTHSTEP
       if(dist>sz && dist<sz+fade)v=1.0-(smoothstep(0.0,1.0,(dist-sz)/(fade)) );
   #endif
   #ifndef FALLOFF_SMOOTHSTEP
       if(dist>sz && dist<sz+fade)v=1.0-((dist-sz)/(fade));
   #endif

   col=vec4( _blend(base.rgb,vec3(r,g,b)) ,1.0);
   col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*v*amount),1.0);

   outColor=col;

   #ifdef WARN_OVERFLOW
       float width=0.01;
       if( texCoord.x>(1.0-width) || texCoord.y>(1.0-width) || texCoord.y<width || texCoord.x<width )
           if(v>0.001*amount)outColor= vec4(1.0,0.0,0.0, 1.0);
   #endif

}
