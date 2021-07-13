IN vec2 texCoord;
UNI sampler2D tex;

UNI float modX;
UNI float modY;
UNI float modZ;

void main()
{
    vec4 col=texture(tex,texCoord);

    #ifdef MOD_MODULO_X
        col.x=mod(col.x,modX);
    #endif

    #ifdef MOD_MODULO_Z
        col.y=mod(col.y,modY);
    #endif

    #ifdef MOD_MODULO_Z
        col.z=mod(col.z,modZ);
    #endif

   outColor= col;
}
