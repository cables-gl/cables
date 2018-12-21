var CGL = CGL || {};



CGL.ShaderLibMods=
{
    // quite good random numbers, but somehow don't work in ANGLE 
    "CGL.RANDOM_OLD": function()
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

    // low quality generative ranodm numbers
    "CGL.RANDOM_LOW": function()
    {
        this.name="randomNumber";
        this.srcHeadFrag=''
            .endl()+'float cgl_random(vec2 co)'
            .endl()+'{'
            .endl()+'    return fract(sin(dot(co.xy ,vec2(12.9898,4.1414))) * 358.5453);'
            .endl()+'}'
            
            .endl()+'vec3 cgl_random3(vec2 co)'
            .endl()+'{'
            .endl()+'    return vec3( cgl_random(co),cgl_random(co+0.5711),cgl_random(co+1.5711));'
            .endl()+'}'
    },

    // texture based random numbers
    "CGL.RANDOM_TEX": function()
    {
        this.name="randomNumbertex";
        this.srcHeadFrag=''
            .endl()+'UNI sampler2D CGLRNDTEX;'

            .endl()+'float cgl_random(vec2 co)'
            .endl()+'{'
            .endl()+'    return texture(CGLRNDTEX,co*5711.0).r;'
            .endl()+'}'

            .endl()+'vec3 cgl_random3(vec2 co)'
            .endl()+'{'
            .endl()+'    return texture(CGLRNDTEX,co*5711.0).rgb;'
            .endl()+'}';

        this.onBind=function(cgl,shader)
        {
            if(!shader.rndTexUni)shader.rndTexUni=new CGL.Uniform(shader,'t','CGLRNDTEX',7);
            cgl.setTexture(7, CGL.Texture.getRandomTexture(cgl).tex );
        }
    }

};


