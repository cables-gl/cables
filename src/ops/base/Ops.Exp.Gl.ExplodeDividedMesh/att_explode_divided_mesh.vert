UNI float MOD_dist;

float MOD_rand(vec2 co){

    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

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


vec4 MOD_deform(vec4 pos,vec3 normal,float index)
{
    
    index=floor(index/3.0);
    
    vec4 pp=vec4(normal*(MOD_rand(vec2(index,index)) * MOD_dist-MOD_dist/2.0),1.0)*pos;
    
    // mat4 rotmat=MOD_rotationMatrix(vec3( MOD_rand(vec2(index+MOD_dist,index)*7.0) ), MOD_dist*4.0 );
    
    // pp*=rotmat;
    pos.xyz += pp.xyz;
    

    return pos;

}
