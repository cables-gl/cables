#ifndef ATTRIB_instanceIndex
  #define ATTRIB_instanceIndex
  IN float instanceIndex;
#endif

#ifndef ATTRIB_instanceIndexFrag
  #define ATTRIB_instanceIndexFrag
  OUT float instanceIndexFrag;
#endif

UNI float MOD_rotX;
UNI float MOD_rotY;
UNI float MOD_rotZ;

UNI float MOD_posX;
UNI float MOD_posY;
UNI float MOD_posZ;

UNI float MOD_scaleX;
UNI float MOD_scaleY;
UNI float MOD_scaleZ;

UNI float MOD_start;
UNI float MOD_width;
UNI float MOD_transDist;

mat4 MOD_rotationMatrix(vec3 axis, float angle)
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
