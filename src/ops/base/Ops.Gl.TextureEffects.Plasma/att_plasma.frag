#define PI 3.1415926535897932384626433832795

UNI float time;
UNI float w;
UNI float h;
UNI float mul;
UNI float amount;
UNI sampler2D tex;
UNI float offsetX;
UNI float offsetY;

IN vec2 texCoord;

{{CGL.BLENDMODES}}

void main() {
   vec2 size=vec2(w,h);
    float v = 0.0;
    vec2 c = texCoord * size - size/2.0;

    c.x+=offsetX;
    c.y+=offsetY;

    v += sin((c.x+time));
    v += sin((c.y+time)/2.0);
    v += sin((c.x+c.y+time)/2.0);
    c += size/2.0 * vec2(sin(time/3.0), cos(time/2.0));

    v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+time);
    v = v/2.0;

    vec3 newColor = vec3(sin(PI*v*mul/4.0), sin(PI*v*mul), cos(PI*v*mul))*.5 + .5;
    vec4 base=texture(tex,texCoord);

    #ifndef GREY
       vec4 col=vec4( _blend(base.rgb,newColor) ,1.0);
    #endif
    #ifdef GREY
    // .endl()+'       vec4 col=vec4( _blend(base.rgb,vec3((newColor.r+newColor.g+newColor.b)/3.0)) ,1.0);'
           vec4 col=vec4( _blend(base.rgb,vec3(newColor.g)) ,1.0);
    #endif

    outColor=cgl_blend(base,col,amount);

}