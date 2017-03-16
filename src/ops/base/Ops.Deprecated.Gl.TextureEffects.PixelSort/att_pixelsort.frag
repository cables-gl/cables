
precision highp float;
varying vec2 texCoord;
uniform sampler2D tex;
uniform float amount;

uniform float pixelX;



float lumi(vec4 color)
{
  vec3 c= vec3(dot(vec3(0.2126,0.7152,0.0722), color.rgb));
  return (c.r+c.g+c.b)/3.0;
}

void main()
{
    // vec4 col=vec4(1.0,0.0,0.0,1.0);
    vec4 col1=texture2D(tex,vec2(texCoord.x,texCoord.y));
    vec4 col2=texture2D(tex,vec2(min(1.0,texCoord.x+pixelX),texCoord.y));
    
    if(lumi(col1)>lumi(col2))
    {
        col1=col2;
    }
    
    gl_FragColor = col1;
}


