IN mat4 instMat;
IN vec4 instColor;
IN float instanceIndex;
OUT mat4 instModelMat;
OUT vec4 frag_instColor;

#define INSTANCING
#define PI 3.14159265358

mat3 ntorot(vec3 r)
{
    float cx = cos(radians(r.x));
    float sx = sin(radians(r.x));
    float cy = cos(radians(r.y));
    float sy = sin(radians(r.y));
    float cz = cos(radians(r.z));
    float sz = sin(radians(r.z));

    return mat3(cy * cz, 	cx * sz + sx * sy * cz, 	sx * sz - cx * sy * cz,
    			-cy * sz,	cx * cz - sx * sy * sz,		sx * cz + cx * sy * sz,
    			sy,			-sx * cy,					cx * cy);
}

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

mat4 rotateMatrixDir(vec3 direction) {
        vec4 addition = vec4(0,0,0,1);
        mat4 transform= mat4(vec4(1.0, 0., 0.,0.),vec4( 0., 1.0,0.,0.),vec4( 0.,0.,1.0,0.), addition);

        //zero case
        if (direction.x == 0. && direction.z == 0. && direction.y>=0.) return transform;
        if (direction.x == 0. && direction.z == 0. && direction.y<0.) return mat4(vec4(-1.0, 0.,  0.,0.),vec4( 0., -1.0, 0.,0.),vec4( 0.,  0., -1.0,0.), addition);

        direction = normalize(direction);

        vec3 new_z = normalize(direction);
        vec3 new_y = normalize(cross(new_z, vec3(0.0, -1.0, 0.0)));
        vec3 new_x = normalize(cross(new_z, new_y));

        return mat4(vec4(new_y,0.), vec4(new_z,0.), vec4(new_x,0.),addition);
}


// vec4 MOD_rot(vec4 pos, vec3 rot, mat4 modelMatrix)
// {
//     // pos=pos*rotationX(rot.x)*rotationY(rot.y)*rotationZ(rot.z);
//     pos.xyz*=ntorot( (rot-0.5) * 3.14*2.0 );

//     return pos;
// }
