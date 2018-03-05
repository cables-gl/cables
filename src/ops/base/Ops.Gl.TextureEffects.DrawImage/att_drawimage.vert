IN vec3 vPosition;
IN vec2 attrTexCoord;
IN vec3 attrVertNormal;
OUT vec2 texCoord;
OUT vec3 norm;
UNI mat4 projMatrix;
UNI mat4 mvMatrix;

UNI float posX;
UNI float posY;
UNI float scale;
UNI float rotate;

OUT mat3 transform;

void main()
{
    texCoord=attrTexCoord;
    norm=attrVertNormal;

    #ifdef TEX_TRANSFORM
    vec3 coordinates=vec3(attrTexCoord.x, attrTexCoord.y,1.0);
    float angle = radians( rotate );
    vec2 scale= vec2(scale,scale);
    vec2 translate= vec2(posX,posY);

    transform = mat3(   scale.x * cos( angle ), scale.x * sin( angle ), 0.0,
                        - scale.y * sin( angle ), scale.y * cos( angle ), 0.0,
                        - 0.5 * scale.x * cos( angle ) + 0.5 * scale.y * sin( angle ) - 0.5 * translate.x*2.0 + 0.5,  - 0.5 * scale.x * sin( angle ) - 0.5 * scale.y * cos( angle ) - 0.5 * translate.y*2.0 + 0.5, 1.0);
    #endif

    gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);
}