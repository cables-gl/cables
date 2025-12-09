UNI float do_instancing;
UNI float MOD_scale;

UNI float MOD_offset;
UNI float MOD_spacing;
UNI float MOD_numInstances;
UNI vec3 MOD_points[PATHFOLLOW_POINTS];

UNI float MOD_rotX;
UNI float MOD_rotY;
UNI float MOD_rotZ;

UNI float MOD_preRotX;
UNI float MOD_preRotY;
UNI float MOD_preRotZ;


IN float MOD_index;

#ifdef TEX_ROT
    UNI sampler2D MOD_texRot;
#endif

#ifdef TEX_SCALE
    UNI sampler2D MOD_texScale;
#endif



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
