
IN vec4 instColor;
IN mat4 instMat;
IN vec4 instTexCoords;
IN float instanceIndex;
OUT mat4 instModelMat;
OUT vec4 frag_instColor;

#ifdef WEBGL2
    flat OUT float frag_instIndex;
#endif
#ifdef WEBGL1
    OUT float frag_instIndex;
#endif



#define INSTANCING

