{{MODULES_HEAD}}

// IN vec3 vCoords;
IN vec3 viewDirection;
IN vec2 texCoord;
IN mat3 newNormalMatrix;
IN vec3 vertPos;

#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube irradiance;
    UNI samplerCube mapReflection;
    #define SAMPLETEX textureLod
#endif
#ifndef TEX_FORMAT_CUBEMAP
    #define TEX_FORMAT_EQUIRECT
    UNI sampler2D irradiance;
    UNI sampler2D mapReflection;
    #define SAMPLETEX sampleEquirect
#endif

#ifdef TEX_ROUGHNESS
    UNI sampler2D maskRoughness;
#endif
UNI sampler2D maskReflection;
#ifdef TEX_DIFFUSE
    UNI sampler2D texDiffuse;
#endif

#ifdef ORIG_TEXCOORD
    IN vec2 texCoordOrig;
#endif

#ifdef TEX_AO
    UNI sampler2D texAo;
    UNI float aoIntensity;
#endif

#ifdef TEX_OPACITY
    UNI sampler2D texOpacity;
#endif

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    IN vec3 eye_relative_pos;
    IN vec3 mPos;
#endif

#ifdef ENABLE_FRESNEL
    UNI float fresnelWidth,fresnelAmount,fresnelR,fresnelG,fresnelB,fresnelExponent;
#endif


UNI float opacity;

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;
UNI float fRotation;
UNI float mulReflection;
UNI float mulRoughness;

#ifdef GL_EXT_shader_texture_lod
    #define textureLod texture2DLodEXT
#endif

#ifdef TEX_NORMAL
    UNI float normalIntensity;
    UNI sampler2D texNormal;
#endif

#ifdef TEX_FORMAT_EQUIRECT
    vec4 sampleEquirect(sampler2D tex,vec3 coord,float lod)
    {
        vec2 uv = vec2(atan(coord.z, coord.x), asin(coord.y+1e-6));
        uv *= vec2(0.1591, 0.3183);
        uv += 0.5;

        return textureLod(tex,uv,lod);
    }
#endif



















float MOD_mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 MOD_mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 MOD_perm(vec4 x){return MOD_mod289(((x * 34.0) + 1.0) * x);}

float MOD_meshPixelNoise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = MOD_perm(b.xyxy);
    vec4 k2 = MOD_perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = MOD_perm(c);
    vec4 k4 = MOD_perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}




#ifdef ENABLE_FRESNEL

    float calcFresnel(vec3 direction, vec3 normal)
    {
        vec3 nDirection = normalize( direction );
        vec3 nNormal = normalize( normal );
        vec3 halfDirection = normalize( nNormal + nDirection );

        float cosine = dot( halfDirection, nDirection );
        float product = max( cosine, 0.0 );
        float factor = pow( product, fresnelExponent );

        return factor;
    }

#endif

#ifdef TEX_OPACITY_SRC_LUMI
    float luminance(vec3 color)
    {
       return dot(vec3(0.2126,0.7152,0.0722), color);
    }
#endif







void main()
{
    {{MODULE_BEGIN_FRAG}}

    float rot=fRotation*6.28318531, sa=sin(rot), ca=cos(rot);
    mat2 matRotation = mat2(ca,sa,-sa,ca);
    vec3 theNormal;
    vec4 col = vec4(1.0,1.0,1.0,1.0);
    float amountRough=mulRoughness;
    float amountReflect=mulReflection;

    #ifdef TEX_ROUGHNESS
        amountRough*=texture(maskRoughness,texCoord).r;
    #endif

    #ifdef TEX_REFLECTION
        amountReflect*=texture(maskReflection,texCoord).r;
    #endif

    #ifndef TEX_NORMAL
        vec3 N = newNormalMatrix[2];
    #else
        theNormal=texture(texNormal,texCoord).rgb*2.-1.;
        #ifdef TEX_NORMAL_FLIP
            theNormal.xy*=-1.;
        #endif
        theNormal=normalize(mix(vec3(0,0,1),theNormal,normalIntensity));
        vec3 N=newNormalMatrix * theNormal;
    #endif

    #ifdef CALC_SSNORMALS
    	vec3 dFdxPos = dFdx( eye_relative_pos );
    	vec3 dFdyPos = dFdy( eye_relative_pos );
    	vec3 ssn = normalize( cross(dFdxPos,dFdyPos ));
        vec3 rr = reflect( mPos, ssn );
        float ssm = 2. * sqrt(
            pow(rr.x, 2.0)+
            pow(rr.y, 2.0)+
            pow(rr.z, 2.0)
        );

        N=rr/ssm;
        N.zyx*=-1.0;
    #endif


    {
        // float rr=((MOD_meshPixelNoise(vertPos*5.0)-0.5)*1.0);
        // N.z+=N.z*rr;
        // // N.z+=N.z*rr;

        // // N.x+=N.x* ((MOD_meshPixelNoise(vertPos*8.0)-1.0)*1.0);
        // // N.y+=N.y* ((MOD_meshPixelNoise(vertPos*8.0)-1.0)*1.0);
        // // N+=N* ((MOD_meshPixelNoise(vertPos*18.0)-0.5)*2.0);

        // // rects
        // N.z*=(MOD_meshPixelNoise(mod(vertPos*0.2,0.3))-0.5)*1.0;
        // // N.z*=(MOD_meshPixelNoise(mod(N*0.2,0.3))-0.5)*1.0;
        // // N.z+=N.z*(MOD_meshPixelNoise(mod(vertPos*0.2,0.3))-0.5)*1.5;

        // // vert
        // N.z+=N.z*(MOD_meshPixelNoise(mod(vec3(vertPos.y*0.2),0.1))-0.5)*1.5;
        // N.x+=N.x*(MOD_meshPixelNoise(mod(vec3(vertPos.z*0.2),0.3))-0.5)*1.5;
        // N.+=N.*(MOD_meshPixelNoise(mod(vec3(vertPos.z*0.2),0.3))-0.5)*1.5;
    }


    N=normalize(N);


    vec3 RN=N;
    RN.xz *= matRotation;
    col=SAMPLETEX(irradiance,RN,8.0);



    #ifdef TEX_DIFFUSE
        col.rgb *= texture(texDiffuse,texCoord).rgb;
    #endif

    vec3 L = reflect(normalize(viewDirection),N);
    L.xz*=matRotation;
    L=normalize(L);
    // col.rgb=mix(col.rgb,SAMPLETEX(mapReflection, L, amountRough*10.0).rgb,amountReflect);
    col.rgb+=(SAMPLETEX(mapReflection, L, amountRough*10.0).rgb*amountReflect);

    // #ifdef TEX_DIFFUSE
        // metal reflection
        // col.rgb+=(SAMPLETEX(mapReflection, L, amountRough*10.0).rgb*amountReflect) * texture(texDiffuse,texCoord).rgb * 5.0 * (0.95-texture(texDiffuse,texCoord).rgb);
    // #endif
    // col.rgb*
    // col.rgb+=reflc;


    #ifdef ENABLE_FRESNEL
        // float fresnel=5.9;
        col.rgb+=fresnelAmount*vec3(fresnelR,fresnelG,fresnelB)*(calcFresnel(viewDirection,N)*fresnelWidth*5.5);

        // col.rgb=N.rgb;
        // col.rgb=(mPos);

        // col.rgb=mPos.rgb*1.0;
        // col.rgb=viewDirection;

    #endif
    #ifdef TEX_AO
        col.rgb *= clamp(texture(texAo,texCoordOrig).r+(1.0-aoIntensity),0.0,1.0);
    #endif


    // OPACITY
    col.a=1.0;
    #ifdef TEX_OPACITY
        #ifdef TRANSFORM_OPACITY
            #ifdef TEX_OPACITY_SRC_R
                col.a=texture(texOpacity,texCoord).r;
            #endif
            #ifdef TEX_OPACITY_SRC_A
                col.a=texture(texOpacity,texCoord).a;
            #endif
            #ifdef TEX_OPACITY_SRC_LUMI
                col.a=luminance(texture(texOpacity,texCoord).rgb);
            #endif
        #endif
        #ifndef TRANSFORM_OPACITY
            #ifdef TEX_OPACITY_SRC_R
                col.a=texture(texOpacity,texCoordOrig).r;
            #endif
            #ifdef TEX_OPACITY_SRC_A
                col.a=texture(texOpacity,texCoordOrig).a;
            #endif
            #ifdef TEX_OPACITY_SRC_LUMI
                col.a=luminance(texture(texOpacity,texCoordOrig).rgb);
            #endif
        #endif
    #endif

    col.a*=opacity;

    {{MODULE_COLOR}}


    // #ifdef TEX_ROUGHNESS
    //     col=texture(maskRoughness,texCoord);
    // #endif

    outColor=col;

    // outColor.rgb=newNormalMatrix[2];

}


