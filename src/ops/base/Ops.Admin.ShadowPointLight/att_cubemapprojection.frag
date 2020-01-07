IN vec2 texCoord;
UNI samplerCube cubeMap;

void main() {
    /*
    float phi=texCoord.s*3.1415*2.;
    float theta=(-texCoord.t+0.5)*3.1415;


    vec3 dir = vec3(cos(phi)*cos(theta),sin(theta),sin(phi)*cos(theta));

    //In this example i use a debthmap with only 1 channel, but the projection should work with a colored cubemap to
    vec4 color = texture(cubeMap, dir ).rgba;
    outColor = color;
    */

    vec4 debth=vec4(0.);
    vec2 localST=texCoord;




    //Scale Tex coordinates such that each quad has local coordinates from 0,0 to 1,1
    localST.t = mod(localST.t*3.,1.);
    localST.s = mod(localST.s*4.,1.);


    //Due to the way my debth-cubemap is rendered, objects to the -x,y,z side is projected to the positive x,y,z side


    //Inside where tob/bottom is to be drawn?
    if (texCoord.s*4.> 1. && texCoord.s*4.<2.)
    {
        //Bottom (-y) quad
        if (texCoord.t*3.f < 1.)
        {
            vec3 dir=vec3(localST.s*2.-1.,1.,localST.t*2.-1.);//Get lower y texture, which is projected to the +y part of my cubemap

            debth = texture( cubeMap, dir );
        }
        //top (+y) quad
        else if (texCoord.t*3.f > 2.)
        {
            vec3 dir=vec3(localST.s*2.-1.,-1.,-localST.t*2.+1.);//Due to the (arbitrary) way I choose as up in my debth-viewmatrix, i her emultiply the latter coordinate with -1

            debth = texture( cubeMap, dir );
        }
        else//Front (-z) quad
        {
            vec3 dir=vec3(localST.s*2.-1.,-localST.t*2.+1.,1.);

            debth = texture( cubeMap, dir );

        }


    }
    //If not, only these ranges should be drawn
    else if (texCoord.t*3.f > 1. && texCoord.t*3. < 2.)
    {
        if (texCoord.x*4.f < 1.)//left (-x) quad
        {
            vec3 dir=vec3(-1.,-localST.t*2.+1.,localST.s*2.-1.);

            debth = texture( cubeMap, dir );

        }
        else if (texCoord.x*4.f < 3.)//right (+x) quad (front was done above)
        {
            vec3 dir=vec3(1,-localST.t*2.+1.,-localST.s*2.+1.);

            debth = texture( cubeMap, dir );

        }
        else //back (+z) quad
        {
            vec3 dir=vec3(-localST.s*2.+1.,-localST.t*2.+1.,-1.);

            debth = texture( cubeMap, dir );

        }


    }
    else//Tob/bottom, but outside where we need to put something
    {
        discard;//No need to add fancy semi transparant borders for quads, this is just for debugging purpose after all
    }

    outColor = vec4(vec3(debth),1.);

}