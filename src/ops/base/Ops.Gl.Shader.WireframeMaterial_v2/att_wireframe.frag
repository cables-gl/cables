{{MODULES_HEAD}}

IN vec3 barycentric;
IN vec3 norm;
UNI float width;

UNI vec4 colorFill;
UNI vec4 colorWire;

UNI float aa;

float edgeFactor()
{
    vec3 d = fwidth(barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d*width, barycentric);
    return min(min(a3.x, a3.y), a3.z);
}

void main()
{
    vec4 col;
    {{MODULE_BEGIN_FRAG}}


    #ifdef WIREFRAME_FILL

        float v=(1.0-edgeFactor())*(aa*width);
        col = mix(colorFill,colorWire,v);

    #endif

    #ifndef WIREFRAME_FILL

        float f=(1.0-edgeFactor())*(aa*width);
        col = colorWire;
        col.a=f;
        if(f==0.0)discard;
    #endif

    {{MODULE_COLOR}}

    outColor=col;
}