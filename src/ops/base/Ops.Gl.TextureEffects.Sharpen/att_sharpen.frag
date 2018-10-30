
precision highp float;
IN vec2 texCoord;
uniform sampler2D tex;
uniform float amount;

uniform float pX,pY;

const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

float desaturate(vec4 color)
{
  vec3 c= vec3(dot(vec3(0.2126,0.7152,0.0722), color.rgb));
  return (c.r+c.g+c.b)/3.0;
}



void main()
{
    
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    col=texture2D(tex,texCoord);
    
    
    float colorL = desaturate(texture2D(tex, texCoord+vec2(-pX,0) ));
    float colorR = desaturate(texture2D(tex, texCoord+vec2( pX,0) ));
    float colorA = desaturate(texture2D(tex, texCoord+vec2( 0,-pY) ));
    float colorB = desaturate(texture2D(tex, texCoord+vec2( 0, pY) ));
    
    float colorLA = desaturate(texture2D(tex, texCoord+vec2(-pX,pY)));
    float colorRA = desaturate(texture2D(tex, texCoord+vec2( pX,pY)));
    float colorLB = desaturate(texture2D(tex, texCoord+vec2(-pX,-pY)));
    float colorRB = desaturate(texture2D(tex, texCoord+vec2( pX,-pY)));
    
    vec4 final = col + col * amount * (8.0*desaturate(col) - colorL - colorR - colorA - colorB - colorLA - colorRA - colorLB - colorRB);

    outColor= final;

}