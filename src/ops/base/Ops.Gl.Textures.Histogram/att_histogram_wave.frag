
UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
    vec4 col=vec4(0.0,0.0,0.0,1.0);
    float strengthR=texture2D(tex,vec2(texCoord.x,0.4)).r;
    float strengthG=texture2D(tex,vec2(texCoord.x,0.5)).g;
    float strengthB=texture2D(tex,vec2(texCoord.x,0.7)).b;
    float strengthL=texture2D(tex,vec2(texCoord.x,0.8)).r;
    
    strengthR*=strengthR;
    strengthG*=strengthG;
    strengthB*=strengthB;
    strengthL*=strengthL;
    
    
    if(strengthR*0.5>texCoord.y) col.r=1.0;
    if(strengthG*0.5>texCoord.y) col.g=1.0;
    if(strengthB*0.5>texCoord.y) col.b=1.0;
    
    if(strengthL > texCoord.y*2.0-1.0 && texCoord.y>0.5) col.rgb=vec3(1.0);

    gl_FragColor = col;
}
