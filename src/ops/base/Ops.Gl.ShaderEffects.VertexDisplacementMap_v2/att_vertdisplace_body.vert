
vec2 MOD_tc=texCoord;

#ifdef MOD_FLIPY
    MOD_tc.y=1.0-MOD_tc.y;
#endif


float MOD_texVal=texture2D( MOD_texture, vec2(MOD_tc.x+MOD_offsetX,MOD_tc.y+MOD_offsetY) ).b;

#ifdef MOD_HEIGHTMAP_INVERT
   MOD_texVal=1.0-MOD_texVal;
#endif

#ifdef MOD_DISPLACE_METH_MULXYZ
   MOD_texVal+=1.0;
   pos.xyz *= MOD_texVal * MOD_extrude;
    // .endl()+'   norm=normalize(norm+normalize(pos.xyz+vec3(MOD_texVal)* MOD_extrude));'
#endif

#ifdef MOD_DISPLACE_METH_ADDZ
   pos.z+=(MOD_texVal * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_ADDY
   pos.y+=(MOD_texVal * MOD_extrude);
#endif



#ifdef MOD_DISPLACE_METH_ADDX
   pos.x+=(MOD_texVal * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_SUBX
   pos.x-=(MOD_texVal * MOD_extrude);
#endif


#ifdef MOD_DISPLACE_METH_MULY
   pos.y+=((MOD_texVal-0.5) * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_MULZ
   pos.z+=((MOD_texVal-0.5) * MOD_extrude);
#endif

#ifdef MOD_DISPLACE_METH_NORMAL
   pos.xyz+=norm*MOD_texVal*MOD_extrude;
#endif

#ifdef MOD_DISPLACE_METH_NORMAL_XY
   pos.xy+=(pos.xy*MOD_texVal*MOD_extrude).xy;
    // .endl()+'   pos.x+=(norm*MOD_texVal*MOD_extrude).x;'
#endif


MOD_displHeightMapColor=MOD_texVal;
