IN vec2 texCoord;
UNI sampler2D tex;
UNI float time;
UNI float speedX;
UNI float speedY;
UNI float repeatX;
UNI float repeatY;
UNI float mul;

const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);

    vec2 tc = texCoord+cos( (time*vec2(speedX, speedY) + vec2(texCoord.s*repeatX,texCoord.t*repeatY)))*mul;

    col=texture(tex,tc);

    outColor= col;
}