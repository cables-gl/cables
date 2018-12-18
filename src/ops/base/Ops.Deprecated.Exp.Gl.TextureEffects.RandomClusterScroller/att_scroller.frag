IN vec2 texCoord;
UNI float time;
vec3 bgColor = vec3(0.0, 0., 0.);
vec3 rectColor = vec3(1.0,1.0,1.0);

UNI float num;
UNI float blur;
UNI float minSize;
UNI float maxSize;
UNI float opacity;

const float spread =2.0;


float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float circle(vec2 uv, vec2 pos, float rad)
{
	float d = length(pos - uv)*20.0*(1.0-rad) ;
	float t = clamp(d, 0.0, 1.0);
    return smoothstep(0.0, blur+0.01 , 1.0-t);
}

float rectangle(vec2 uv, vec2 pos, float width, float height)
{
    pos = (vec2(width, height) + .01)/2. - abs(uv - pos);
    pos = smoothstep(0.0, blur/12.0 , pos);
    return pos.x * pos.y;
}

void main()
{
	vec2 uv = texCoord;//fragCoord.xy / iResolution.xy * 2. - 1.;
    //uv.x *= iResolution.x/iResolution.y;
    vec3 color;
    
    float velX = -time/8.;
    for(float i=0.; i<num; i++)
    {
        float index = i/num;
        float rnd = random(vec2(index));
        vec3 pos = vec3(0.0);
        pos.x = fract(velX*rnd+index)*3.-1.5-pos.z/2.0;
        pos.y = (index* random(vec2(index+3.0))*2.0 )-0.75 -pos.z/2.0;
        pos.z = maxSize*rnd+minSize;

        #ifdef PRIM_RECT
            float hit = rectangle(uv, pos.xy, pos.z, pos.z);
        #endif
        #ifdef PRIM_CIRCLE
            float hit=circle(uv,pos.xy,pos.z*2.0);
        #endif
	    color += rectColor * hit * opacity;
    }
    
	outColor = vec4(color, 1.0);
}