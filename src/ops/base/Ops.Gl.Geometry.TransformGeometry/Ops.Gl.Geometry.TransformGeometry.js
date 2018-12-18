var geometry=op.addInPort(new CABLES.Port(op,"Geometry",CABLES.OP_PORT_TYPE_OBJECT));
var transX=op.inValue("Translate X");
var transY=op.inValue("Translate Y");
var transZ=op.inValue("Translate Z");
var scaleX=op.inValueSlider("Scale X",1);
var scaleY=op.inValueSlider("Scale Y",1);
var scaleZ=op.inValueSlider("Scale Z",1);
var rotX=op.inValue("Rotation X");
var rotY=op.inValue("Rotation Y");
var rotZ=op.inValue("Rotation Z");

var outGeom=op.outObject("Result");

transX.onChange=
transY.onChange=
transZ.onChange=
scaleX.onChange=
scaleY.onChange=
scaleZ.onChange=
rotX.onChange=
rotY.onChange=
rotZ.onChange=
geometry.onChange=update;


function update()
{
    var oldGeom=geometry.get();
    var i=0;

    if(oldGeom)
    {
        var geom=oldGeom.copy();
        var rotVec=vec3.create();
        var emptyVec=vec3.create();
        var transVec=vec3.create();
        var centerVec=vec3.create();

        for(i=0;i<geom.vertices.length;i+=3)
        {
            geom.vertices[i+0]*=scaleX.get();
            geom.vertices[i+1]*=scaleY.get();
            geom.vertices[i+2]*=scaleZ.get();

            geom.vertices[i+0]+=transX.get();
            geom.vertices[i+1]+=transY.get();
            geom.vertices[i+2]+=transZ.get();
        }

        for(i=0;i<geom.vertices.length;i+=3)
        {

            vec3.set(rotVec,
                geom.vertices[i+0],
                geom.vertices[i+1],
                geom.vertices[i+2]);

            vec3.rotateX(rotVec,rotVec,transVec,rotX.get()*CGL.DEG2RAD);
            vec3.rotateY(rotVec,rotVec,transVec,rotY.get()*CGL.DEG2RAD);
            vec3.rotateZ(rotVec,rotVec,transVec,rotZ.get()*CGL.DEG2RAD);

            geom.vertices[i+0]=rotVec[0];
            geom.vertices[i+1]=rotVec[1];
            geom.vertices[i+2]=rotVec[2];


        }
        
        outGeom.set(null);
        outGeom.set(geom);
    }
    else
    {
        outGeom.set(null);
    }
    
    
    
}