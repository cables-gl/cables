precision highp float;

{{MODULES_HEAD}}

varying vec3 norm;
varying vec2 texCoord;
uniform sampler2D tex;
varying vec2 vNorm;
uniform mat4 viewMatrix;

uniform float repeatX;
uniform float repeatY;
uniform float opacity;

#ifdef HAS_DIFFUSE_TEXTURE
   uniform sampler2D texDiffuse;
#endif

#ifdef USE_SPECULAR_TEXTURE
   uniform sampler2D texSpec;
   uniform sampler2D texSpecMatCap;
#endif

#ifdef HAS_AO_TEXTURE
    uniform sampler2D texAo;
    uniform float aoIntensity;
#endif

#ifdef HAS_NORMAL_TEXTURE
   varying vec3 vBiTangent;
   varying vec3 vTangent;

   uniform sampler2D texNormal;
   uniform mat4 normalMatrix;
   varying vec3 e;
   vec2 vNormt;
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

        vec3 r = reflect( e, n );
        float m = 2. * sqrt( 
            pow(r.x, 2.0)+
            pow(r.y, 2.0)+
            pow(r.z + 1.0, 2.0)
        );
        
        vn = (r.xy / m + 0.5);
        
        vn.t=clamp(vn.t, 0.0, 1.0);
        vn.s=clamp(vn.s, 0.0, 1.0);
    #endif

    vec4 col = texture2D( tex, vn );

    #ifdef HAS_DIFFUSE_TEXTURE
        col = col*texture2D( texDiffuse, vec2(texCoords.x*repeatX,texCoords.y*repeatY));
    #endif

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

    gl_FragColor = col;

}