IN vec2 texCoord;
UNI sampler2D tex;

#ifdef HAS_TEXMAP
    UNI sampler2D texMap;
    UNI vec2 mapPos;
    UNI vec2 mapSize;
#endif
#ifdef HAS_TEXMASK
    UNI sampler2D texMask;
#endif

UNI float width;
UNI float height;
UNI float x;
UNI float y;
UNI float inner;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

UNI float aspect;
UNI float amount;
UNI float rotate;
UNI float roundness;

#define DEG2RAD 0.785398163397

{{CGL.BLENDMODES3}}

mat2 rot(float angle)
{
    float s=sin(angle);
    float c=cos(angle);

    return mat2(c,-s,s,c);
}

void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 col=vec4(r,g,b,a);
    vec2 p=texCoord;

    float d=1.0;

    vec2 pos=vec2(x,y);

    vec2 size=vec2(width/2.0,height/2.0);


    vec2 pp=p-pos;
    #ifndef CENTER
        pp-=vec2(size.x,size.y*aspect);
    #endif

    pp=pp*rot(rotate*DEG2RAD/45.0);
    vec2 mapTc=((pp/size)+1.0)/2.0;

    #ifdef HAS_TEXMAP
        vec4 mapCol=vec4(1.0);

        mapTc=clamp(mapTc,0.0,1.0);

        vec2 _mapPos=mapPos;
        vec2 _mapSize=mapSize;

        #ifdef COORDS_PIXELS
            _mapPos/=float(textureSize(texMap,0));
            _mapSize/=float(textureSize(texMap,0));
        #endif

        mapTc*=_mapSize;
        mapTc+=_mapPos;

        // if(mapTc.x>0.0 && mapTc.x<1.0 && mapTc.y>0.0 && mapTc.y<1.0)
        mapCol=texture(texMap,mapTc);
    #endif


    float roundn=roundness*min(size.x,size.y)*aspect;

    vec2 ssize=max(vec2(size.x,size.y*aspect)-roundn,0.0);
    vec2 absPos=abs(pp)-ssize;

    d=max(absPos.x,absPos.y);
    d=min(d,length(max(absPos,0.0))-roundn);


    if(inner>0.0)
    {
        vec2 absPosInner=abs(pp)-inner*ssize;
        float dd=max(absPosInner.x,absPosInner.y);
        d*=min(dd,length(max(absPosInner,0.0))-roundn);
    }


    #ifdef HAS_TEXMAP
        col*=mapCol;
    #endif

    d=1.0-step(0.0,d);

    col=cgl_blendPixel(base,col,amount*d);

    #ifdef HAS_TEXMASK
        col.a*=texture(texMask,texCoord).r;
    #endif

    outColor=col;

}



