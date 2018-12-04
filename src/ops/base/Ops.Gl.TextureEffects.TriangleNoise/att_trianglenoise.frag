IN vec2 texCoord;
UNI sampler2D tex;
UNI float scale;
UNI float angle;
UNI float ratio;
UNI float add;
UNI float amount;

{{BLENDCODE}}

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(13.98987,28.533))) * 4758.6453+add*0.1);
}

float GetLocation(vec2 s, float d)
{
    vec2 f = s*d;
    f = f + vec2(0,0.5)*floor(f).x;
    s = fract(f);
    f = floor(f);

    d = s.y - 0.5;
    float l = abs(d) + 0.5 * s.x;
    float ff = f.x+f.y;
    f = mix(f, f+sign(d)*vec2(0,0.5), step(0.5, l));
    l = mix(ff, ff+sign(d)*0.5, step(0.5, l));

    float r=mod(rand(f)*2.0,2.0);
    if(r>1.0)r=2.0-r;

    return r;
}

void main()
{
    vec2 coord=texCoord;
    coord.y*=ratio;

    float sin_factor = sin(angle*0.01745329251);
    float cos_factor = cos(angle*0.01745329251);
    coord = vec2((coord.x - 0.5) , coord.y - ratio/2.0) * mat2(cos_factor, sin_factor, -sin_factor, cos_factor);

    float a=GetLocation(coord,scale);

    vec4 col=vec4(a,a,a,1.0);
    vec4 base=texture(tex,texCoord);

    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);

    outColor= col;
}