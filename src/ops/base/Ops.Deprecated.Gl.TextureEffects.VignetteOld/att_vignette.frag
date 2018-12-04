IN vec2 texCoord;
uniform sampler2D tex;
uniform float lensRadius1;
uniform float lensRadius2;
uniform float ratio;
uniform float amount;

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    col=texture(tex,texCoord);
    vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*ratio+0.5);
    float dist = distance(tcPos, vec2(0.5,0.5))*amount;
    col.rgb *= smoothstep(lensRadius1, lensRadius2, dist);
    outColor= col;
}