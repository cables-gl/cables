var CGL = CGL || {};



CGL.ShaderLibMods=
{
    "LIB_RANDOM_OLD": function()
    {
        this.name="randomNumber";
        this.srcHeadFrag=''
            .endl()+'float cgl_random(vec2 co)'
            .endl()+'{'
            .endl()+'    return fract(sin(dot(co.xy ,vec2(12.9898,4.1414))) * 432758.5453);'
            .endl()+'}'
            
            .endl()+'vec3 cgl_random3(vec2 co)'
            .endl()+'{'
            .endl()+'    return vec3( cgl_random(co),cgl_random(co+0.5711),cgl_random(co+1.5711));'
            .endl()+'}'
    },

    // "LIB_RANDOM_BBS": function()
    // {
    //     this.name="randomNumberBBS";
    //     this.srcHeadFrag=''
    //         // implementation of the blumblumshub hash
    //         // as described in MNoise paper http://www.cs.umbc.edu/~olano/papers/mNoise.pdf
    //         .endl()+'vec4 BBS_coord_prepare(vec4 x) { return x - floor(x * ( 1.0 / 61.0 )) * 61.0; }'
    //         .endl()+'vec4 BBS_permute(vec4 x) { return fract( x * x * ( 1.0 / 61.0 )) * 61.0; }'
    //         .endl()+'vec4 BBS_permute_and_resolve(vec4 x) { return fract( x * x * ( 1.0 / 61.0 ) ); }'

    //         .endl()+'float cgl_random( vec2 gridcell )'
    //         .endl()+'{'
    //         .endl()+'    vec4 hash_coord = BBS_coord_prepare( vec4( gridcell.xy, gridcell.xy + 1.2 ) );'
    //         .endl()+'    vec4 hash = BBS_permute( hash_coord.xzxz ); ' // * 7.0 will increase variance close to origin
    //         .endl()+'    return BBS_permute_and_resolve( hash + hash_coord.yyww*223.0 ).r;'
    //         .endl()+'}';
    // },
    // "LIB_RANDOM_TEX": function()
    // {
    //     this.name="randomNumbertex";

    //     this.srcHeadFrag=''
    //         .endl()+'uniform sampler2D CGLRNDTEX;'

    //         .endl()+'float cgl_random(vec2 co)'
    //         .endl()+'{'
    //         // .endl()+'   return texture(CGLRNDTEX,mod(co*3232.2,289.33)*50.2).r;'
    //         .endl()+'    return texture(CGLRNDTEX,co*10.0).r;'
    //         .endl()+'}'

    //         // .endl()+'float cgl_random(vec3 co)'
    //         // .endl()+'{'
    //         // // .endl()+'   return texture(CGLRNDTEX,mod(co.xy*3232.2,289.33)*(50.2+co.z)).r;'
    //         // .endl()+'   return texture(CGLRNDTEX,co.xy).r;'
    //         // .endl()+'}'

    //         .endl()+'vec3 cgl_random3(vec2 co)'
    //         .endl()+'{'
    //         // .endl()+'   return texture(CGLRNDTEX,mod(co*3232.2,289.33)*50.2).rgb;'
    //         .endl()+'    return texture(CGLRNDTEX,co).rgb;'
    //         .endl()+'}';


    //     this.onBind=function(cgl,shader)
    //     {
    //         if(!this.rndTexUni)this.rndTexUni=new CGL.Uniform(shader,'t','CGLRNDTEX',7);
    //         cgl.setTexture(7, CGL.Texture.getRandomTexture(cgl).tex );
    //     }
    // }

};


