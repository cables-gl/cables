#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D image;
#endif
UNI float n;
UNI float f;
UNI float focus;
UNI float width;

void main()
{
   vec4 col=vec4(0.0,0.0,0.0,1.0);
   #ifdef HAS_TEXTURES
        col=texture2D(image,texCoord);
        float z=col.r;
        float c=(2.0*n)/(f+n-z*(f-n));
        
        c=abs( c-focus );
        // c*=width;
        
        c=smoothstep(0.,width,c);
        

        #ifndef INVERT
        c=1.0-c;
        #endif

        col=vec4(c,c,c,1.0);

   #endif

   gl_FragColor = col;
}