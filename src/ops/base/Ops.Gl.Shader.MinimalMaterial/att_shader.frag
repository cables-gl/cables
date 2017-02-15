{{MODULE_BEGIN_FRAG}}

precision highp float;

void main()
{
   vec4 col=vec4(1.0,1.0,0.0,1.0);
   {{MODULE_COLOR}}
   gl_FragColor = col;
}
//sdsdsd