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
void pR45(inout vec2 p)
{
	p = (p + vec2(p.y, -p.x))*sqrt(0.5);
}
void pR(inout vec2 p, float a)
{
    float s=sin(a),c=cos(a);p*=mat2(c,s,-s,c);
}
float pMod1(inout float p, float size)
{
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize, size) - halfsize;
	return c;
}
float pModMirror1(inout float p, float size)
{
	float halfsize = size*0.5;
	float c = floor((p + halfsize)/size);
	p = mod(p + halfsize,size) - halfsize;
	p *= mod(c, 2.0)*2.0 - 1.0;
	return c;
}
float fCapsule2D(vec2 p, float r, float c) {
	return mix(abs(p.x) - r, length(vec2(p.x, abs(p.y) - c)) - r, step(c, abs(p.y)));
}

float SineWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    // compute the (tiling) wave shape (at the given frequency)
    //wave = abs(sin(uv.x) - uv.y);
    float v = sin(p.x * frequency * PI)  ;
    // scale for amplitude
    v *= amplitude;
    // get the distance in Y
    float d = 0.0;
    //float d = abs(v * amplitude - p.y);
    //float d = v * amplitude - p.y;//one half white //************

    if (solid == false)
    {
        // get shape with glow to allow soft drawing
        d = abs(v * amplitude - p.y*0.5);
        // get aliased shape
        d -= line_width;
        return smoothstep(0.0, line_glow, d);
    }
    else
        d = v * amplitude - p.y*0.5;
        // get aliased shape
        d -= -line_width;
        return smoothstep(0.0, line_glow, -d);
}

float SawWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow,bool solid)
{
    // we most often want to divide by frequency so let's precalc that
    float inverse_frequency = 2.0 / frequency;

    // draw vertical bars
    // copy point
    vec2 p1 = p;
    // modulate to get repeated waves
    pMod1(p1.x, inverse_frequency);
    // get distance to line (with round caps)
	float d1 = fCapsule2D(p1, 0.0, amplitude);

    // draw saw
    // offset so it lines up
    p.x += inverse_frequency * 0.5;
    // we basically compute the rectangle between 2 of the previous vertical bars and draw the diagonal
    // modulate to get repeated waves
    pMod1(p.x, inverse_frequency);
    // rotate to the right angle (atan determines the angle of the diagonal of a rectangle)
    pR(p, atan(inverse_frequency, amplitude * 2.0));
    // draw the line, the length is determined by the diagonal of a rectangle
    float d = fCapsule2D(p, 0.0, 0.5 * length(vec2(inverse_frequency, 2.0 * amplitude)));

    // combine shapes
	d = min(d, d1);

    // get aliased shape
    d -= line_width;
    // get shape with glow to allow soft drawing
    if(solid == false)
    {
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, min(d,p.x));//white half
}

float TriangleWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    // we most often want to divide by frequency so let's precalc that
    float inverse_frequency = 1.0 / frequency;

    // draw triangle
    // offset to make periods align with other wave forms
    p.x -= inverse_frequency;
    // we basically compute the rectangle between 2 of the previous vertical bars and draw the diagonal
    // modulate to get repeated waves, mirror to get triangle
    pModMirror1(p.x, inverse_frequency);
    // rotate to the right angle (atan determines the angle of the diagonal of a rectangle)
    pR(p, atan(inverse_frequency, amplitude * 2.0));
    // draw the line, the length is determined by the diagonal of a rectangle
    float d = fCapsule2D(p, 0.0, 0.5 * length(vec2(inverse_frequency, 2.0 * amplitude)));

    // get aliased shape
    d -= line_width;
    // get shape with glow to allow soft drawing
    if (solid == false)
    {
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, min(d,p.x));

}

float SquareWave(vec2 p, float amplitude, float frequency, float line_width, float line_glow, bool solid)
{
    // we most often want to divide by frequency so let's precalc that
    float inverse_frequency = 0.5 / frequency;

    // draw vertical bars
    // copy point
    vec2 p1 = p;
    // modulate to get repeated waves
    pMod1(p1.x, 2.0 * inverse_frequency);
    // get distance to line (with round caps)
	float d1 = fCapsule2D(p1, 0.0, abs(amplitude));

    // draw horizontal bars
    // offset so it lines up
    p.x -= inverse_frequency * 0.5;
    // modulate to get repeated waves
    float cell = pMod1(p.x, inverse_frequency);
    // offset the line to the top or bottom based on the cell index
    if(cell < 0.0) // flooring goes the wrong way on negative numbers
        cell = -cell + 1.0;
    if(int(cell * 0.5) % 2 == 1)
    	p.y -= amplitude;
    else
        p.y += amplitude;
    // draw the line, the length is determined by the frequency
    float d = fCapsule2D(p.yx, 0.0, abs(inverse_frequency));

    // combine shapes
	d = min(d, d1);

    // get aliased shape
    d -= line_width;
    if (solid == false)
    {
        // get shape with glow to allow soft drawing
        return smoothstep(0.0, line_glow, d);
    }
    else
        return smoothstep(0.0, line_glow, p.y);//white half
}

void main()
{
    vec4 rgb = vec4(r,g,b,1.0);
    //vec2 res = vec2(uResX,uResY);
    // dividing by XY because we don't want anything to do with aspect ratio
    // just pure -1 to 1 on both X and Y
	vec2 uv = texCoord ;////this breaks chains -> (gl_FragCoord.xy * 2.0 - res) / res;
    // if we go ultra wide screen the wave will start squishing alot when rotating, because all coordinates are from -1 to 1
    // everything still works fi the coordinates go from any whole number
    // we can multiply with about 14 to get our ultra wide setup, or something less to demonstrate on a normal screen
    //uv.x +=uTime;
    uv.x *= 1.0; // 14.0;

    uv -= 0.5;
    pR(uv.xy,uRotate * TAU);
    uv += 0.5;
    //uv.x+=2.0;

    float wave = 0.0;
    if      (uWaveSelect == 0.0)
    {
        wave = SineWave     (uv-vec2(uOffSetX,uOffSetY), uAmp,  uFreq , uWidth, uGlow, uSolid);
    }
    else if (uWaveSelect == 1.0)
    {
        wave = SawWave      (uv-vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    else if (uWaveSelect == 2.0)
    {
        wave = TriangleWave   (uv-vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    else
    {
        wave = SquareWave   (uv-vec2(uOffSetX,uOffSetY), uAmp,  uFreq, uWidth, uGlow, uSolid);
    }
    vec4 col = vec4(0.0);
    if (uInvert )
    {
        col =  vec4(vec3(wave),1.0);
    }
    else
    {
        col =  vec4(vec3(1.0-wave),1.0);//remove -1 to invert
    }
    col *= rgb;
    //original texture
    vec4 base=texture2D(tex,texCoord);
    //blend stuff
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}