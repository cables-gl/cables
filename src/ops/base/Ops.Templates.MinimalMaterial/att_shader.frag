{{MODULE_BEGIN_FRAG}}

UNI float red;

void main()
{
   vec4 col=vec4(red,0.2,0.2,1.0);
   {{MODULE_COLOR}}
   outColor= col;
}
