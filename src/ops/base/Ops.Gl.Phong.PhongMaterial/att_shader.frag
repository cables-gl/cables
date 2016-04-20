precision mediump float;
{{MODULES_HEAD}}
varying mediump vec3 norm;
varying mediump vec3 vert;
uniform mat4 normalMatrix;
varying mat4 mvMatrix;
uniform mat4 modelMatrix;

uniform float r;
uniform float g;
uniform float b;
uniform float a;
uniform float mul;
uniform float shininess;

uniform float shadowPass;
uniform vec3 eyePos;

uniform float diffuseRepeatX;
uniform float diffuseRepeatY;

#ifdef HAS_TEXTURES
    varying mediump vec2 texCoord;
    #ifdef HAS_TEXTURE_DIFFUSE
        uniform sampler2D tex;
    #endif
    #ifdef HAS_TEXTURE_AO
        uniform sampler2D texAo;
    #endif
    #ifdef HAS_TEXTURE_SPEC
        uniform sampler2D texSpec;
    #endif
    #ifdef HAS_TEXTURE_OPACITY
        uniform sampler2D texOpacity;
    #endif
#endif

uniform sampler2D depthTex;

uniform struct Light
{
    float type;
    float attenuation;
    vec3 pos;
    vec3 target;
    vec3 color;
    float intensity;
    float cone;
    mat4 depthMVP;
    float mul;
} light;

uniform Light lights[16];

void main()
{
    vec4 surfaceColor = vec4(r,g,b,a);
    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
            #ifdef TEXTURED_POINTS
                surfaceColor=texture2D(tex,vec2(gl_PointCoord.x*diffuseRepeatX,(1.0-gl_PointCoord.y)*diffuseRepeatY));
            #endif
            #ifndef TEXTURED_POINTS
                surfaceColor=texture2D(tex,vec2(texCoord.x*diffuseRepeatX,(1.0-texCoord.y)*diffuseRepeatY));
            #endif
            surfaceColor.a*=a;
            #ifdef COLORIZE_TEXTURE
                surfaceColor.r*=r;
                surfaceColor.g*=g;
                surfaceColor.b*=b;
            #endif
        #endif
    #endif

    vec3 theColor=vec3(0.0,0.0,0.0);
    vec3 specular;

    if(shadowPass==0.0)
    for(int l=0;l<NUM_LIGHTS;l++)
    {
        if(lights[l].mul>0.0)
        {
            vec3 lightColor = lights[l].color;

            vec3 fragPosition = vec3(modelMatrix * vec4(vert, 1.0)); //calculate the location of this fragment (pixel) in world coordinates
            vec3 surfaceToLight = normalize(lights[l].pos-fragPosition);
            vec3 surfaceToCamera = normalize(eyePos-fragPosition);
            vec3 normal = normalize(normalMatrix * vec4(norm,1.0)).xyz;

            //calculate the cosine of the angle of incidence
            float brightness = dot(normal, surfaceToLight) / (length(surfaceToLight) * length(normal));
            brightness = clamp(brightness, 0.0, 1.0);

            // attenuation
            float distanceToLight = length(surfaceToLight);
            float attenuation = 1.0 / (1.0 + lights[l].attenuation * distanceToLight * distanceToLight);

            // specular.....
            vec3 materialSpecularColor = vec3(1.0,1.0,1.0);
            float diffuseCoefficient = max(0.0, dot(normal, surfaceToLight));

            float specularCoefficient = 0.0;
            if(diffuseCoefficient > 0.0)
            specularCoefficient = pow(max(0.0, dot(surfaceToCamera, reflect(surfaceToLight, normal))), shininess);
            specular =(specularCoefficient * materialSpecularColor * 1.0);
            #ifdef HAS_TEXTURE_SPEC
                specular*=1.0-texture2D( texSpec, texCoord ).rgb;
            #endif


            // SPOT LIGHT
            if(lights[l].type!=0.0)
            {
                attenuation=1.0;
                vec3 coneDirection = normalize( (lights[l].target-lights[l].pos) );
                float spotEffect = dot(normalize(coneDirection), normalize(-surfaceToLight));
                float lightToSurfaceAngle = degrees(acos(dot(surfaceToLight, coneDirection)));

                // shadows...
                vec4 shadowCoord = lights[l].depthMVP * vec4(vert,1.0);
                float s=texture2D( depthTex, shadowCoord.xy  ).z;

                //    theColor.r=s;
                //    if(s<shadowCoord.z)brightness=0.0;
                float f=100.0;
                float n=0.1;
                float c=(2.0*n)/(f+n-s*(f-n));
                attenuation=c;

                if( spotEffect <lights[l].cone) attenuation=0.0;
            }

            brightness *= attenuation*lights[l].mul;
            theColor+=(lightColor*brightness);
       }
   }

    vec3 finalColor = theColor * surfaceColor.rgb+specular;

    #ifdef DO_GAMME_CORRECT
        vec3 linearColor = finalColor;
        vec3 gamma = vec3(1.0/2.2);
        finalColor = pow(linearColor, gamma);
    #endif

    vec4 col=vec4(finalColor, surfaceColor.a);

    #ifdef HAS_TEXTURE_AO
       col.rgb*=texture2D( texAo, texCoord ).rgb;
    #endif

    {{MODULE_COLOR}}

    gl_FragColor = col;
}
