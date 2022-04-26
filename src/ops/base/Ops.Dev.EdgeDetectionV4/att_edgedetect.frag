IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float width;
UNI float strength;
UNI float texWidth;
UNI float texHeight;
UNI float mulColor;

const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

vec3 desaturate(vec3 color)
{
    return vec3(dot(vec3(0.2126,0.7152,0.0722), color));
}

{{CGL.BLENDMODES3}}

void main()
{
    float pixelX=(width+0.01)*4.0/texWidth;
    float pixelY=(width+0.01)*4.0/texHeight;

    vec2 tc=texCoord;
    tc.x+=1.0/texWidth*0.5;
    tc.y+=1.0/texHeight*0.5;

    float count=1.0;
    vec4 base=texture(tex,texCoord);

	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y - pixelY ) ) * 1.0;
	horizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y     ) ) * 2.0;
	horizEdge -= texture( tex, vec2( tc.x - pixelX, tc.y + pixelY ) ) * 1.0;
	horizEdge += texture( tex, vec2( tc.x + pixelX, tc.y - pixelY ) ) * 1.0;
	horizEdge += texture( tex, vec2( tc.x + pixelX, tc.y     ) ) * 2.0;
	horizEdge += texture( tex, vec2( tc.x + pixelX, tc.y + pixelY ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= texture( tex, vec2( tc.x - pixelX, tc.y - pixelY ) ) * 1.0;
	vertEdge -= texture( tex, vec2( tc.x    , tc.y - pixelY ) ) * 2.0;
	vertEdge -= texture( tex, vec2( tc.x + pixelX, tc.y - pixelY ) ) * 1.0;
	vertEdge += texture( tex, vec2( tc.x - pixelX, tc.y + pixelY ) ) * 1.0;
	vertEdge += texture( tex, vec2( tc.x    , tc.y + pixelY ) ) * 2.0;
	vertEdge += texture( tex, vec2( tc.x + pixelX, tc.y + pixelY ) ) * 1.0;

	vec3 edge = sqrt(( (horizEdge.rgb*horizEdge.a)/count * (horizEdge.rgb*horizEdge.a)/count) + ((vertEdge.rgb*vertEdge.a)/count * (vertEdge.rgb*vertEdge.a)/count));

    edge=desaturate(edge);
    edge*=strength;

    if(mulColor>0.0) edge*=texture( tex, texCoord ).rgb*mulColor*4.0;
    edge=max(min(edge,1.0),0.0);

    vec4 col=vec4(edge,base.a+edge.r);

    outColor=cgl_blendPixel(base,col,amount);
}

