{{MODULES_HEAD}}

#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D texDiffuse;
#endif
#ifdef HAS_TEXTURE_SPECULAR
    UNI sampler2D texSpecular;
#endif

#ifdef HAS_TEXTURE_NORMAL
    UNI sampler2D texNormal;
    UNI vec3 camPos;
    IN vec3 EyeDirection_cameraspace;
    IN vec3 vertexPos;

    // IN vec3 LightDirection_tangentspace;
    IN vec3 EyeDirection_tangentspace;
    IN mat3 TBN;
    IN mat4 vMatrix;
    IN vec3 mvPos;

#endif


IN vec2 texCoord;

IN vec3 norm;
IN vec4 modelPos;
IN mat3 normalMatrix;

UNI float specular;
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

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 col=vec3(0.0);
    vec3 normal = normalize(normalMatrix*norm);
  
    #ifdef HAS_TEXTURE_NORMAL
        vec3 TextureNormal_tangentspace = normalize(texture2D(texNormal, texCoord).rgb*2.0-1.0);
    #endif

  
    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        vec3 lightModelDiff=light.pos - modelPos.xyz;
        vec3 lightDir = normalize(lightModelDiff);
  
      	float distance = length( lightModelDiff );

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
            vec3 lambert = vec3( max(dot(lightDir,normal), 0.0) );
            vec3 lambertColor=lambert * light.color.rgb * light.mul;
            lambertColor*=getfallOff(light, length(lightModelDiff));
    
            col+=lambertColor;
        #endif



        col+=vec3(light.ambient);

        // col=vec3(1.0,1.0,1.0);
        
        #ifdef HAS_TEXTURE_NORMAL
        
            col+= light.color.rgb * light.mul*((cosTheta));// (distance*distance));
            
            // col+=(cosAlpha);
            col+=specular*pow(cosAlpha,5.0);// (distance*distance);
            
            
            
            // col=vec3(distance/.0);
        
        #endif
        
    }
    
    #ifdef HAS_TEXTURE_DIFFUSE
        col*= texture2D(texDiffuse, texCoord).rgb;
    #endif
    #ifndef HAS_TEXTURE_DIFFUSE
        col*= vec3(r,g,b);
    #endif
    



    {{MODULE_COLOR}}

    outColor=vec4(col,a);
}
