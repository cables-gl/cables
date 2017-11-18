

IN vec2 texCoord;
UNI float width;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float aspect;

UNI bool smoothed;

void main()
{
   vec4 col=texture2D(tex,texCoord);

    if(!smoothed)
    {
       if( texCoord.x>1.0-width/3.0 || texCoord.y>1.0-width/aspect/3.0 || texCoord.y<width/aspect/3.0 || texCoord.x<width/3.0 ) col = vec4(r,g,b, 1.0);
       gl_FragColor = col;
    }
    else
    {
       float f=smoothstep(0.0,width,texCoord.x)-smoothstep(1.0-width,1.0,texCoord.x);
       f*=smoothstep(0.0,width/aspect,texCoord.y);
       f*=smoothstep(1.0,1.0-width/aspect,texCoord.y);
       gl_FragColor = mix(col,vec4(r,g,b, 1.0),1.0-f);
    }
}