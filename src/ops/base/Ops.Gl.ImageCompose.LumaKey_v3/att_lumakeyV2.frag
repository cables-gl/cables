IN vec2 texCoord;
UNI float threshholdLow;
UNI float threshholdHigh;
UNI sampler2D text;


float invLerp(float from, float to, float value) {
  return (value - from) / (to - from);
}




float remap(float origFrom, float origTo, float targetFrom, float targetTo, float value){
  float rel = invLerp(origFrom, origTo, value);
  return mix(targetFrom, targetTo, rel);
}

void main()
{
   vec4 col = texture(text, texCoord );

   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );

    #ifdef INVERT
        gray=1.0-gray;
    #endif


    if(gray < threshholdLow || gray > threshholdHigh) col.r=col.g=col.b=col.a=0.0;
        #ifdef BLACKWHITE
        else col.r=col.g=col.b=col.a=1.0;
        #endif

    #ifdef REMAP
        col.rgb=vec3(remap(threshholdLow,threshholdHigh,0.0,1.0,gray));
    #endif


    #ifdef REMOVEALPHA
        col.a=1.0;
    #endif




   outColor= col;
}