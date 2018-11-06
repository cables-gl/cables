IN vec2 texCoord;
UNI sampler2D tex;
UNI float time;
UNI float amountX;
UNI float amountY;
UNI float offsetX;
UNI float offsetY;
UNI float rotate;

#define PI 3.14159265
#define TAU (2.0*PI)

float random (vec2 st)
{
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

// Repeat in two dimensions
vec2 pMod2(inout vec2 p, vec2 size)
{
	vec2 c = floor((p + texCoord* 0.5)/size);
	p = mod(p + size*0.5,size) - size*0.5;
	return c;
}

// Same, but mirror every second cell so all boundaries match
vec2 pModMirror2(inout vec2 p, vec2 size)
{
	vec2 halfsize = size*0.5;
	vec2 c = floor((p + halfsize)/size);
	p = mod(p + halfsize, size) - halfsize;
	p *= mod(c,vec2(2.0))*2.0 - vec2(1.0);
	return c;
}

// Same, but mirror every second cell at the diagonal as well
vec2 pModGrid2(inout vec2 p, vec2 size) {
	vec2 c = floor((p + size*0.5)/size);
	p = mod(p + size*0.5, size) - size*0.5;
	p *= mod(c,vec2(2.0))*2.0 - vec2(1.0);
	p -= size/2.0;
	if (p.x > p.y) p.xy = p.yx;
	return floor(c/2.0);
}

void main()
{
    float x = -amountX ;
    float y = -amountY ;


    vec2 uv = texCoord;
    vec2 offset = vec2(offsetX,offsetY);
    //vec2 cell2 = pMod2(uv.xy,vec2(amountX,amountY));
    vec2 size = vec2(x,y);

    uv += offset;

    //uv.x +=0.25;
    //uv.xy = mod((uv+offset) + size*0.5,size) - size*0.5;//pmod2

    //vec2 cell2a = pModGrid2(uv.xy,vec2(x,y));
    vec2 cell2b = pModMirror2(uv.xy,vec2(x,y));
    // uv *= random(cell2+floor(time));
    pR(uv,rotate*TAU);

    outColor = texture2D(tex,uv);//vec4(uv,0.0,1.0);//
}