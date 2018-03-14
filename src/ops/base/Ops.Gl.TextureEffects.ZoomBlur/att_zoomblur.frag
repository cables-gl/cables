UNI sampler2D tex;
UNI float x;
UNI float y;
UNI float strength;
// UNI vec2 texSize;
IN vec2 texCoord;

#ifdef HAS_MASK
    UNI sampler2D texMask;
#endif


float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}


void main()
{
    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 center=vec2(x,1.0-y);
    
    vec2 texSize=vec2(1.0,1.0);
    
    vec2 toCenter = center - texCoord * texSize;
 
    /* randomize the lookup values to hide the fixed number of samples */
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    float am=strength;

    #ifdef HAS_MASK
        am=am*texture2D(texMask,texCoord).r;
        if(am<=0.02)
        {
            gl_FragColor=texture2D(tex, texCoord);
            return;
        }
    #endif



    
    for (float t = 0.0; t <= 40.0; t++) {
        float percent = (t + offset) / 40.0;
        float weight = 4.0 * (percent - percent * percent);
        vec4 smpl = texture2D(tex, texCoord + toCenter * percent * am / texSize);
        
        /* switch to pre-multiplied alpha to correctly blur transparent images */
        smpl.rgb *= smpl.a;
        
        color += smpl * weight;
        total += weight;
    }
    
    outColor = color / total;
    // outColor.r=1.0;
    
    /* switch back from pre-multiplied alpha */
    // gl_FragColor.rgb /= gl_FragColor.a + 0.00001;
}