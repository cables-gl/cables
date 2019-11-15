UNI float do_instancing;
UNI float MOD_scale;

#ifdef INSTANCING
   IN mat4 instMat;
   IN vec4 instColor;
   OUT mat4 instModelMat;
   OUT vec4 frag_instColor;
#endif