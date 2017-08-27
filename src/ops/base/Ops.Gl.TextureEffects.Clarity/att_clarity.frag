
precision highp float;
IN vec2 texCoord;
uniform sampler2D tex;
uniform float amount;

uniform float pX,pY;


vec3 desaturate(vec4 color)
{
  vec3 c= vec3(dot(vec3(0.2126,0.7152,0.0722), color.rgb));
  return c;
}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    col=texture2D(tex,texCoord);
    
    vec3 gray=desaturate(col);

    vec3 m=smoothstep(0.2,0.5,gray)*smoothstep(0.75,0.5,gray);

    vec4 col2=vec4(1.0);

    col2.rgb = ((col.rgb - 0.5) * max(( vec3(amount)*m+0.5)*2.0, 0.0))+0.5;

    gl_FragColor = col2;
}


