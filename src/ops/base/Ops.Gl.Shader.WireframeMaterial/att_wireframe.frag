IN vec3 barycentric;
UNI float width;
UNI float opacity;
UNI float r,g,b;
UNI float fr,fg,fb;
IN vec3 norm;

float edgeFactor()
{
    vec3 d = fwidth(barycentric);
    vec3 a3 = smoothstep(vec3(0.0), d*width*4.0, barycentric);
    return min(min(a3.x, a3.y), a3.z);
}

void main()
{
    vec4 col;

    #ifdef WIREFRAME_FILL
        float v=opacity*(1.0-edgeFactor())*0.95;
        vec3 wire = vec3(fr, fg, fb);
        col.rgb = vec3(r, g, b);
        col.rgb = mix(wire,col.rgb,v);
       col.a = opacity;
    #endif

    #ifndef WIREFRAME_FILL
       col = vec4(r,g,b, opacity*(1.0-edgeFactor())*0.95);
    #endif
    
    outColor=col;

}