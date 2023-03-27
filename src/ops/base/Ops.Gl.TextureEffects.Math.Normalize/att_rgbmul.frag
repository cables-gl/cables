IN vec2 texCoord;
UNI sampler2D tex;
UNI float fade;
UNI float mul;


void main()
{
    vec4 col=texture(tex,texCoord);
    #ifdef SAFE
    float l = length(col.xyz);
    col.xyz = mix(col.xyz,(col.xyz/(l==0.0?0.0000001:l))*mul,fade);
    #else
    col.xyz=(normalize(col.xyz)*mul)*fade+col.xyz*(1.0-fade);
    #endif
    outColor=col;
}
