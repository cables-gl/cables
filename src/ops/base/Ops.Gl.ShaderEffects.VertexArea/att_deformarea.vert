
OUT float MOD_viz;

float MOD_map(float value,float min1,float max1,float min2,float max2)
{
    return max(min2,min(max2,min2 + (value - min1) * (max2 - min2) / (max1 - min1)));
}

float MOD_sdSphere( vec3 p, float s )
{
    return length(p)-s;
}

float MOD_sdRoundBox( vec3 p, vec3 b, float r )
{
    vec3 q = abs(p) - b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0) - r;
}

float MOD_sdTriPrism( vec3 p, vec2 h )
{
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float MOD_sdHexPrism( vec3 p, vec2 h )
{
    const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
    p = abs(p);
    p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
    vec2 d = vec2( length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x), p.z-h.y );
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

/////////////////////

mat4 MOD_createTransformMatrix(vec3 translation, vec3 scale) {
    mat4 matrix = mat4(1.0);

    matrix[0][0] = scale.x;
    matrix[1][1] = scale.y;
    matrix[2][2] = scale.z;

    matrix[3][0] = translation.x;
    matrix[3][1] = translation.y;
    matrix[3][2] = translation.z;

    return matrix;
}

///////////////////////////////////////////////////////////////

vec4 MOD_deform(vec4 oldPos,mat4 mMatrix,bool calcNormal,vec3 norm)
{
    vec4 pos=oldPos;
    vec4 vertexPos=pos;

    #ifdef MOD_WORLDSPACE
        vertexPos=mMatrix*pos;
    #endif


    #ifdef MOD_AREA_SPHERE
        float MOD_de=MOD_sdSphere(MOD_pos.xyz-vertexPos.xyz,MOD_radius);
    #endif

    #ifdef MOD_AREA_BOX
        float MOD_r=-1.0;
        // MOD_r*=MOD_inSizeAmountFalloffSizeX.x;
        float MOD_de=MOD_sdRoundBox(MOD_pos.xyz-vertexPos.xyz,MOD_scale-MOD_r,MOD_r);
    #endif

    #ifdef MOD_AREA_TRIPRISM
        float MOD_de=MOD_sdTriPrism(MOD_pos.xyz-vertexPos.xyz,vec2(MOD_size.x,MOD_size.z));
    #endif

    #ifdef MOD_AREA_HEXPRISM
        float MOD_de=MOD_sdHexPrism(MOD_pos.xyz-vertexPos.xyz,vec2(MOD_size.x,MOD_size.z));
    #endif

    #ifdef MOD_AREA_AXIS_X
        float MOD_de=abs(MOD_pos.x-vertexPos.x);
    #endif
    #ifdef MOD_AREA_AXIS_Y
        float MOD_de=abs(MOD_pos.y-vertexPos.y);
    #endif
    #ifdef MOD_AREA_AXIS_Z
        float MOD_de=abs(MOD_pos.z-vertexPos.z);
    #endif

    #ifdef MOD_AREA_AXIS_X_INFINITE
        float MOD_de=MOD_pos.x-vertexPos.x;
    #endif
    #ifdef MOD_AREA_AXIS_Y_INFINITE
        float MOD_de=MOD_pos.y-vertexPos.y;
    #endif
    #ifdef MOD_AREA_AXIS_Z_INFINITE
        float MOD_de=MOD_pos.z-vertexPos.z;
    #endif


    float MOD_deFO=1.0-MOD_map(
        MOD_de,
        0.0, MOD_fallOff,
        0.0,1.0
        );

    MOD_de=1.0-MOD_map(
        MOD_de,
        0.0, 0.000,
        0.0,1.0
        );

    #ifndef MOD_VIZ
        if(MOD_de>0.000)
        {
            mat4 m=MOD_createTransformMatrix(
                    MOD_changeTranslate*MOD_de,
                    MOD_changeScale*(MOD_deFO)
                    );

            if(calcNormal)
            {
                mat3 nm = mat3(transpose(inverse(m)));
                pos=vec4(normalize(nm*norm),0.0);
            }
            else
            {
                pos=m*pos;
            }
        }
        else
        {
           if(calcNormal)pos= vec4(norm,0.0);
        }
    #endif

    #ifdef MOD_VIZ
        MOD_viz=MOD_de;
    #endif

    return pos;

}
