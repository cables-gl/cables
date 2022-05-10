IN vec2 texCoord;
UNI sampler2D tex;
UNI float lensRadius1;
UNI float aspect;
UNI float amount;
UNI float strength;
UNI float sharp;

UNI vec3 vcol;

{{CGL.BLENDMODES3}}

void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 vvcol=vec4(vcol,1.0);
    vec4 col=texture(tex,texCoord);
    vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);
    float dist = distance(tcPos, vec2(0.5,0.5));
    float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));

    col=mix(col,vvcol,am*strength);

    #ifndef ALPHA
        outColor=cgl_blendPixel(base,col,amount);
    #endif

    #ifdef ALPHA
        outColor=vec4(base.rgb,base.a*(1.0-am*strength));
    #endif
}
