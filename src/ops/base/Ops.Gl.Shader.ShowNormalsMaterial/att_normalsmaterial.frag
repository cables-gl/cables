IN vec3 norm;
IN vec3 tangent;


void main()
{
    
    vec4 col=vec4(norm.x,norm.y,norm.z,1.0);
    
    // col.rgb=tangent;
    
    gl_FragColor = col;
}