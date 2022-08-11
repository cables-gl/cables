IN vec2 texCoord;
UNI sampler2D tex;
UNI samplerCube cubeMap;
UNI float width;
UNI float height;
UNI float type;
UNI float time;

float LinearizeDepth(float d,float zNear,float zFar)
{
    float z_n = 2.0 * d - 1.0;
    return 2.0 * zNear / (zFar + zNear - z_n * (zFar - zNear));
}

void main()
{
    vec4 col=vec4(vec3(0.),0.0);

    vec4 colTex=texture2D(tex,texCoord);

    if(colTex.r>1.0||colTex.g>1.0||colTex.b>1.0)
    {
        float r=mod( (time*2.0)+(texCoord.x+texCoord.y)*10.0,0.5)+0.5;
        colTex=vec4( 1.0,r,r,1.0);
    }
    if(colTex.r<0.0||colTex.g<0.0||colTex.b<0.0)
    {
        float r=mod( (time*2.0)+(texCoord.x+texCoord.y)*10.0,0.5);
        colTex=vec4( r,0.0,0.0,1.0);
    }


    if(type==1.0)
    {
        vec4 depth=vec4(0.);
        vec2 localST=texCoord;
        localST.y = 1. - localST.y;

        localST.t = mod(localST.t*3.,1.);
        localST.s = mod(localST.s*4.,1.);

        #ifdef WEBGL2
            #define texCube texture
        #endif
        #ifdef WEBGL1
            #define texCube textureCube
        #endif

//         //Due to the way my depth-cubeMap is rendered, objects to the -x,y,z side is projected to the positive x,y,z side
//         //Inside where top/bottom is to be drawn?
        if (texCoord.s*4.> 1. && texCoord.s*4.<2.)
        {
            //Bottom (-y) quad
            if (texCoord.t*3. < 1.)
            {
                vec3 dir=vec3(localST.s*2.-1.,-1.,-localST.t*2.+1.);//Due to the (arbitrary) way I choose as up in my depth-viewmatrix, i her emultiply the latter coordinate with -1
                depth = texCube(cubeMap, dir);
            }
            //top (+y) quad
            else if (texCoord.t*3. > 2.)
            {
                vec3 dir=vec3(localST.s*2.-1.,1.,localST.t*2.-1.);//Get lower y texture, which is projected to the +y part of my cubeMap
                depth = texCube(cubeMap, dir);
            }
            else//Front (-z) quad
            {
                vec3 dir=vec3(localST.s*2.-1.,-localST.t*2.+1.,1.);
                depth = texCube(cubeMap, dir);
            }
        }
//         //If not, only these ranges should be drawn
        else if (texCoord.t*3. > 1. && texCoord.t*3. < 2.)
        {
            if (texCoord.x*4. < 1.)//left (-x) quad
            {
                vec3 dir=vec3(-1.,-localST.t*2.+1.,localST.s*2.-1.);
                depth = texCube(cubeMap, dir);
            }
            else if (texCoord.x*4. < 3.)//right (+x) quad (front was done above)
            {
                vec3 dir=vec3(1,-localST.t*2.+1.,-localST.s*2.+1.);
                depth = texCube(cubeMap, dir);
            }
            else //back (+z) quad
            {
                vec3 dir=vec3(-localST.s*2.+1.,-localST.t*2.+1.,-1.);
                depth = texCube(cubeMap, dir);
            }
        }
        colTex = vec4(vec3(depth),1.);
    }

    if(type==2.0)
    {
       float near = 0.1;
       float far = 50.;
       float depth = LinearizeDepth(colTex.r, near, far);
       colTex.rgb = vec3(depth);
    }


    outColor = mix(col,colTex,colTex.a);
}

