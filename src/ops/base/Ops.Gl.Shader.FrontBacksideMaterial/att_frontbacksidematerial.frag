void main()
{
   if(!gl_FrontFacing) outColor= vec4(1.0,0.0,0.0,1.0);
       else outColor=vec4(0.0,1.0,0.0,1.0);
}