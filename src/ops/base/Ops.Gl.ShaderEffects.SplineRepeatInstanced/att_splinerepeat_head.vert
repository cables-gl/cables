UNI highp float do_instancing;
UNI highp float MOD_scale;
UNI highp float MOD_rotation;
UNI highp float MOD_offset;
UNI highp float MOD_spacing;
UNI highp float MOD_numInstances;
UNI highp vec3 MOD_points[PATHFOLLOW_POINTS];

UNI highp float MOD_rotX;
UNI highp float MOD_rotY;
UNI highp float MOD_rotZ;

IN highp float MOD_index;

#ifdef TEX_SCALE
    UNI sampler2D MOD_texScale;
#endif



mat4 rotationMatrix(vec3 axis, highp float angle)
{
    axis = normalize(axis);
    highp float s = sin(angle);
    highp float c = cos(angle);
    highp float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}
