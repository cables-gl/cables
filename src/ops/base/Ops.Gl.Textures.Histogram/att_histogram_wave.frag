UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
    vec4 col=vec4(0.0,0.0,0.0,1.0);
    float strengthR=texture(tex,vec2(texCoord.x,1.0)).r;
    float strengthG=texture(tex,vec2(texCoord.x,1.)).r;
    float strengthB=texture(tex,vec2(texCoord.x,0.5)).r;
    float strengthL=texture(tex,vec2(texCoord.x,0.25)).r;

    strengthR*=strengthR;
    strengthG*=strengthG;
    strengthB*=strengthB;
    strengthL*=strengthL;


    if(strengthR*0.5>texCoord.y) col.r=1.0;
    if(strengthG*0.5>texCoord.y) col.g=1.0;
    if(strengthB*0.5>texCoord.y) col.b=1.0;

    if(strengthL > texCoord.y*2.0-1.0 && texCoord.y>0.5) col.rgb=vec3(1.0);

    col=texture(tex,vec2(texCoord.x,texCoord.y)).rgba;
    outColor= col;
}
