IN vec2 texCoord;
UNI sampler2D tex;
UNI float radius;
UNI float r;
UNI float g;
UNI float b;

UNI float width;
UNI float height;

float roundRect(in vec2 distFromCenter)
{
    float r=radius*0.25*width+0.01;
    float t = length(max(abs(distFromCenter) - (vec2(0.5*width,0.5*height) - vec2(r,r)), vec2(0.0))) - r;
    return smoothstep(-0.001, 0.9,t);
}

void main()
{
    vec4 col=texture(tex,texCoord);
    float c=0.0;
    
    c=roundRect(vec2(0.5*width,0.5*height)-vec2(gl_FragCoord));
    outColor=mix(col,vec4(r,g,b,1.0),c);
}