UNI float {{mod}}_time;
IN mat4 instMat;

float osci(float v)
{
   v=mod(v,1.0);
   if(v>0.5)v=1.0-v;
   return smoothstep(0.0,1.0,v*2.0);
}
