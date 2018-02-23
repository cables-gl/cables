IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D mask;


void main()
{
    vec4 col=vec4(0.0,0.0,0.0,1.0);
    
    col=texture2D(tex, texCoord);
    float m=texture2D(mask, texCoord).r;
    
    if(m>0.0)col=texture2D(tex, vec2(texCoord.x+m*0.1,texCoord.y) );
    
    
    outColor=col;
    
}
