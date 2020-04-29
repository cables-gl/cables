UNI sampler2D tex;
UNI float a;
IN vec2 texCoord;

vec4 myround(vec4 col)
{
    if(col.a>0.5)return vec4(1.0,1.0,1.0,1.0);
    else return vec4(1.0,1.0,1.0,0.0);
}

void main()
{

#ifndef HARD_EDGE
    outColor= vec4(1.0,1.0,1.0,texture(tex,vec2(texCoord.x,(1.0-texCoord.y))).r*a);
#endif
#ifdef HARD_EDGE

    float step=0.7;
    vec4 col=texture(tex,vec2(texCoord.x,1.0-texCoord.y));
    vec4 col2=texture(tex,vec2(texCoord.x-(fwidth(texCoord.x)*step),1.0-texCoord.y-(fwidth(texCoord.y)*step)));
    vec4 col3=texture(tex,vec2(texCoord.x+(fwidth(texCoord.x)*step),1.0-texCoord.y+(fwidth(texCoord.y)*step)));
    vec4 col4=texture(tex,vec2(texCoord.x+(fwidth(texCoord.x)*step),1.0-texCoord.y-(fwidth(texCoord.y)*step)));
    vec4 col5=texture(tex,vec2(texCoord.x-(fwidth(texCoord.x)*step),1.0-texCoord.y+(fwidth(texCoord.y)*step)));

    float f=smoothstep(col.a,0.5,0.8);

    col=myround(col);
    col2=myround(col2);
    col3=myround(col3);
    col4=myround(col4);
    col5=myround(col5);

    col.a=(col.a+col2.a+col3.a+col4.a+col5.a)/5.0*a;
    outColor=col;
#endif


}
