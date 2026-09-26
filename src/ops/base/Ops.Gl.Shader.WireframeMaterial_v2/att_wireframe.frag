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


    float edge = clamp((1.0 - edgeFactor()) * aa, 0.0, 1.0);

    #ifdef WIREFRAME_FILL
        col = mix(colorFill, colorWire, edge);
    #endif

    #ifndef WIREFRAME_FILL
        col = colorWire;
        col.a *= edge;
    #endif

    if (col.a <= 0.0) discard;

    {{MODULE_COLOR}}

    outColor=col;
}