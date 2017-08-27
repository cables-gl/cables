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


UNI Light lights[4];

IN vec3 vViewPosition;
IN vec3 vNormal;

//import some common functions
// vec3 normals_4_0(vec3 pos) {
//   vec3 fdx = dFdx(pos);
//   vec3 fdy = dFdy(pos);
//   return normalize(cross(fdx, fdy));
// }


// http://www.thetenthplanet.de/archives/1180
// mat3 cotangentFrame_8_1(vec3 N, vec3 p, vec2 uv) {
//   // get edge vectors of the pixel triangle
//   vec3 dp1 = dFdx(p);
//   vec3 dp2 = dFdy(p);
//   vec2 duv1 = dFdx(uv);
//   vec2 duv2 = dFdy(uv);

//   // solve the linear system
//   vec3 dp2perp = cross(dp2, N);
//   vec3 dp1perp = cross(N, dp1);
//   vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
//   vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;

//   // construct a scale-invariant frame
//   float invmax = 1.0 / sqrt(max(dot(T,T), dot(B,B)));
//   return mat3(T * invmax, B * invmax, N);
// }



// vec3 perturb_6_2(vec3 map, vec3 N, vec3 V, vec2 texcoord) {
//   mat3 TBN = cotangentFrame_8_1(N, -V, texcoord);
//   return normalize(TBN * map);
// }


float orenNayarDiffuse_5_3(
  vec3 lightDirection,
  vec3 viewDirection,
  vec3 surfaceNormal,
  float roughness,
  float albedo) {

  float LdotV = dot(lightDirection, viewDirection);
  float NdotL = dot(lightDirection, surfaceNormal);
  float NdotV = dot(surfaceNormal, viewDirection);

  float s = LdotV - NdotL * NdotV;
  float t = mix(1.0, max(NdotL, NdotV), step(0.0, s));

  float sigma2 = roughness * roughness;
  float A = 1.0 + sigma2 * (albedo / (sigma2 + 0.13) + 0.5 / (sigma2 + 0.33));
  float B = 0.45 * sigma2 / (sigma2 + 0.09);

  return albedo * max(0.0, NdotL) * (A + B * s / t) / 3.14159265;
}


float phongSpecular_7_4(
  vec3 lightDirection,
  vec3 viewDirection,
  vec3 surfaceNormal,
  float shininess) {

  //Calculate Phong power
  vec3 R = -reflect(lightDirection, surfaceNormal);
  return pow(max(0.0, dot(viewDirection, R)), shininess);
}


// by Tom Madams
// Simple:
// https://imdoingitwrong.wordpress.com/2011/01/31/light-attenuation/
//
// Improved
// https://imdoingitwrong.wordpress.com/2011/02/10/improved-light-attenuation/
float attenuation_1_5(float r, float f, float d) {
  float denom = d / r + 1.0;
  float attenuation = 1.0 / (denom*denom);
  float t = (attenuation - f) / (1.0 - f);
  return max(t, 0.0);
}


const float gamma_2_6 = 2.2;

float toLinear_2_7(float v) {
  return pow(v, gamma_2_6);
}

vec2 toLinear_2_7(vec2 v) {
  return pow(v, vec2(gamma_2_6));
}

vec3 toLinear_2_7(vec3 v) {
  return pow(v, vec3(gamma_2_6));
}

vec4 toLinear_2_7(vec4 v) {
  return vec4(toLinear_2_7(v.rgb), v.a);
}



const float gamma_3_8 = 2.2;

float toGamma_3_9(float v) {
  return pow(v, 1.0 / gamma_3_8);
}

vec2 toGamma_3_9(vec2 v) {
  return pow(v, vec2(1.0 / gamma_3_8));
}

vec3 toGamma_3_9(vec3 v) {
  return pow(v, vec3(1.0 / gamma_3_8));
}

vec4 toGamma_3_9(vec4 v) {
  return vec4(toGamma_3_9(v.rgb), v.a);
}

//account for gamma-corrected images
vec4 textureLinear(sampler2D uTex, vec2 uv) {
  return toLinear_2_7(texture2D(uTex, uv));
}


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

    #ifdef HAS_TEXTURE_DIFFUSE
        vec3 diffuseColor = texture2D(texDiffuse, uv).rgb;
    #endif
    #ifndef HAS_TEXTURE_DIFFUSE
        vec3 diffuseColor = vec3(r,g,b);
    #endif

    #ifdef HAS_TEXTURE_NORMAL
        vec3 normalMap = texture2D(texNormal, uv).rgb * 2.0 - 1.0;
        normalMap=normalize(normalMatrix * normalMap);
    #endif

    float specStrength = specularStrength;
    #ifdef HAS_TEXTURE_SPECULAR
        specStrength = specularStrength*texture2D(texSpecular, uv).r;
    #endif

    vec3 specular=vec3(0.0);

    for(int l=0;l<NUM_LIGHTS;l++)
    {
        Light light=lights[l];

        //determine the type of normals for lighting
        vec3 normal = vec3(0.0);
        //   if (flatShading == 1) {
        //     normal = normals_4_0(vViewPosition);
        //   } else {
        normal = vNormal;
        //   }

        //determine surface to light direction
        vec4 lightPosition = viewMatrix * vec4(light.pos, 1.0);
        vec3 lightVector = lightPosition.xyz - vViewPosition;

        //calculate attenuation
        float lightDistance = length(lightVector);
        float falloff = attenuation_1_5(light.radius, light.falloff, lightDistance);

        //now sample from our repeating brick texture
        //assume its in sRGB, so we need to correct for gamma

        //our normal map has an inverted green channel

        vec3 L = normalize(lightVector);              //light direction
        vec3 V = normalize(vViewPosition);            //eye direction

        vec3 N = normal;//perturb_6_2(normalMap, normal, -V, vUv); //surface normal

        #ifdef HAS_TEXTURE_NORMAL
            N = normalize( (normalMap+normal) );
        #endif

        //compute our diffuse & specular terms
        specular += specStrength * phongSpecular_7_4(L, -V, N, shininess) * specularScale * falloff * light.specular;
        vec3 diffuse = light.color * orenNayarDiffuse_5_3(L, V, N, roughness, albedo) * falloff * light.mul;
        vec3 ambient = light.ambient;

        //add the lighting
        color += (diffuse + ambient);

        if(fresnel!=0.0) color+=calcFresnel(V,normal)*fresnel*5.0;


        //re-apply gamma to output buffer
    }

    color*=diffuseColor;
    color+=specular;
    // color=toGamma_3_9(color);
    vec4 col=vec4(color,a);
    {{MODULE_COLOR}}


    gl_FragColor = col;
    // gl_FragColor.a =a;
}
