{{MODULES_HEAD}}

IN vec4 vertColor;
UNI float opacity;

void main()
{
{{MODULE_BEGIN_FRAG}}
   vec4 col=vertColor;
{{MODULE_COLOR}}

   col.a=opacity;
   outColor= col;
}