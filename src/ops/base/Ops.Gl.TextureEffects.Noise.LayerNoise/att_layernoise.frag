// @author Jan <LJ> Scheurer - Xe-Development UG
// @copyright undefined development UG


{{MODULES_HEAD}}

UNI int mode;
UNI vec4 attribs;
UNI vec3 scroll;
UNI bool rgba;
UNI float amount;
IN vec2 texCoord;
UNI sampler2D tex;

{{CGL.BLENDMODES}}

#define LINEAR 0
#define EXPONENTIAL 1
#define LOGARITHMIC 2

float rand (vec3 p) {
    return fract(sin(dot(p,vec3(12.4085,48.512313,32.6143)))*42754.71415);
}

const vec2 O = vec2(0,1);

float noise (vec3 p) {
    vec3 b=floor(p),f=fract(p);
    return mix(
        mix(mix(rand(b+O.xxx),rand(b+O.yxx),f.x),mix(rand(b+O.xyx),rand(b+O.yyx),f.x),f.y),
        mix(mix(rand(b+O.xxy),rand(b+O.yxy),f.x),mix(rand(b+O.xyy),rand(b+O.yyy),f.x),f.y),
        f.z
    );
}

float gn(vec3 p){
    float n = 0., fi;
    int numLayers = int(attribs.g);
    for (int i = 1; i < 100; i++) {
        if (i > numLayers) break;
        if (mode == LINEAR)
            fi = float(i),p+=attribs.r;
        else if (mode == EXPONENTIAL)
            fi = float(i*i);
        else if (mode == LOGARITHMIC)
            fi = log(float(i+1)),p+=attribs.r;
        n += noise(p*fi) / fi;
    }
    return n*attribs.b;
}

void main()
{
    vec4 base=texture(tex,texCoord);

    vec2 tc=texCoord;
	#ifdef DO_TILEABLE
	    tc=abs(texCoord-0.5);
	#endif
    vec3 p = vec3(tc * 2. - 1.,0) + scroll;
    vec4 col;
    if (rgba) {
        for(int i = 0; i < 4; i++) {
            col[i] = gn(p*attribs.r);
            p += attribs.r;
        }
    } else
        col = vec4(vec3(gn(p*attribs.r)),1);

    outColor=cgl_blend(base,col,amount);
}