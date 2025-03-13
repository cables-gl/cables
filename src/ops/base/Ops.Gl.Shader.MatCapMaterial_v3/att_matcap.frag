{{MODULES_HEAD}}

#ifdef HAS_TEXTURES
    IN vec2 texCoord;
#endif

IN vec3 transformedNormal;
IN vec3 viewSpacePosition;

UNI vec4 inColor;

UNI sampler2D texMatcap;

#ifdef HAS_DIFFUSE_TEXTURE
   UNI sampler2D texDiffuse;
#endif

#ifdef USE_SPECULAR_TEXTURE
   UNI sampler2D texSpec;
   UNI sampler2D texSpecMatCap;
#endif

#ifdef HAS_AO_TEXTURE
    UNI sampler2D texAo;
    UNI float aoIntensity;
#endif

#ifdef HAS_NORMAL_TEXTURE
    IN vec3 vBiTangent;
    IN vec3 vTangent;
    IN mat3 normalMatrix;

    UNI sampler2D texNormal;
    UNI float normalMapIntensity;
#endif

#ifdef HAS_TEXTURE_OPACITY
    UNI sampler2D texOpacity;
#endif

#ifdef CALC_SSNORMALS
    IN vec3 eye_relative_pos;

    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    vec3 CalculateScreenSpaceNormals() {
    	vec3 dFdxPos = dFdx(eye_relative_pos);
    	vec3 dFdyPos = dFdy(eye_relative_pos);
    	vec3 screenSpaceNormal = normalize( cross(dFdxPos, dFdyPos));
        return normalize(screenSpaceNormal);
    }
#endif

// * taken & modified from https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshmatcap_frag.glsl.js
vec2 getMatCapUV(vec3 viewSpacePosition, vec3 normal) {
    vec3 viewDir = normalize(-viewSpacePosition);
	vec3 x = normalize(vec3(viewDir.z, 0.0, - viewDir.x));
	vec3 y = normalize(cross(viewDir, x));
	vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks
	return uv;
}

void main()
{
    vec3 normal = normalize(transformedNormal);
    {{MODULE_NORMAL}}



    #ifdef HAS_TEXTURES
        vec2 texCoords = texCoord;
        {{MODULE_BEGIN_FRAG}}
    #endif



    #ifdef DOUBLE_SIDED
        if(!gl_FrontFacing) normal *= -1.0;
    #endif

    #ifdef CALC_SSNORMALS
        normal = CalculateScreenSpaceNormals();
    #endif



   #ifdef HAS_NORMAL_TEXTURE
        vec3 normalFromMap = texture( texNormal, texCoord ).xyz * 2.0 - 1.0;
        normalFromMap = normalize(normalFromMap);

        vec3 tangent;
        vec3 binormal;

        #ifdef CALC_TANGENT
            vec3 c1 = cross(normalFromMap, vec3(0.0, 0.0, 1.0));
            vec3 c2 = cross(normalFromMap, vec3(0.0, 1.0, 0.0));

            tangent = c1;
            tangent = normalize(tangent);
            binormal = cross(normal, tangent);
            binormal = normalize(binormal);
        #endif

        #ifndef CALC_TANGENT
            tangent = normalize(normalMatrix * vTangent);
            vec3 bitangent = normalize(normalMatrix * vBiTangent);
            binormal = normalize(cross(normal, bitangent));
        #endif

        normalFromMap = normalize(
            tangent * normalFromMap.x
            + binormal * normalFromMap.y
            + normal * normalFromMap.z
        );

        vec3 mixedNormal = normalize(normal + normalFromMap * normalMapIntensity);

        normal = mixedNormal;
    #endif

    vec4 col = texture(texMatcap, getMatCapUV(viewSpacePosition, normal));

    #ifdef HAS_DIFFUSE_TEXTURE
        col = col*texture(texDiffuse, texCoords);
    #endif

    col.rgb *= inColor.rgb;


    #ifdef HAS_AO_TEXTURE
        col = col
            * mix(
                vec4(1.0,1.0,1.0,1.0),
                texture(texAo, texCoords),
                aoIntensity
            );
    #endif

    #ifdef USE_SPECULAR_TEXTURE
        vec4 spec = texture(texSpecMatCap, getMatCapUV(viewSpacePosition, normal));
        spec *= texture(texSpec, texCoords);
        col += spec;
    #endif

    col.a *= inColor.a;

    #ifdef HAS_TEXTURE_OPACITY
        #ifdef TRANSFORMALPHATEXCOORDS
            texCoords=vec2(texCoord.s,1.0-texCoord.t);
            texCoords.y = 1. - texCoords.y;
        #endif
        #ifdef ALPHA_MASK_ALPHA
            col.a*=texture(texOpacity,texCoords).a;
        #endif
        #ifdef ALPHA_MASK_LUMI
            col.a*=dot(vec3(0.2126,0.7152,0.0722), texture(texOpacity,texCoords).rgb);
        #endif
        #ifdef ALPHA_MASK_R
            col.a*=texture(texOpacity,texCoords).r;
        #endif
        #ifdef ALPHA_MASK_G
            col.a*=texture(texOpacity,texCoords).g;
        #endif
        #ifdef ALPHA_MASK_B
            col.a*=texture(texOpacity,texCoords).b;
        #endif

        #ifdef DISCARDTRANS
            if(col.a < 0.2) discard;
        #endif
    #endif

    {{MODULE_COLOR}}

    outColor = col;
}