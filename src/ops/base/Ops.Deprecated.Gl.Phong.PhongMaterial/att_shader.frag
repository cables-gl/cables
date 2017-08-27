{{MODULES_HEAD}}
IN mediump vec3 norm;
IN mediump vec3 vert;
uniform mat4 normalMatrix;
IN mat4 mvMatrix;
uniform mat4 modelMatrix;

#ifdef INSTANCING
IN mat4 instModelMat;
#endif

// IN vec3 vTangent;
// IN vec3 vBiTangent;


uniform float r;
uniform float g;
uniform float b;
uniform float a;
uniform float mul;
uniform float shininess;
uniform float normalTexIntensity;

uniform float shadowPass;
uniform vec3 camPos;

uniform float diffuseRepeatX;
uniform float diffuseRepeatY;

#ifdef HAS_TEXTURES
    IN mediump vec2 texCoord;
    #ifdef HAS_TEXTURE_DIFFUSE
        uniform sampler2D tex;
    #endif
    #ifdef HAS_TEXTURE_AO
        uniform sampler2D texAo;
    #endif
    #ifdef HAS_TEXTURE_SPEC
        uniform sampler2D texSpec;
    #endif
    #ifdef HAS_TEXTURE_NORMAL
        uniform sampler2D texNormal;
    #endif
    #ifdef HAS_TEXTURE_OPACITY
        uniform sampler2D texOpacity;
    #endif
#endif

//uniform sampler2D depthTex;

struct Light
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
};

uniform Light lights[4];

void main()
{
    vec4 surfaceColor = vec4(r,g,b,a);
    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
            #ifdef TEXTURED_POINTS
                surfaceColor=texture2D(tex,vec2(gl_PointCoord.x*diffuseRepeatX,(1.0-gl_PointCoord.y)*diffuseRepeatY));
            #endif
            #ifndef TEXTURED_POINTS
                surfaceColor=texture2D(tex,vec2(texCoord.x*diffuseRepeatX,(texCoord.y)*diffuseRepeatY));
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


    if(shadowPass==0.0)
    for(int l=0;l<NUM_LIGHTS;l++)
    {
        float lightIntensity=lights[l].mul*2.5;
        if(lightIntensity>0.0)
        {
            vec3 lightColor = lights[l].color;

            #ifndef HAS_TEXTURE_NORMAL
                vec3 normal = normalize(mat3(normalMatrix) * norm);
            #endif

            #ifdef HAS_TEXTURE_NORMAL
                // #define CALC_TANGENT
                vec3 tnorm= texture2D( texNormal,vec2(texCoord.x*diffuseRepeatX,(texCoord.y)*diffuseRepeatY)  ).xyz*2.0-1.0;
                vec3 tangent,binormal;


                // #ifndef CALC_TANGENT
                // tangent=vTangent;
                // binormal=vBiTangent;
                // #endif
                // float normalScale=normalTexIntensity24.5;
                // #ifdef CALC_TANGENT
                    vec3 c1 = cross(norm, vec3(0.0, 0.0, 1.0));
                    tangent = c1;
                    tangent = normalize(tangent);
                    binormal = cross(norm, tangent);
                    binormal = normalize(binormal);
                    // tangent = c1;
                    // tangent = normalize(vec3(modelMatrix*vec4(tangent,1.0)));
                    // binormal = cross(norm, tangent);
                    // binormal = normalize(vec3(modelMatrix*vec4(binormal,1.0)));
                // #endif

                tnorm = (tangent*tnorm.x + binormal*tnorm.y + norm*tnorm.z);
                vec3 normal = normalize( mat3(normalMatrix) * (norm+tnorm*(normalTexIntensity*30.0)) );

            #endif

            {{MODULE_NORMAL}}

            #ifdef INSTANCING
            vec3 fragPosition = vec3(instModelMat * vec4(vert, 1.0)); //calculate the location of this fragment (pixel) in world coordinates
            #endif
            #ifndef INSTANCING
            vec3 fragPosition = vec3(modelMatrix * vec4(vert, 1.0)); //calculate the location of this fragment (pixel) in world coordinates
            #endif

            vec3 surfaceToLight = normalize(lights[l].pos-fragPosition);
            vec3 surfaceToCamera = normalize(camPos-fragPosition);
            // vec3 normal = normalize(transpose(inverse(mat3(model))) * fragNormal);
            vec3 ambient=vec3(0.0,0.0,0.0);

            //calculate the cosine of the angle of incidence
            float diffuseCoefficient = max(0.0, dot(surfaceToLight,normal));
            vec3 diffuse = diffuseCoefficient * surfaceColor.rgb * lightColor * lightIntensity;

            // specular.....
            vec3 specular=vec3(0.0,0.0,0.0);
            #ifdef DO_RENDER_SPECULAR
                vec3 materialSpecularColor = vec3(1.0,1.0,1.0);

                float specularCoefficient = 0.0;
                if(diffuseCoefficient > 0.0)
                    specularCoefficient = pow(max(0.0, dot(surfaceToCamera, reflect(-surfaceToLight, normal))), shininess);
                specular =(specularCoefficient * materialSpecularColor * lightIntensity*0.2);

                #ifdef HAS_TEXTURE_SPEC
                    specular*=1.0-texture2D( texSpec, texCoord ).rgb;
                #endif
            #endif

            // attenuation
            float distanceToLight = length(lights[l].pos-fragPosition);
            float attenuation = 1.0 / (1.0 + lights[l].attenuation * (distanceToLight * distanceToLight));



            // SPOT LIGHT
            if(lights[l].type!=0.0)
            {
                attenuation=1.0;
                vec3 coneDirection = normalize( (lights[l].target-lights[l].pos) );
                float spotEffect = dot(normalize(coneDirection), normalize(-surfaceToLight));
                float lightToSurfaceAngle = degrees(acos(dot(surfaceToLight, coneDirection)));

                // shadows...
                vec4 shadowCoord = lights[l].depthMVP * vec4(vert,1.0);
                //float s=texture2D( depthTex, shadowCoord.xy  ).z;
                float s=1.0;

                float f=100.0;
                float n=0.1;
                float c=(2.0*n)/(f+n-s*(f-n));
                attenuation=c;

                if( spotEffect < lights[l].cone) attenuation=0.0;
            }

            theColor += ambient + attenuation*(diffuse+(specular) );
        }
    }

    #ifdef DO_GAMME_CORRECT
        vec3 linearColor = theColor;
        vec3 gamma = vec3(1.0/2.2);
        theColor = pow(linearColor, gamma);
    #endif

    vec4 col=vec4(theColor, surfaceColor.a);

    #ifdef HAS_TEXTURE_AO
       col.rgb*=texture2D( texAo, texCoord ).rgb;
    #endif

    {{MODULE_COLOR}}
// col.rgb=normalize(vBiTangent);
    gl_FragColor = col;
}
