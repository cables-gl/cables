IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float lowEdge;
UNI float highEdge;

{{CGL.BLENDMODES}}

void main()
{
    vec3 result = vec3(0.);
    vec3 color = texture(tex,texCoord).rgb;

    #ifdef CLAMP
        result = clamp(color,vec3(lowEdge),vec3(highEdge));
    #endif

    #ifdef REMAP
        result = mix(color*vec3(lowEdge),color*vec3(highEdge),color);
    #endif

    #ifdef REMAP_SMOOTH
        result = smoothstep(vec3(lowEdge),vec3(highEdge),color);
    #endif

    outColor= mix(vec4(color,1.0),
                    vec4(result,1.0),
                        amount);
}