

    IN vec2 texCoord;
    UNI sampler2D tex;
    UNI sampler2D displaceTex;

UNI float amountX;
UNI float amountY;

void main()
{
    vec3 offset=texture2D(displaceTex,texCoord).rgb;
    
    offset=offset*2.0-1.0;
    
    float x=(offset.r)*amountX;
    float y=(offset.g)*amountY;
    
    vec4 col=texture2D(tex,vec2(x,y)+texCoord );

// col.r=x;
// col.g=y;

// col.xy=texCoord;
   gl_FragColor = col;
}