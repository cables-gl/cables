
{{MODULES_HEAD}}

UNI vec4 color;
IN vec2 texCoord;
IN vec2 pointCoord;
IN float ps;

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
#ifdef VERTEX_COLORS
    IN vec3 vertexColor;
#endif

void main()
{
    #ifdef FLIP_TEX
        vec2 pointCoord=vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y));
    #endif
    #ifndef FLIP_TEX
        vec2 pointCoord=gl_PointCoord;
    #endif
    {{MODULE_BEGIN_FRAG}}

    if(ps<1.0)discard;

    vec4 col=color;

    #ifdef HAS_TEXTURES

        #ifdef HAS_TEXTURE_MASK
            float mask;
            #ifdef TEXTURE_MASK_R
                mask=texture(texMask,pointCoord).r;
            #endif
            #ifdef TEXTURE_MASK_A
                mask=texture(texMask,pointCoord).a;
            #endif
            #ifdef TEXTURE_MASK_LUMI
            	vec3 lumcoeff = vec3(0.299,0.587,0.114);
            	mask = dot(texture(texMask,pointCoord).rgb, lumcoeff);
            #endif

        #endif

        #ifdef HAS_TEXTURE_DIFFUSE
            col=texture(diffTex,pointCoord);
            #ifdef COLORIZE_TEXTURE
              col.rgb*=color.rgb;
            #endif
        #endif
        col.a*=color.a;
    #endif

    {{MODULE_COLOR}}

    #ifdef MAKE_ROUND

        #ifndef MAKE_ROUNDAA
            if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;
        #endif

        #ifdef MAKE_ROUNDAA
            float circ=(gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5);

            float a=smoothstep(0.25,0.25-fwidth(gl_PointCoord.x),circ);
            if(a==0.0)discard;
            col.a=a;
            // col.r=0.0;
        #endif
    #endif

    #ifdef VERTEX_COLORS
        col.rgb*=vertexColor;
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


    if(col.a<=0.0)discard;

    outColor = col;
}
