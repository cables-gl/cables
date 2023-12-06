UNI float hue;

#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D tex;
#endif

#ifdef TEX_MASK
    UNI sampler2D texMask;
#endif
#ifdef TEX_OFFSET
    UNI sampler2D texOffset;
#endif

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
    #ifdef HAS_TEXTURES
        col=texture(tex,texCoord);
        float h=hue;

        #ifdef TEX_OFFSET
            h += texture(texOffset,texCoord).r;
        #endif


        vec3 hsv = rgb2hsv(col.rgb);
        hsv.x=hsv.x+h;

        #ifndef TEX_MASK
            col.rgb = hsv2rgb(hsv);
        #endif

        #ifdef TEX_MASK
            col.rgb = mix(col.rgb,hsv2rgb(hsv),texture(texMask,texCoord).r);
        #endif

   #endif
   outColor= col;
}