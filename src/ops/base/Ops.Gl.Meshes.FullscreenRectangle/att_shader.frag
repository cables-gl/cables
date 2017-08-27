
uniform sampler2D tex;
IN vec2 texCoord;

precision highp float;

void main()
{
   gl_FragColor = texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));

}
//sdsdsd