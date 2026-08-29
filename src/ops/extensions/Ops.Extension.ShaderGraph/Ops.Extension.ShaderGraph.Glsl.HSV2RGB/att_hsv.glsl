vec4 hsb2rgb( float h,float s,float v ){
vec3 c=vec3(h,s,v);
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return vec4(c.z * mix( vec3(1.0), rgb, c.y),1.);
}