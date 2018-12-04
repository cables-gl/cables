IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D tex1;
UNI float amount;

UNI float r;
UNI float g;
UNI float b;

UNI float uAmp;
UNI float uFreq;
UNI float uWidth;
UNI float uGlow;
UNI float uWaveSelect;
UNI bool uInvert;
UNI bool uSolid;

UNI float uOffSetX;
UNI float uOffSetY;
UNI float uRotate;


{{BLENDCODE}}

#define PI 3.14159265359
#define TAU (2.0*PI)

float vmax(vec2 v)
{
	return max(v.x, v.y);
}

void pR(inout vec2 p, float a)
{
    float s = sin(a),c=cos(a); p *= mat2(c,s,-s,c);
}

float pMod1(inout float p, float size)
{
	float halfsize = size * 0.5;
	float c = floor((p + halfsize) / size);
	p = mod(p + halfsize, size) - halfsize;
	return c;
}

float pModMirror1(inout float p, float size)
{
	float halfsize = size * 0.5;
	float c = floor((p + halfsize) / size);
	p = mod(p + halfsize,size) - halfsize;
	p *= mod(c, 2.0) * 2.0 - 1.0;
	return c;
}

float fCapsule2D(vec2 p, float r, float c)
{
	return mix(abs(p.x) - r, length(vec2(p.x, abs(p.y) - c)) - r, step(c, abs(p.y)));
}

float SineWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    float v = sin(p.x * frequency * PI);
    v *= amplitude;

    float d = 0.0;

    if (solid == false)
    {
        d = abs(v * amplitude - p.y * 0.5);
        d -= line_width;
        return smoothstep(0.0, line_glow, d);
    }
    else
    {
        d = v * amplitude - p.y * 0.5;
        d -= -line_width;
        return smoothstep(0.0, line_glow, -d);
    }
}

float SawWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    float inverse_frequency = 2.0 / frequency;
    vec2 p1 = p;
    pMod1(p1.x, inverse_frequency);

    float d1 = fCapsule2D(p1, 0.0, amplitude);
    p.x += inverse_frequency * 0.5;
    pMod1(p.x, inverse_frequency);
    pR(p, atan(inverse_frequency, amplitude * 2.0));

    float d = fCapsule2D(p, 0.0, 0.5 * length(vec2(inverse_frequency, 2.0 * amplitude)));
	d = min(d, d1);
    d -= line_width;

    if(solid == false)
    {
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, min(d,p.x));
}

float TriangleWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    float inverse_frequency = 1.0 / frequency;
    p.x -= inverse_frequency;
    pModMirror1(p.x, inverse_frequency);
    pR(p, atan(inverse_frequency, amplitude * 2.0));

    float d = fCapsule2D(p, 0.0, 0.5 * length(vec2(inverse_frequency, 2.0 * amplitude)));
    d -= line_width;

    if (solid == false)
    {
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, min(d,p.x));
}

float SquareWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    float inverse_frequency = 0.5 / frequency;
    vec2 p1 = p;
    pMod1(p1.x, 2.0 * inverse_frequency);

    float d1 = fCapsule2D(p1, 0.0, abs(amplitude));
    p.x -= inverse_frequency * 0.5;
    float cell = pMod1(p.x, inverse_frequency);

    if(cell < 0.0) cell = -cell + 1.0;
    if(int(cell * 0.5) % 2 == 1) p.y -= amplitude;
        else p.y += amplitude;

    float d = fCapsule2D(p.yx, 0.0, abs(inverse_frequency));
    d = min(d, d1);
    d -= line_width;

    if (solid == false)
    {
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, p.y);
}

void main()
{
    vec4 rgb = vec4(r,g,b,1.0);
	vec2 uv = texCoord;

    uv -= 0.5;
    pR(uv.xy,uRotate * TAU);
    uv += 0.5;

    // uv.y=0.0;

    float wave = 0.0;
    if      (uWaveSelect == 0.0)
    {
        wave = SineWave     (uv - vec2(uOffSetX,uOffSetY), uAmp,  uFreq , uWidth, uGlow, uSolid);
    }
    else if (uWaveSelect == 1.0)
    {
        wave = SawWave      (uv - vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    else if (uWaveSelect == 2.0)
    {
        wave = TriangleWave (uv - vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    else
    {
        wave = SquareWave   (uv - vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    vec4 col = vec4(0.0);
    if (uInvert )
    {
        col = vec4(vec3(wave),1.0);
    }
    else
    {
        col = vec4(vec3(1.0 - wave),1.0);
    }
    col *= rgb;

    vec4 base=texture2D(tex,texCoord);
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a * amount),1.0);
    outColor= col;
}