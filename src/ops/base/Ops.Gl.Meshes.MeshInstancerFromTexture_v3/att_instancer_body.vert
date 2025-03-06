float tx=mod(instanceIndex,(MOD_texSizeX))/MOD_texSizeX+(1.0/MOD_texSizeX*0.5);
float ty=float(int((instanceIndex/(MOD_texSizeX))))/MOD_texSizeY+(1.0/MOD_texSizeY*0.5);

vec2 tc=vec2(tx,ty);

vec4 posCol=texture(MOD_texTrans,tc);
vec3 MOD_texPos=posCol.rgb*MOD_mulRGB;
mat4 texInstMat;
vec3 scale=vec3(1.0);

#ifdef USE_TEX_SCALE
    scale*=texture(MOD_texScale,tc).rgb;
#endif



texInstMat[0][0]=
texInstMat[1][1]=
texInstMat[2][2]=
texInstMat[3][3]=1.0;

#ifdef USE_TEX_ROT
    vec4 MOD_texRota=texture(MOD_texRot,tc);

    #ifdef ROT_EULER
        texInstMat*=rotationMatrix(vec3(1.0,0.0,0.0),MOD_texRota.r*PI*2.0);
        texInstMat*=rotationMatrix(vec3(0.0,1.0,0.0),MOD_texRota.g*PI*2.0);
        texInstMat*=rotationMatrix(vec3(0.0,0.0,1.0),MOD_texRota.b*PI*2.0);
    #endif
    #ifdef ROT_NORMAL
        texInstMat*=rotateMatrixDir(MOD_texRota.rgb);
    #endif
    #ifdef ROT_QUAT

        // MOD_texRota=normalize(MOD_texRota);


        texInstMat*=quat_to_mat4(quat(MOD_texRota.w,MOD_texRota.xyz));
    #endif

#endif

texInstMat[3][0]=MOD_texPos.x;
texInstMat[3][1]=MOD_texPos.y;
texInstMat[3][2]=MOD_texPos.z;


if(posCol.a<MOD_alphaThresh)
{
texInstMat[3][0]=
texInstMat[3][1]=
texInstMat[3][2]=999999.0;
    // scale=vec3(0.0); // use step ?
}


mat4 scalem;
scalem[0][0]=MOD_scale*scale.x;
scalem[1][1]=MOD_scale*scale.y;
scalem[2][2]=MOD_scale*scale.z;
scalem[3][3]=1.0;
texInstMat*=scalem;

mMatrix*=texInstMat;
#define TEXINSTMAT

#ifdef USE_TEX_COLOR

    vec4 instColor=texture(MOD_texColor,tc);
    frag_instColor=abs(instColor);
#endif

#ifdef USE_TEX_TC
    vec4 instTexCoords=texture(MOD_texCoords,tc);

    texCoord=(texCoord*instTexCoords.zw)+instTexCoords.xy;
#endif

frag_instIndex=instanceIndex;
