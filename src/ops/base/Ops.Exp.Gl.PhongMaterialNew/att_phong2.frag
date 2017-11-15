// #extension GL_OES_standard_derivatives : enable
// precision highp float;

{{MODULES_HEAD}}


//some settings for the look and feel of the material
const float specularScale = 0.65;
const float roughness = 1110.0;
const float albedo = 0.9;

UNI float shininess;
UNI float specularStrength;
UNI float fresnel;

#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D texDiffuse;
#endif
#ifdef HAS_TEXTURE_SPECULAR
    UNI sampler2D texSpecular;
#endif

#ifdef HAS_TEXTURE_NORMAL
    UNI sampler2D texNormal;
#endif

UNI float r,g,b,a;

UNI float diffuseRepeatX;
UNI float diffuseRepeatY;

UNI int flatShading;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;
IN  vec2 texCoord;

struct Light {
  vec3 pos;
  vec3 color;
  vec3 ambient;
  vec3 specular;
  float falloff;
  float radius;
  float mul;
};

IN mat3 normalMatrix;
IN vec4 modelPos;

UNI Light lights[NUM_LIGHTS];

IN vec3 vViewPosition;
IN vec3 norm;
UNI vec3 camPos;
IN vec3 vNormal;

IN mat3 TBN;



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

void main()
{
    vec2 UV_SCALE = vec2(diffuseRepeatX,diffuseRepeatY);

    vec3 color = vec3(0.0);
    vec2 uv = texCoord * UV_SCALE;
    vec3 N = norm;
    vec3 normTrans=TBN*N;

    // vec3 tangent;
    // vec3 binormal;
    
    // // #ifdef CALC_TANGENT
    //     tangent = cross(norm, vec3(0.0, 0.0, 1.0));
    //     tangent = normalize(tangent);
    //     binormal = cross(norm, tangent);
    //     binormal = normalize(binormal);
        
    //     tangent=normalize(vec3(modelMatrix * vec4(tangent,1.0)));
    // // #endif
    // // vec3 T = normalize(vec3(modelMatrix * vec4(attrTangent,   0.0)));
    // // vec3 B = normalize(vec3(modelMatrix * vec4(attrBiTangent, 0.0)));
    // // vec3 N = normalize(vec3(modelMatrix * vec4(vNormal,    0.0)));

    // N=normalize(tangent*norm.x + binormal*norm.y + norm*norm.z);



    #ifdef HAS_TEXTURE_DIFFUSE
        vec3 diffuseColor = texture2D(texDiffuse, uv).rgb;
    #endif
    #ifndef HAS_TEXTURE_DIFFUSE
        vec3 diffuseColor = vec3(r,g,b);
    #endif

    #ifdef HAS_TEXTURE_NORMAL
        vec3 normalMap = texture2D(texNormal, uv).rgb * 2.0 - 1.0;
        // normalMap=normalize(normalMap);

        N=normalize(normalMatrix * normalMap);

        // N=normalize( (normalMap));
        // N = normalize( (normalMap) );

        // N = normalize(normalMap); 
        normTrans=normalize(TBN * normalMap);
    #endif

    float specStrength = specularStrength;
    #ifdef HAS_TEXTURE_SPECULAR
        specStrength = specularStrength*texture2D(texSpecular, uv).r;
    #endif

    vec3 specularColors=vec3(0.0);



    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        vec3 lightDir = normalize(light.pos - modelPos.xyz);
        float lambertian = max(dot(lightDir,normalize(norm)), 0.0);
        float specular = 0.0;

        if(lambertian > 0.0)
        {
            vec3 viewDir = normalize(camPos.xyz-modelPos.xyz);
        
            // this is blinn phong
            vec3 halfDir = normalize(lightDir + viewDir);
            float specAngle = max(dot(halfDir, N), 0.0);
            specular = pow(specAngle, shininess);
 
            // vec3 reflectDir = reflect(-lightDir, normal);
            // float specAngle = max(dot(reflectDir, viewDir), 0.0);
            //// note that the exponent is different here
            // specular = pow(specAngle, shininess);

            float falloff = 1.0;//attenuation_1_5(light.radius, light.falloff, lightDistance);
            
            color+= light.mul*falloff*vec3(light.ambient + lambertian * light.color );
            specularColors+=light.mul*falloff*vec3(specular * light.specular);
        }
        else
        {
            color+= light.mul*light.ambient;
        }
    }

    if(fresnel!=0.0) color+=calcFresnel(normalize(vViewPosition),vNormal)*fresnel*5.0;

    color*=diffuseColor;
    color+=specularColors;
    // color=toGamma_3_9(color);
    vec4 col=vec4(color,a);
    {{MODULE_COLOR}}

// col.rgb=vViewPosition.xyz;

    gl_FragColor = col;
    // gl_FragColor.a =a;
}

