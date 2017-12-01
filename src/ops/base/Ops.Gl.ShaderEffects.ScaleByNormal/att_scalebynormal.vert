

UNI float MOD_strength;
UNI float MOD_mod;


float random(vec2 co)
{
   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 437511.5453);
}


vec4 MOD_scaler(vec4 pos,float index,vec3 normal)
{
    if(mod(index,MOD_mod)==0.0)
        pos.xyz+=MOD_strength*(normal+random(pos.xy));
    
    
    // if(mod(index,4.0)==0.0){"ops":[{"name":"LambertMaterial","objName":"Ops.Gl.Phong.LambertMaterial","id":"55a4c711-4997-4fa5-8623-196f35fd5c8c","uiAttribs":{"translate":{"x":275.02960205078125,"y":458.0429992675781},"subPatch":0,"title":"LambertMaterial"},"portsIn":[{"name":"execute","links":[null]},{"name":"Specular","value":0},{"name":"diffuse r","value":0.699},{"name":"diffuse g","value":0.761},{"name":"diffuse b","value":0.292},{"name":"diffuse a","value":1}],"portsOut":[{"name":"next"}]}]}
        // pos.xyz=vec3(0.0);
    
    return pos; 
}
