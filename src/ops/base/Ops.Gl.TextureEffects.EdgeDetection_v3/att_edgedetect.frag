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

{{CGL.BLENDMODES}}

void main()
{
    // vec4 col=vec4(1.0,0.0,0.0,1.0);

    // float pixelX=0.27/texWidth;
    // float pixelY=0.27/texHeight;
    float pixelX=(width+0.01)*4.0/texWidth;
    float pixelY=(width+0.01)*4.0/texHeight;

vec2 tc=texCoord;
// #ifdef OFFSETPIXEL
    tc.x+=1.0/texWidth*0.5;
    tc.y+=1.0/texHeight*0.5;
// #endif
    // col=texture(tex,texCoord);

    float count=1.0;

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


	vec3 edge = sqrt((horizEdge.rgb/count * horizEdge.rgb/count) + (vertEdge.rgb/count * vertEdge.rgb/count));

    edge=desaturate(edge);
    edge*=strength;

    if(mulColor>0.0) edge*=texture( tex, texCoord ).rgb*mulColor*4.0;
    edge=max(min(edge,1.0),0.0);

    //blend section
    vec4 col=vec4(edge,1.0);
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,col,amount);
}

