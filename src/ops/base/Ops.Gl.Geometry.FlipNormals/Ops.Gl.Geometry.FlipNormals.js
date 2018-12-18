
const geometry=op.addInPort(new CABLES.Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));
const outGeom=op.outObject("Result");

const doFlip=op.inValueBool("Flip",true);
const doNormalize=op.inValueBool("Normalize",true);

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

        for(var i=0;i<geom.vertexNormals.length;i++)
        {
            geom.vertexNormals[i]*=-1;
        }
        
        if(doNormalize.get())
        {
            var vec=vec3.create();
    
            for(var i=0;i<geom.vertexNormals.length;i+=3)
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