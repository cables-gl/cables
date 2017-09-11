
IN vec3 norm;
IN vec4 modelPos;
IN vec3 vViewPosition;

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

UNI float inSpecular;
UNI float r,g,b,a;


void main()
{
    vec3 normal = normalize(norm);
    vec3 color=vec3(0.0);
    vec3 specularColors=vec3(0.0);
  
    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        vec3 lightDir = normalize(light.pos - modelPos.xyz);
        
        float lambertian = max(dot(lightDir,normal), 0.0);
        float specular = 0.0;
        
        if(lambertian > 0.0)
        {
            vec3 viewDir = normalize(-vViewPosition.xyz);
        
            // this is blinn phong
            vec3 halfDir = normalize(lightDir + viewDir);
            float specAngle = max(dot(halfDir, normal), 0.0);
            specular = pow(specAngle, inSpecular);
 
            // vec3 reflectDir = reflect(-lightDir, normal);
            // float specAngle = max(dot(reflectDir, viewDir), 0.0);
            //// note that the exponent is different here
            // specular = pow(specAngle, inSpecular);

            color+= vec3(light.ambient + lambertian * light.color );
            specularColors+=vec3(specular * light.specular);
        }
        else
        {
            color+= vec3(light.ambient);
        }
    }
    
    color*=vec3(r,g,b);
    color+=specularColors;
    outColor=vec4(color,a);

}
