
UNI float MOD_amount;
UNI float MOD_size;
UNI float MOD_scale;
UNI float MOD_falloff;

UNI float MOD_x;
UNI float MOD_y;
UNI float MOD_z;

#ifndef ATTRIB_attrSubmesh
    #define ATTRIB_attrSubmesh
    IN float attrSubmesh;
#endif



float MOD_random(vec2 co)
{
   float rnd= fract(sin(dot(co,vec2(12.9898,78.233))) * 437511.5453);
   return (rnd-0.5)*2.0;
}

