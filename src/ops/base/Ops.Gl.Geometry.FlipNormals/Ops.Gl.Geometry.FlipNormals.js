const
    geometry=op.inObject("Geometry"),
    outGeom=op.outObject("Result"),
    doFlip=op.inValueBool("Flip",true),
    doNormalize=op.inValueBool("Normalize",true);

doFlip.onChange=
    doNormalize.onChange=
    geometry.onChange=flip;

function flip()
{
    var oldGeom=geometry.get();

    if(!oldGeom)
    {
        outGeom.set(null);
        return;
    }


    var geom=oldGeom.copy();


    if(doFlip.get())
    {
        var i=0;

        for(i=0;i<geom.vertexNormals.length;i++)
        {
            geom.vertexNormals[i]*=-1;
        }

        if(doNormalize.get())
        {
            var vec=vec3.create();

            for(i=0;i<geom.vertexNormals.length;i+=3)
            {
                vec3.set(vec,
                    geom.vertexNormals[i+0],
                    geom.vertexNormals[i+1],
                    geom.vertexNormals[i+2]);
                vec3.normalize(vec,vec);

                geom.vertexNormals[i+0]=vec[0];
                geom.vertexNormals[i+1]=vec[1];
                geom.vertexNormals[i+2]=vec[2];
             }
         }
    }

    outGeom.set(geom);

}