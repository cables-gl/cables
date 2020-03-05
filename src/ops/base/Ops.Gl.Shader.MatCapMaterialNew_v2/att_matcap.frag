
{{MODULES_HEAD}}

IN vec3 norm;
IN vec2 texCoord;
IN vec3 vNorm;
UNI mat4 viewMatrix;

UNI float opacity;

UNI float r;
UNI float g;
UNI float b;

IN vec3 e;


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

   UNI sampler2D texNormal;
   UNI mat4 normalMatrix;

   vec2 vNormt;
#endif

#ifdef HAS_TEXTURE_OPACITY
    UNI sampler2D texOpacity;
#endif

#ifdef CALC_SSNORMALS
    // from https://www.enkisoftware.com/devlogpost-20150131-1-Normal_generation_in_the_pixel_shader
    IN vec3 eye_relative_pos;
#endif


const float normalScale=0.4;

const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 sampleSphericalMap(vec3 direction)
{
    vec2 uv = vec2(atan(direction.z, direction.x), asin(direction.y));
    uv *= invAtan;
    uv += 0.5;
    return uv;
}


void main()
{
    vec2 vnOrig=vNorm.xy;
    vec2 vn=vNorm.xy;

    #ifdef PER_PIXEL

        vec3 ref = reflect( e, vNorm );
        // ref=(ref);

        // ref.z+=1.;
        // ref=normalize(ref);

        // float m = 2. * sqrt(
        //     pow(ref.x, 2.0)+
        //     pow(ref.y, 2.0)+
        //     pow(ref.z+1., 2.0)
        // );

        float m = 2.58284271247461903 * sqrt( (length(ref)) );

        vn.xy = ref.xy / m + 0.5;
    #endif

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
        vec3 tnorm=texture( texNormal, texCoord ).xyz * 2.0 - 1.0;

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

        // vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );
        vec3 n = normalize( mat3(normalMatrix) * (norm+tnorm*normalScale) );

        vec3 re = reflect( e, n );
        float m = 2. * sqrt(
            pow(re.x, 2.0)+
            pow(re.y, 2.0)+
            pow(re.z + 1.0, 2.0)
        );

        vn = (re.xy / m + 0.5);

    #endif

// vn=clamp(vn,0.0,1.0);





    vec4 col = texture( texMatcap, vec2(vn.x,1.-vn.y) );

    #ifdef HAS_DIFFUSE_TEXTURE
        col = col*texture( texDiffuse, texCoords);
    #endif

    col.r*=r;
    col.g*=g;
    col.b*=b;


    #ifdef HAS_AO_TEXTURE
        col = col*
            mix(
                vec4(1.0,1.0,1.0,1.0),
                texture( texAo, texCoords),
                aoIntensity
                );
    #endif

    #ifdef USE_SPECULAR_TEXTURE
        vec4 spec = texture( texSpecMatCap, vn );
        spec*= texture( texSpec, texCoords );
        col+=spec;
    #endif

    col.a*=opacity;
    #ifdef HAS_TEXTURE_OPACITY
            #ifdef TRANSFORMALPHATEXCOORDS
                texCoords=vec2(texCoord.s,1.0-texCoord.t);
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
            // #endif
    #endif

    {{MODULE_COLOR}}


    // #ifdef PER_PIXEL


    //     vec2 nn=(vn-0.5)*2.0;
    //     float ll=length( nn );
    //     // col.r=0.0;
    //     // col.b=0.0;
    //     // col.a=1.0;

    //     // if(ll>0.49 && ll<0.51) col=vec4(0.0,1.0,0.0,1.0);
    //     // if(ll>0. ) col=vec4(0.0,1.0,0.0,1.0);
    //     // col=vec4(vn,0.0,1.0);


    //     float dd=(vn.x-0.5)*(vn.x-0.5) + (vn.y-0.5)*(vn.y-0.5);
    //     dd*=4.0;

    //     if(dd>0.94)
    //     {
    //     col=vec4(0.0,1.0,0.0,1.0);
    //         // nn*=0.5;
    //         // nn+=0.5;
    //         // nn*=2.0;
    //         // vn=nn;

    //         // // dd=1.0;
    //     }
    //     // else dd=0.0;

    //     // col=vec4(vec3(dd),1.0);

    //     // if(dd>0.95) col=vec4(1.0,0.0,0.0,1.0);

    //     // vec2 test=(vec2(1.0,1.0)-0.5)*2.0;
    //     // col=vec4(0.0,0.0,length(test),1.0);

    // #endif



    outColor = col;

}