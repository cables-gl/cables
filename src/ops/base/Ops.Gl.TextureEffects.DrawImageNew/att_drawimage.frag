#ifdef HAS_TEXTURES
    IN vec2 texCoord;
    UNI sampler2D tex;
    UNI sampler2D image;
#endif

IN mat3 transform;
UNI float rotate;
{{BLENDCODE}}

#ifdef HAS_TEXTUREALPHA
   UNI sampler2D imageAlpha;
#endif

UNI float amount;

void main()
{
    vec4 blendRGBA=vec4(0.0,0.0,0.0,1.0);
    #ifdef HAS_TEXTURES
        vec2 tc=texCoord;

        #ifdef TEX_FLIP_X
            tc.x=1.0-tc.x;
        #endif
        #ifdef TEX_FLIP_Y
            tc.y=1.0-tc.y;
        #endif

        #ifdef TEX_TRANSFORM
            vec3 coordinates=vec3(tc.x, tc.y,1.0);
            tc=(transform * coordinates ).xy;
        #endif
    
        blendRGBA=texture(image,tc);
        
        vec3 blend=blendRGBA.rgb;
        vec4 baseRGBA=texture(tex,texCoord);
        vec3 base=baseRGBA.rgb;
        
        vec3 colNew=_blend(base,blend);

        #ifdef REMOVE_ALPHA_SRC
            blendRGBA.a=1.0;
        #endif

        #ifdef HAS_TEXTUREALPHA
            vec4 colImgAlpha=texture(imageAlpha,texCoord);
            float colImgAlphaAlpha=colImgAlpha.a;

            #ifdef ALPHA_FROM_LUMINANCE
                vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), colImgAlpha.rgb ));
                colImgAlphaAlpha=(gray.r+gray.g+gray.b)/3.0;
            #endif

            blendRGBA.a=colImgAlphaAlpha*blendRGBA.a;
        #endif


    #endif
    
    blendRGBA.rgb=mix( colNew, base ,1.0-blendRGBA.a*amount);
    
    blendRGBA.a=1.0;
    
    
    outColor= blendRGBA;

}