UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
    outColor= texture(tex,texCoord);
    // outColor=vec4(1.0,0.0,0.0,1.0);
}

