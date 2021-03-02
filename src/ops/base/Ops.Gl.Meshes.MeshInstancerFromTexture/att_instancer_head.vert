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

// vec4 MOD_rot(vec4 pos, vec3 rot, mat4 modelMatrix)
// {
//     // pos=pos*rotationX(rot.x)*rotationY(rot.y)*rotationZ(rot.z);
//     pos.xyz*=ntorot( (rot-0.5) * 3.14*2.0 );

//     return pos;
// }
