IN vec2 texCoord;
UNI samplerCube cubeMap;

void main() {
    /*
    float phi=texCoord.s*3.1415*2.;
    float theta=(-texCoord.t+0.5)*3.1415;


    vec3 dir = vec3(cos(phi)*cos(theta),sin(theta),sin(phi)*cos(theta));

    //In this example i use a depthmap with only 1 channel, but the projection should work with a colored cubemap to
    vec4 color = texture(cubeMap, dir ).rgba;
    outColor = color;
    */

    vec4 depth=vec4(0.);
    vec2 localST=texCoord;




    //Scale Tex coordinates such that each quad has local coordinates from 0,0 to 1,1
    localST.t = mod(localST.t*3.,1.);
    localST.s = mod(localST.s*4.,1.);


    //Due to the way my depth-cubemap is rendered, objects to the -x,y,z side is projected to the positive x,y,z side


    //Inside where tob/bottom is to be drawn?
    if (texCoord.s*4.> 1. && texCoord.s*4.<2.)
    {
        //Bottom (-y) quad
        if (texCoord.t*3. < 1.)
        {
            vec3 dir=vec3(localST.s*2.-1.,1.,localST.t*2.-1.);//Get lower y texture, which is projected to the +y part of my cubemap

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif
        }
        //top (+y) quad
        else if (texCoord.t*3. > 2.)
        {
            vec3 dir=vec3(localST.s*2.-1.,-1.,-localST.t*2.+1.);//Due to the (arbitrary) way I choose as up in my depth-viewmatrix, i her emultiply the latter coordinate with -1

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif
        }
        else//Front (-z) quad
        {
            vec3 dir=vec3(localST.s*2.-1.,-localST.t*2.+1.,1.);

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif

        }


    }
    //If not, only these ranges should be drawn
    else if (texCoord.t*3. > 1. && texCoord.t*3. < 2.)
    {
        if (texCoord.x*4. < 1.)//left (-x) quad
        {
            vec3 dir=vec3(-1.,-localST.t*2.+1.,localST.s*2.-1.);

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif

        }
        else if (texCoord.x*4. < 3.)//right (+x) quad (front was done above)
        {
            vec3 dir=vec3(1,-localST.t*2.+1.,-localST.s*2.+1.);

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif

        }
        else //back (+z) quad
        {
            vec3 dir=vec3(-localST.s*2.+1.,-localST.t*2.+1.,-1.);

            #ifdef WEBGL2
            depth = texture( cubeMap, dir );
            #endif

            #ifdef WEBGL1
            depth = textureCube(cubeMap, dir);
            #endif

        }


    }
    else//Tob/bottom, but outside where we need to put something
    {
        discard;//No need to add fancy semi transparant borders for quads, this is just for debugging purpose after all
    }

    outColor = vec4(vec3(depth),1.);

}