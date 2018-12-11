var CGL = CGL || {};



CGL.ShaderLibMods=
{
    "MOD_RANDOM_OLD": function()
    {
        this.name="randomNumber";
        this.srcHeadFrag=''
            .endl()+'float cgl_random(vec2 co)'
            .endl()+'{'
            .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 437511.5453);'
            .endl()+'}'
    },

    "MOD_RANDOM": function()
    {
        this.name="randomNumbertex";

        this.srcHeadFrag=''
            .endl()+'uniform sampler2D CGLRNDTEX;'

            .endl()+'float cgl_random(vec2 co)'
            .endl()+'{'
            .endl()+'   return texture(CGLRNDTEX,mod(co*3232.2,289.33)*50.2).r;'
            // .endl()+'   return texture(CGLRNDTEX,co*1000.0).r;'
            .endl()+'}'

            .endl()+'float cgl_random(vec3 co)'
            .endl()+'{'
            .endl()+'   return texture(CGLRNDTEX,mod(co.xy*3232.2,289.33)*(50.2+co.z).r;'
            // .endl()+'   return texture(CGLRNDTEX,co*1000.0).r;'
            .endl()+'}'

            .endl()+'vec3 cgl_random3(vec2 co)'
            .endl()+'{'
            .endl()+'   return texture(CGLRNDTEX,mod(co*3232.2,289.33)*50.2).rgb;'
            .endl()+'}';


        this.onBind=function(cgl,shader)
        {
            if(!this.rndTexUni)this.rndTexUni=new CGL.Uniform(shader,'t','CGLRNDTEX',7);
            cgl.setTexture(7, CGL.Texture.getRandomTexture(cgl).tex );
        }
    }

};


