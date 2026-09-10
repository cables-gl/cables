mat4 transform3d(mat4 m, vec3 translation, vec3 rotation, vec3 scale)
{
    rotation=radians(rotation);
    float cx = cos(rotation.x), sx = sin(rotation.x);
    float cy = cos(rotation.y), sy = sin(rotation.y);
    float cz = cos(rotation.z), sz = sin(rotation.z);
    mat4 trs;

    trs[0][0] = (cy * cz) * scale.x;
    trs[0][1] = (cy * sz) * scale.x;
    trs[0][2] = (-sy) * scale.x;
    trs[0][3] = 0.0;

    trs[1][0] = (sx * sy * cz - cx * sz) * scale.y;
    trs[1][1] = (sx * sy * sz + cx * cz) * scale.y;
    trs[1][2] = (sx * cy) * scale.y;
    trs[1][3] = 0.0;

    trs[2][0] = (cx * sy * cz + sx * sz) * scale.z;
    trs[2][1] = (cx * sy * sz - sx * cz) * scale.z;
    trs[2][2] = (cx * cy) * scale.z;
    trs[2][3] = 0.0;

    trs[3][0] = translation.x;
    trs[3][1] = translation.y;
    trs[3][2] = translation.z;
    trs[3][3] = 1.0;

    return m * trs;
}