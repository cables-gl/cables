IN vec2 texCoord;
UNI sampler2D tex;

UNI float sides;
UNI float angle;
UNI float amount;

UNI float slidex;
UNI float slidey;
UNI float centerX;
UNI float centerY;
UNI float aspect;

const float tau = 6.28318530718;

{{CGL.BLENDMODES3}}

void main()
{
    vec2 center=vec2(centerX,centerY/aspect);

	vec2 loc = texCoord;
	loc.y/=aspect;

	float r = distance(center, loc);
	float a = atan ((loc.y-center.y),(loc.x-center.x));

	// kaleidoscope
	a = mod(a, tau/sides);
	a = abs(a - tau/sides/2.);

	loc.x = r * cos(a + tau * angle);
	loc.y = r * sin(a + tau * angle);

	loc = (center + loc) *2.1;

	loc.x = mod(loc.x + slidex, 1.0);
	loc.y = mod(loc.y + slidey, 1.0);

	if(loc.x < 0.0)loc.x = mod(abs(loc.x),1.0);
	if(loc.y < 0.0)loc.y = mod(abs(loc.y),1.0);

	if(loc.x > 1.0) loc.x = mod(abs(1.0-loc.x),1.0);
	if(loc.y > 1.0) loc.y = mod(abs(1.0-loc.y),1.0);

	vec4 col=texture(tex,loc);
	vec4 base=texture(tex,texCoord);
	base.a=0.0;
    outColor= cgl_blendPixel(base,col,amount);

}
