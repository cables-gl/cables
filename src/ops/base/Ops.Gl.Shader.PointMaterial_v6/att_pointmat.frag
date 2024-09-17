
{{MODULES_HEAD}}

UNI vec4 color;
UNI float atlasNumX;

// IN vec2 pointCoord;
IN float ps;
IN vec2 texCoord;

#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D diffTex;
#endif
#ifdef HAS_TEXTURE_MASK
    UNI sampler2D texMask;
#endif
#ifdef HAS_TEXTURE_COLORIZE
    IN vec4 colorize;
#endif
#ifdef HAS_TEXTURE_OPACITY
    IN float opacity;
#endif

#ifdef HAS_TEXTURE_ROT
    UNI sampler2D texRot;
#endif


#ifdef USE_ATLAS
    IN float randAtlas;
    #ifdef HAS_TEXTURE_ATLASLOOKUP
        UNI sampler2D texAtlasLookup;
    #endif
#endif


#ifdef VERTEX_COLORS
    IN vec4 vertexColor;
#endif

vec3 lumcoeff = vec3(0.299,0.587,0.114);

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}


void main()
{
    #ifdef FLIP_TEX
        vec2 pointCoord=vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y));
    #endif
    #ifndef FLIP_TEX
        vec2 pointCoord=gl_PointCoord;
    #endif

    #ifdef HAS_TEXTURE_ROT
        float r=texture(texRot,texCoord).r;
        pointCoord-=vec2(0.5);
        pR(pointCoord,r*TAU);
        pointCoord+=vec2(0.5);
    #endif

    vec2 origPointCoord=pointCoord;


    #ifdef USE_ATLAS

        float atlasIdx=randAtlas;

        #ifdef HAS_TEXTURE_ATLASLOOKUP
            atlasIdx=texture(texAtlasLookup,texCoord).r;
        #endif

        #ifdef ATLAS_XFADE
            vec2 pointCoord2=vec2(origPointCoord);
            pointCoord2.x=origPointCoord.x/atlasNumX+ceil(atlasIdx)*(1.0/atlasNumX);
        #endif

        pointCoord.x=origPointCoord.x/atlasNumX+floor(atlasIdx)*(1.0/atlasNumX);


    #endif

    {{MODULE_BEGIN_FRAG}}

    if(ps<1.0)discard;

    vec4 col=color;

    #ifdef HAS_TEXTURE_MASK
        float mask;
        #ifdef TEXTURE_MASK_R
            mask=texture(texMask,pointCoord).r;
        #endif
        #ifdef TEXTURE_MASK_A
            mask=texture(texMask,pointCoord).a;
        #endif
        #ifdef TEXTURE_MASK_LUMI
        	mask = dot(texture(texMask,pointCoord).rgb, lumcoeff);
        #endif

        #ifdef ATLAS_XFADE
            float mask2=texture(texMask,pointCoord2).r;

            #ifdef TEXTURE_MASK_A
                mask2=texture(texMask,pointCoord2).a;
            #endif
            #ifdef TEXTURE_MASK_LUMI
            	mask2 = dot(texture(texMask,pointCoord2).rgb, lumcoeff);
            #endif

            mask=mix(mask,mask2,fract(atlasIdx));
        #endif
    #endif

    #ifdef HAS_TEXTURE_DIFFUSE

        col=texture(diffTex,pointCoord);

        #ifdef ATLAS_XFADE
            vec4 col2=texture(diffTex,pointCoord2);
            col=mix(col,col2,fract(atlasIdx));
        #endif

        #ifdef COLORIZE_TEXTURE
            col.rgb*=color.rgb;
        #endif
    #endif

    col.a*=color.a;


    #ifdef MAKE_ROUND

        #ifndef MAKE_ROUNDAA
            if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;
        #endif

        #ifdef MAKE_ROUNDAA
            float circ=(gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5);

            float a=smoothstep(0.25,0.25-fwidth(gl_PointCoord.x),circ);
            if(a==0.0)discard;
            col.a=a*color.a;
        #endif
    #endif

    #ifdef HAS_TEXTURE_COLORIZE
        col*=colorize;
    #endif

    #ifdef TEXTURE_COLORIZE_MUL
        col*=color;
    #endif

    #ifdef HAS_TEXTURE_MASK
        col.a*=mask;
    #endif

    #ifdef HAS_TEXTURE_OPACITY
        col.a*=opacity;
    #endif

    #ifdef VERTEX_COLORS
        col.rgb = vertexColor.rgb;
        col.a *= vertexColor.a;
    #endif

    if (col.a <= 0.0) discard;

    #ifdef HAS_TEXTURE_COLORIZE
        col*=colorize;
    #endif

    {{MODULE_COLOR}}


    outColor = col;
}
