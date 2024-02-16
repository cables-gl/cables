

#ifdef HAS_TEXCOORDS
texCoord=(texCoord*instTexCoords.zw)+instTexCoords.xy;
#endif

mMatrix*=instMat;
pos.xyz*=MOD_scale;

#ifdef HAS_COLORS
frag_instColor=instColor;
#endif
#ifndef HAS_COLORS
frag_instColor=vec4(1.0);
#endif


frag_instIndex=instanceIndex;

