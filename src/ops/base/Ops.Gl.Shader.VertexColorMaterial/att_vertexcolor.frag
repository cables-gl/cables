{{MODULES_HEAD}}

IN vec4 color;
UNI float opacity;

void main()
{
{{MODULE_BEGIN_FRAG}}
   vec4 col=color;
{{MODULE_COLOR}}

   col.a=opacity;
   outColor= col;
}