{{MODULES_HEAD}}
IN vec3 vCoords;
IN vec3 v_normal;
IN vec3 v_eyeCoords;
IN vec3 v_pos;
IN vec2 texCoord;

UNI samplerCube skybox;
UNI sampler2D maskRoughness;
UNI sampler2D maskReflection;
UNI sampler2D texNormal;
UNI sampler2D texDiffuse;
UNI sampler2D texAo;

UNI mat4 modelMatrix;
UNI mat4 inverseViewMatrix;
UNI mat4 normalMatrix;

UNI float mulReflection;
UNI float mulRoughness;



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
        tNorm=texture2D(texNormal,texCoord).rgb*2.0-1.0;
    #endif
    
    vec4 tCol=vec4(1.0);
    #ifdef TEX_NORMAL
        tCol*=texture2D(texDiffuse,texCoord);
    #endif









    


//     // #ifdef CALC_TANGENT
//         vec3 c1 = cross(theNormal, vec3(0.0, 0.0, 1.0));
// /*            vec3 c2 = cross(theNormal, vec3(0.0, 1.0, 0.0));
//             if(length(c1)>length(c2)) tangent = c2;
//                 else tangent = c1;
// */  
// vec3 tangent=c1;
//          tangent = normalize(tangent);
//         vec3 binormal = cross(theNormal, tangent);
//         binormal = normalize(binormal);
//     // #endif

    // tNorm=normalize(tangent*tNorm.x + binormal*tNorm.y + theNormal*tNorm.z);





    vec3 N = normalize( mat3(normalMatrix) *theNormal ).xyz;
    N=normalize(N+tNorm);














    // start reflection
    vec3 V = v_eyeCoords;
    vec3 R = -reflect(V,N);
    vec3 T = ( mat3( inverseViewMatrix ) * normalize(R) ).xyz; // Transform by inverse of the view transform that was applied to the skybo
    // vec4 colReflect = texture(skybox, T);
    vec4 colReflect = textureLod(skybox, T,(amountRough)*10.0);
    // colReflect.rgb=vec3(colReflect.r);
    
    // end reflection


    vec3 no = ( mat3( inverseViewMatrix ) * normalize(-N) ).xyz;

    // col = texture(skybox, normalize(no));
    

    // vec4 colReflect = textureLod(skybox, normalize(no),0.0);
    
    

// col=colReflect;
    
    col= textureLod(skybox, normalize(no),10.0)*1.0;
    col.rgb=vec3(col.r);
col*=tCol*2.0;
// col*=2.0;
    col=mix(col,colReflect,amountReflect);
    
    col.a=tCol.a;


#ifdef TEX_AO
col.rgb*=texture2D(texAo,texCoord).r;
#endif
// col=colReflect;

    // col= textureLod(skybox, normalize(no),4.0);

    // col=vec4(rough,rough,rough,1.0);

    {{MODULE_COLOR}}

    outColor=col;

}


