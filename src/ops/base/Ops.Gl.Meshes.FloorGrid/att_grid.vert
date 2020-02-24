IN vec3 vPosition;
IN vec3 attrVertNormal;
IN vec2 attrTexCoord;

UNI mat4 projMatrix;
UNI mat4 modelMatrix;
UNI mat4 viewMatrix;

OUT vec4 posColor;
OUT vec3 posFrag;

void main()
{
    vec4 pos = vec4( vPosition, 1. );
    mat4 mMatrix=modelMatrix;

    mat4 mvMatrix=viewMatrix*mMatrix;
    posFrag=vPosition;
    posColor=vec4(0.6,0.6,0.6,0.4);

    if(pos.x==0.0) posColor=vec4(0.3,0.3,1.0,1.0);
    else if(pos.y==0.0 && pos.z==0.0) posColor=vec4(1.0,0.3,0.3,1.0);
    else if(mod(pos.z,10.0)==0.0 && mod(pos.x,10.0)==0.0 ) posColor.a=1.0;

    if(pos.y>0.0 && pos.x==0.0) posColor=vec4(0.3,1.0,0.3,1.0);

    gl_Position = projMatrix * mvMatrix * pos;
}
