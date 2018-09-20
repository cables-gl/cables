{{MODULES_HEAD}}

IN vec3 norm;
IN vec4 modelPos;
IN mat3 normalMatrix;
IN vec2 texCoord;

IN vec3 mvNormal;
IN vec3 mvTangent;
IN vec3 mvBiTangent;


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

    vec4 col=vec4(0.0);
    vec3 normal = normalize(normalMatrix*norm);
  
    #ifdef HAS_TEXTURE_NORMAL
        normal = texture2D(texNormal, texCoord).rgb * 2.0 - 1.0;
        normal=normalize(normalMatrix*normal);
    #endif

  
    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        vec3 lightModelDiff=light.pos - modelPos.xyz;
        vec3 lightDir = normalize(lightModelDiff);
        vec3 lambert = vec3( max(dot(lightDir,normal), 0.0) );

        vec3 newColor=lambert * light.color.rgb * light.mul;
        newColor*=getfallOff(light, length(lightModelDiff));

        col.rgb+=vec3(light.ambient);
        col.rgb+=newColor;
    }
    
    col.rgb*=vec3(r,g,b);
    col.a=a;
    
    {{MODULE_COLOR}}
    
    outColor=col;
}
