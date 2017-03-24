
precision highp float;
varying vec2 texCoord;
uniform sampler2D tex;
uniform float amount;

uniform float texWidth;
uniform float texHeight;

uniform float mulColor;


const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

vec3 desaturate(vec3 color)
{
    return vec3(dot(vec3(0.2126,0.7152,0.0722), color));
}


void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    
    float pixelX=amount/texWidth;
    float pixelY=amount/texHeight;

    // col=texture2D(tex,texCoord);
    
    float count=1.0;
    
	vec4 horizEdge = vec4( 0.0 );
	horizEdge -= texture2D( tex, vec2( texCoord.x - pixelX, texCoord.y - pixelY ) ) * 1.0;
	horizEdge -= texture2D( tex, vec2( texCoord.x - pixelX, texCoord.y     ) ) * 2.0;
	horizEdge -= texture2D( tex, vec2( texCoord.x - pixelX, texCoord.y + pixelY ) ) * 1.0;
	horizEdge += texture2D( tex, vec2( texCoord.x + pixelX, texCoord.y - pixelY ) ) * 1.0;
	horizEdge += texture2D( tex, vec2( texCoord.x + pixelX, texCoord.y     ) ) * 2.0;
	horizEdge += texture2D( tex, vec2( texCoord.x + pixelX, texCoord.y + pixelY ) ) * 1.0;
	vec4 vertEdge = vec4( 0.0 );
	vertEdge -= texture2D( tex, vec2( texCoord.x - pixelX, texCoord.y - pixelY ) ) * 1.0;
	vertEdge -= texture2D( tex, vec2( texCoord.x    , texCoord.y - pixelY ) ) * 2.0;
	vertEdge -= texture2D( tex, vec2( texCoord.x + pixelX, texCoord.y - pixelY ) ) * 1.0;
	vertEdge += texture2D( tex, vec2( texCoord.x - pixelX, texCoord.y + pixelY ) ) * 1.0;
	vertEdge += texture2D( tex, vec2( texCoord.x    , texCoord.y + pixelY ) ) * 2.0;
	vertEdge += texture2D( tex, vec2( texCoord.x + pixelX, texCoord.y + pixelY ) ) * 1.0;


	vec3 edge = sqrt((horizEdge.rgb/count * horizEdge.rgb/count) + (vertEdge.rgb/count * vertEdge.rgb/count));
// 	edge=vec3(atan(edge.x,edge.y));
	
// 	if(edge.r>1.1)edge=vec3(1.0,1.0,1.0);
// 	else edge=vec3(0.0,0.0,0.0);

// edge*=5.0;


edge=desaturate(edge);

    if(mulColor>0.0)
        edge*=texture2D( tex, texCoord ).rgb*mulColor*4.0;
    
    gl_FragColor = vec4(edge,1.0);

}
    
 