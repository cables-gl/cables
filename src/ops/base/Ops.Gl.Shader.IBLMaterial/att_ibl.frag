{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
IN vec2 texCoord;

#ifdef TEX_FORMAT_CUBEMAP
    UNI samplerCube skybox;
    UNI samplerCube mapReflection;
    #define SAMPLETEX textureLod 
#endif
#ifdef TEX_FORMAT_EQUIRECT
    UNI sampler2D skybox;
    UNI sampler2D mapReflection;
    #define SAMPLETEX sampleEquirect 
#endif

UNI sampler2D maskRoughness;
UNI sampler2D maskReflection;
UNI sampler2D texNormal;
UNI sampler2D texDiffuse;
UNI sampler2D texAo;

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

UNI float fRotation;

UNI float mulReflection;
UNI float mulRoughness;

vec3 desaturate(vec3 color, float amount)
{
   vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
   return vec3(mix(color, gray, amount));
}

#ifdef TEX_FORMAT_EQUIRECT
    const vec2 invAtan = vec2(0.1591, 0.3183);
    vec2 sampleSphericalMap(vec3 direction)
    {
        vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y));
        uv *= invAtan;
        uv += 0.5;
        return uv;
    }
    
    vec4 sampleEquirect(sampler2D tex,vec3 coord,float lod)
    {
        return textureLod(tex,sampleSphericalMap(coord),lod);
    }
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    vec3 theNormal=v_normal;


    vec4 col = vec4(1.0,1.0,1.0,1.0);

    float amountRough=mulRoughness;
    #ifdef TEX_ROUGHNESS
        amountRough*=texture2D(maskRoughness,texCoord).r;
    #endif
    amountRough=smoothstep(0.0,1.0,amountRough);
    
    float amountReflect=mulReflection;
    #ifdef TEX_REFLECTION
        amountReflect*=texture2D(maskReflection,texCoord).r;
    #endif
    amountReflect=smoothstep(0.0,1.0,amountReflect);

    vec3 tNorm=vec3(0.0);
    #ifdef TEX_NORMAL
        theNormal=texture2D(texNormal,texCoord).rgb*2.0-1.0;
    #endif
    
    vec4 tCol=vec4(1.0);
    #ifdef TEX_DIFFUSE
        tCol*=texture2D(texDiffuse,texCoord);
    #endif




    vec3 N = normalize( mat3(normalMatrix) *theNormal ).xyz;
    // N=normalize(N+tNorm);














    // start reflection
    vec3 V = -v_eyeCoords;
    vec3 R = -reflect(V,N);
    vec3 T = ( mat3( inverseViewMatrix ) * normalize(R) ).xyz; // Transform by inverse of the view transform that was applied to the skybo
    // vec4 colReflect = texture(skybox, T);
    
    #ifndef FLIPX
    T.x*=-1.0;
    #endif
    
    #ifndef FLIPY
        T.y*=-1.0;
        // N.y*=-1.0;
    #endif
    float sa=sin(fRotation),ca=cos(fRotation);
    T.xz*=mat2(ca,sa,-sa,ca);

    #ifdef MAP_REFLECTION
        vec4 colReflect = SAMPLETEX(skybox, T,7.0);
    #endif
    
    #ifndef MAP_REFLECTION
        vec4 colReflect = SAMPLETEX(skybox, T,(amountRough)*10.0);
    #endif
    // colReflect.rgb=vec3(colReflect.r);


    // end reflection



    vec3 no = ( mat3( inverseViewMatrix ) * normalize(N) ).xyz;
    
    #ifndef FLIPY
        no.y*=-1.0;
    #endif

    col= SAMPLETEX(skybox, normalize(no),10.0)*1.0;
    
    // col.rgb=(col.rgb*vec3(3.0))-vec3(0.5);

    // float ctr=1.8;
    // col.r=pow(col.r / 0.18, ctr) * 0.18;
    // col.g=pow(col.g / 0.18, ctr) * 0.18;
    // col.b=pow(col.b / 0.18, ctr) * 0.18;

    
    // col.rgb=desaturate(col.rgb,0.7);


    

    
    col=mix(col,colReflect,amountReflect);
    col*=tCol;


    #ifdef MAP_REFLECTION
        col+=amountReflect*SAMPLETEX(mapReflection, T,(amountRough)*10.0);
        colReflect.a=1.0;
    #endif

    

    // col.a=tCol.a;


    #ifdef TEX_AO
        col.rgb*=texture2D(texAo,texCoord).r;
    #endif


    {{MODULE_COLOR}}

    outColor=col;

}


