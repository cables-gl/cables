{{MODULES_HEAD}}

#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D texDiffuse;
#endif
#ifdef HAS_TEXTURE_SPECULAR
    UNI sampler2D texSpecular;
#endif
#ifdef HAS_TEXTURE_AO
    UNI sampler2D texAo;
#endif
#ifdef HAS_TEXTURE_EMISSIVE
    UNI sampler2D texEmissive;
#endif

#ifdef ENABLE_FRESNEL
    UNI float fresnel;
#endif

#ifdef ENABLE_SPECULAR
    UNI float specShininess;
    UNI float specAmount;
#endif


#ifdef HAS_TEXTURE_NORMAL
    UNI sampler2D texNormal;
#endif
    UNI vec3 camPos;
    IN vec3 EyeDirection_cameraspace;
    // IN vec3 vertexPos;

    IN vec3 EyeDirection_tangentspace;
    // IN vec3 LightDirection_tangentspace;
    IN mat3 TBN;
    // IN mat4 vMatrix;
// #endif

IN vec3 mvPos;
IN vec2 texCoord;

IN vec3 norm;
IN vec4 modelPos;
// IN mat3 normalMatrix;
UNI mat4 normalMatrix;
UNI mat4 viewMatrix;
UNI float r,g,b,a;

struct Light {
  vec3 pos;
  vec3 color;
  vec3 ambient;
  vec3 specular;
  float falloff;
  float radius;
  float mul;
};

UNI Light lights[NUM_LIGHTS];


float getfallOff(Light light,float distLight)
{
    float denom = distLight / light.radius + 1.0;
    float attenuation = 1.0 / (denom*denom);
    float t = (attenuation - 0.1) / (1.0 - 0.1);

    t=t* (20.0*light.falloff*20.0*light.falloff);

    return min(1.0,max(t, 0.0));
}

#ifdef ENABLE_FRESNEL
float calcFresnel(vec3 direction, vec3 normal)
{
    vec3 nDirection = normalize( direction );
    vec3 nNormal = normalize( normal );
    vec3 halfDirection = normalize( nNormal + nDirection );

    float cosine = dot( halfDirection, nDirection );
    float product = max( cosine, 0.0 );
    float factor = pow( product, 5.0 );

    return factor;
}
#endif

#ifdef ENABLE_SPECULAR
    float phongSpecular( vec3 lightDirection, vec3 viewDirection, vec3 surfaceNormal, float shininess)
    {
        vec3 R = reflect(lightDirection, surfaceNormal);
        float r= pow(max(0.0, dot(viewDirection, R)), shininess);

        return r;
    }
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    float alpha=a;
    float specular=0.0;

    vec3 col=vec3(0.0);
    vec3 normal = normalize(mat3(normalMatrix)*mat3(viewMatrix)*norm);

    #ifdef DOUBLESIDED
        if(!gl_FrontFacing)normal*=vec3(-1);
    #endif

    #ifdef HAS_TEXTURE_NORMAL
        vec3 TextureNormal_tangentspace = normalize(texture(texNormal, texCoord).rgb*2.0-1.0);
    #endif

    vec3 eyevector = normalize( camPos);

    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        vec3 lightVector = normalize( light.pos);

        vec3 lightModelDiff=light.pos - modelPos.xyz;
        vec3 lightDir = normalize(lightModelDiff);

      	float distance = length( lightModelDiff );
        float falloff=getfallOff(light, distance);
        #ifndef SHOW_FALLOFF
            falloff=1.0;
        #endif

        #ifdef HAS_TEXTURE_NORMAL

            // 	vec3 LightDirection_tangentspace =  ( ( TBN*(vec4(light.pos,1.0)).xyz  ) ).xyz+modelPos.xyz;
            vec3 LightDirection_tangentspace =  TBN*lightModelDiff;

            // vec3 lightModelDiff=light.pos - modelPos.xyz;

          	// Normal of the computed fragment, in camera space
            // 	vec3 n = TextureNormal_tangentspace;
            // normal=TextureNormal_tangentspace;

            vec3 ll = normalize(LightDirection_tangentspace);
            // vec3 ll = normalize(lightDir);
        	// Cosine of the angle between the normal and the light direction,
        	// clamped above 0
        	//  - light is at the vertical of the triangle -> 1
        	//  - light is perpendicular to the triangle -> 0
        	//  - light is behind the triangle -> 0
        	float cosTheta = clamp( dot(TextureNormal_tangentspace,ll ), 0.0,1.0 );


        	// Eye vector (towards the camera)
        	vec3 E = normalize( TBN*(camPos-modelPos.xyz));
        	// Direction in which the triangle reflects the light
        	vec3 R = reflect(-ll,TextureNormal_tangentspace);
        	// Cosine of the angle between the Eye vector and the Reflect vector,
        	// clamped to 0
        	//  - Looking into the reflection -> 1
        	//  - Looking elsewhere -> < 1
        	float cosAlpha = clamp( dot( E,R ), 0.0,1.0 );

        #endif


        #ifndef HAS_TEXTURE_NORMAL

            #ifdef SHOW_LAMBERT
                vec3 lambert = vec3( max(dot(lightDir,normal), 0.0) );
                vec3 lambertColor=lambert * light.color.rgb * light.mul;
                lambertColor*=getfallOff(light, length(lightModelDiff));

                col+=lambertColor;
            #endif

        #endif

        #ifndef SHOW_LAMBERT
            col=vec3(r,g,b);
        #endif

        #ifdef ENABLE_SPECULAR
            specular+=specAmount*phongSpecular(lightVector,-eyevector,normal, pow(1.0-(specShininess+0.1)*0.7,5.0)*1000.0);
        #endif

        col+=vec3(light.ambient);


        #ifdef HAS_TEXTURE_NORMAL
        #ifdef SHOW_NORMAL
            #ifdef SHOW_LAMBERT
                col+= falloff*(light.color.rgb * light.mul*((cosTheta)))*1.0;
            #endif

            #ifdef SHOW_SPECULAR
                float specMul=specular;
                #ifdef HAS_TEXTURE_SPECULAR
                    specMul*=texture(texSpecular, texCoord).r;
                #endif

                col+=light.mul*specMul*pow(cosAlpha,5.0);// (distance*distance);
            #endif

        #endif
        #endif

        #ifndef SHOW_NORMAL
            col=vec3(r,g,b);
        #endif
    }

    #ifdef SHOW_DIFFUSE
        #ifdef HAS_TEXTURE_DIFFUSE
            vec4 texCol=texture(texDiffuse, texCoord);
            col*=texCol.rgb;
            alpha*=texCol.a;
            // if(texCol.a<=0.1)
            // {
                // discard;
                // return;
            // }
            #ifdef COLORIZE_TEXTURE
                col*= vec3(r,g,b);
            #endif
        #endif
        #ifndef HAS_TEXTURE_DIFFUSE
            col*= vec3(r,g,b);
        #endif
    #endif

    #ifndef SHOW_DIFFUSE
        col*=vec3(0.5);
    #endif

    #ifdef SHOW_AO
        #ifdef HAS_TEXTURE_AO
            col*= texture(texAo, texCoord).rgb;
        #endif
    #endif

    vec3 vNormal = normalize(mat3(normalMatrix) * normal);

    #ifdef ENABLE_FRESNEL
    col+=vec3(r,g,b)*(calcFresnel(mvPos,vNormal)*fresnel*5.0);
    #endif

    #ifdef SHOW_EMISSIVE
        #ifdef HAS_TEXTURE_EMISSIVE
            col+= 25.0*texture(texEmissive, texCoord).rgb;
        #endif
    #endif

    #ifdef ENABLE_SPECULAR
    col+=vec3(specular);
    #endif


// if(alpha>0.1)alpha=1.0;
// else discard;

    {{MODULE_COLOR}}

    // if( dot(vNormal,vec3(0.0,0.0,0.0))>0.0 )
    // {
    //     col.r=1.0;
    //     col.g=0.0;
    //     col.b=0.0;
    // }
    //  o.Normal = dot(IN.viewDir, float3(0, 0, 1)) > 0 ? n : -n;

    // if(!gl_FrontFacing)col.r=1.0;


    outColor=vec4(col,alpha);
}
