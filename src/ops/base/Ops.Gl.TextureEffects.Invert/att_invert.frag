IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;

{{CGL.BLENDMODES}}

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture(tex,texCoord);
   vec4 invert = vec4(vec3(1.0)-col.rgb,1.0);

   outColor=cgl_blend(col,invert,amount);
}
