IN vec3 norm;


void main()
{
    
    vec4 col=vec4(norm.x,norm.y,norm.z,1.0);
    gl_FragColor = col;
}