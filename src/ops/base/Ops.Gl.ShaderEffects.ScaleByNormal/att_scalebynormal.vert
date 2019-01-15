UNI float MOD_strength;

vec4 MOD_scaler(vec4 pos,vec3 normal)
{
    pos.xyz+=MOD_strength*(normal);
    return pos; 
}
