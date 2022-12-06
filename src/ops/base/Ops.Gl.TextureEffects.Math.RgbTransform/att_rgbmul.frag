IN vec2 texCoord;
UNI sampler2D tex;
#ifdef MOD_MASK
    UNI sampler2D texMask;
#endif

UNI vec3 translate;
UNI vec3 scale;
UNI vec3 rot;



mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}


void main()
{
    vec4 col=texture(tex,texCoord);

    float mul=1.0;


    #ifdef MOD_MASK
        mul=texture(texMask,texCoord).r;
    #endif

    #ifdef DO_ROT
        col*=rotationMatrix(vec3(1.0,0.0,0.0), mul*rot.x/57.29577951308232);
        col*=rotationMatrix(vec3(0.0,1.0,0.0), mul*rot.y/57.29577951308232);
        col*=rotationMatrix(vec3(0.0,0.0,1.0), mul*rot.z/57.29577951308232);
    #endif

    #ifdef DO_SCALE
        col.xyz*=scale*mul;
    #endif

    #ifdef DO_TRANS
        col.xyz+=translate*mul;
    #endif

    outColor=col;
}
