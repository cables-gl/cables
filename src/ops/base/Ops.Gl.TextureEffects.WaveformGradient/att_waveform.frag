IN vec2 texCoord;
UNI sampler2D tex;
UNI float uFreq;
UNI float uOffset;
UNI float uPow;
UNI float uRotate;
UNI float amount;

{{CGL.BLENDMODES}}

#define PI 3.14159265359
#define TAU (2.0 * PI)

void pR(inout vec2 p, float a)
{
    float s = sin(a),c=cos(a); p *= mat2(c,s,-s,c);
}

float pModMirror1(inout float p, float size) {
	float halfsize = size * 0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize,size) - halfsize;
	p *= mod(c, 2.0) * 2.0 - 1.0;
	return c;
}

void main()
{
    vec2 uv = texCoord;
    float v = 0.0;

    uv -= 0.5;
    pR(uv,TAU * uRotate);
    uv += 0.5 + uOffset;

    uv.x *= uFreq;

    #ifdef MODE_SINE
        uv.x += 0.5;
        pModMirror1(uv.x,1.0);
        v = pow(cos(PI * uv.x / 2.0),uPow);
    #endif

    #ifdef MODE_SAW
        uv.x = mod(uv.x,1.0);
        v = pow(min(cos(PI * uv.x /2.0),1.0 - abs(uv.x)),uPow);
    #endif

    #ifdef MODE_TRI
        uv.x += 0.5;
        pModMirror1(uv.x,1.0);
        uv.x = -abs(uv.x);
        uv.x = fract(uv.x);
        v = pow(uv.x,uPow);
    #endif

    vec4 col = vec4(v,v,v,1.0);
    vec4 base = texture(tex,texCoord);

    outColor = col;
}
