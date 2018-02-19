
precision highp float;

{{MODULES_HEAD}}

IN vec3 norm;
IN vec2 texCoord;
UNI sampler2D tex;
IN vec2 vNorm;
UNI mat4 viewMatrix;

UNI float repeatX;
UNI float repeatY;
UNI float opacity;

UNI float r;
UNI float g;
UNI float b;

IN vec3 e;

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

   UNI sampler2D texNormal;
   UNI mat4 normalMatrix;
   
   vec2 vNormt;
#endif

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    IN vec3 eye_relative_pos;
#endif


const float normalScale=0.4;

void main()
{
    vec2 vnOrig=vNorm;
    vec2 vn=vNorm;


    #ifdef HAS_TEXTURES
        vec2 texCoords=texCoord;
        {{MODULE_BEGIN_FRAG}}
    #endif

    #ifdef CALC_SSNORMALS
    	vec3 dFdxPos = dFdx( eye_relative_pos );
    	vec3 dFdyPos = dFdy( eye_relative_pos );
    	vec3 ssn = normalize( cross(dFdxPos,dFdyPos ));
    	
        vec3 rr = reflect( e, ssn );
        float ssm = 2. * sqrt( 
            pow(rr.x, 2.0)+
            pow(rr.y, 2.0)+
            pow(rr.z + 1.0, 2.0)
        );
        
        

        
        vn = (rr.xy / ssm + 0.5);
        
        vn.t=clamp(vn.t, 0.0, 1.0);
        vn.s=clamp(vn.s, 0.0, 1.0);
        
        // float dst = dot(abs(coord-center), vec2(1.0));
        // float aaf = fwidth(dst);
        // float alpha = smoothstep(radius - aaf, radius, dst);

    #endif

   #ifdef HAS_NORMAL_TEXTURE
        vec3 tnorm=texture2D( texNormal, vec2(texCoord.x*repeatX,texCoord.y*repeatY) ).xyz * 2.0 - 1.0;
        
        tnorm = normalize(tnorm*normalScale);
        
        vec3 tangent;
        vec3 binormal;
        
        #ifdef CALC_TANGENT
            vec3 c1 = cross(norm, vec3(0.0, 0.0, 1.0));
//            vec3 c2 = cross(norm, vec3(0.0, 1.0, 0.0));
//            if(length(c1)>length(c2)) tangent = c2;
//                else tangent = c1;
            tangent = c1;
            tangent = normalize(tangent);
            binormal = cross(norm, tangent);
            binormal = normalize(binormal);
        #endif

        #ifndef CALC_TANGENT
            tangent=normalize(vTangent);
//            tangent.y*=-13.0;
//            binormal=vBiTangent*norm;
//            binormal.z*=-1.0;
//            binormal=normalize(binormal);
            binormal=normalize( cross( normalize(norm), normalize(vBiTangent) ));
        // vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );

        #endif

        tnorm=normalize(tangent*tnorm.x + binormal*tnorm.y + norm*tnorm.z);

        vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );

        vec3 re = reflect( e, n );
        float m = 2. * sqrt( 
            pow(re.x, 2.0)+
            pow(re.y, 2.0)+
            pow(re.z + 1.0, 2.0)
        );
        
        vn = (re.xy / m + 0.5);
        
        vn.t=clamp(vn.t, 0.0, 1.0);
        vn.s=clamp(vn.s, 0.0, 1.0);
    #endif

    vec4 col = texture2D( tex, vn );

    #ifdef HAS_DIFFUSE_TEXTURE
        col = col*texture2D( texDiffuse, vec2(texCoords.x*repeatX,texCoords.y*repeatY));
    #endif

    col.r*=r;
    col.g*=g;
    col.b*=b;


    #ifdef HAS_AO_TEXTURE
        col = col*
            mix(
                vec4(1.0,1.0,1.0,1.0),
                texture2D( texAo, vec2(texCoords.x*repeatX,texCoords.y*repeatY)),
                aoIntensity
                );
    #endif

    #ifdef USE_SPECULAR_TEXTURE
        vec4 spec = texture2D( texSpecMatCap, vn );
        spec*= texture2D( texSpec, vec2(texCoords.x*repeatX,texCoords.y*repeatY) );
        col+=spec;
    #endif

    col.a*=opacity;

    {{MODULE_COLOR}}

    outColor = col;

}