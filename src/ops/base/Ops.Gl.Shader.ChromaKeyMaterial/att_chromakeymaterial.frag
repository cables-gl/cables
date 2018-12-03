{{MODULE_BEGIN_FRAG}}

IN mediump vec2 texCoord;

UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float weightMul;
UNI float white;

vec3 rgb2hsv(vec4 rgb)
{
	float Cmax = max(rgb.r, max(rgb.g, rgb.b));
	float Cmin = min(rgb.r, min(rgb.g, rgb.b));
    float delta = Cmax - Cmin;

	vec3 hsv = vec3(0., 0., Cmax);

	if (Cmax > Cmin)
	{
		hsv.y = delta / Cmax;

		if (rgb.r == Cmax)
			hsv.x = (rgb.g - rgb.b) / delta;
		else
		{
			if (rgb.g == Cmax)
				hsv.x = 2. + (rgb.b - rgb.r) / delta;
			else
				hsv.x = 4. + (rgb.r - rgb.g) / delta;
		}
		hsv.x = fract(hsv.x / 6.);
	}
	return hsv;
}

float chromaKey(vec4 color)
{
    vec4 backgroundColor = vec4(r,g,b,0.0);
    vec3 weights = vec3(4.*weightMul, 1., 2.*weightMul);

    vec3 hsv = rgb2hsv(color);
    vec3 target = rgb2hsv(backgroundColor);
    float dist = length(weights * (target - hsv));

    return 1. - clamp(3. * dist - 1.5, 0., 1.);
}

float random(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (43758.5453));
}

void main()
{
    vec4 col=vec4(1.0,1.0,0.0,1.0);
    {{MODULE_COLOR}}
    col=texture2D(tex,texCoord);

    #ifdef MODE_R
       float maxrb = max( col.g, col.b );
       float perc = min(1.0,(col.r*weightMul-maxrb)*2.0);
    #endif

    #ifdef MODE_G
       float maxrb = max( col.r, col.b );
       float perc = min(1.0,(col.g*weightMul-maxrb)*2.0);
       col.g=min(maxrb,col.g);
    #endif

    #ifdef MODE_COLOR
        float perc=chromaKey(col);
    #endif

    float len=length(col);
    col=normalize(col)*len;

    col.a=1.0-perc;
    outColor= col;
}
