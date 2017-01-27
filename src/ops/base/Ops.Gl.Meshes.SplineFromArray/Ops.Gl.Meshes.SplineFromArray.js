op.name="SplineFromArray";

var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));

var inIndex=op.inValue("index");

var inPoints=op.inArray("points");



var subDivs=op.addInPort(new Port(op,"subDivs",OP_PORT_TYPE_VALUE));
var bezier=op.addInPort(new Port(op,"Bezier",OP_PORT_TYPE_VALUE,{display:'bool'}));
var centerpoint=op.addInPort(new Port(op,"centerpoint",OP_PORT_TYPE_VALUE,{display:'bool'}));
var doClose=op.addInPort(new Port(op,"Closed",OP_PORT_TYPE_VALUE,{display:'bool'}));



var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));


var cgl=op.patch.cgl;
var splines=[];


var Spline=function()
{
    this.mesh=null;
    this.points=[];
    this.geom=new CGL.Geometry();
    this.oldLength=0;
};


inPoints.onChange=function()
{
    var indx=Math.floor(inIndex.get());
    var pointArr=inPoints.get();
    if(!pointArr)return;
    if(indx<0)return;
    if(!splines[indx])
    {
        splines[indx]=new Spline();
    }
    bufferData(splines[indx],pointArr);
};



render.onTriggered=function()
{

};



function bufferData(spline,pointArr)
{
    var i=0,k=0,j=0;
    var subd=subDivs.get();

    // if(!points || pointArr.length===0)return;
    spline.points.length=0;

    if(doClose.get())
    {
        pointArr.push(pointArr[0]);
        pointArr.push(pointArr[1]);
        pointArr.push(pointArr[2]);
    }

    if(centerpoint.get())
    {
        for(i=0;i<pointArr.length;i+=3)
        {
            //center point...
            spline.points.push( pointArr[0] );
            spline.points.push( pointArr[1] );
            spline.points.push( pointArr[2] );

            //other point
            spline.points.push( pointArr[i+0] );
            spline.points.push( pointArr[i+1] );
            spline.points.push( pointArr[i+2] );
        }

        // pointArr=points;
    }
    else
    if(subd>0 && !bezier.get())
    {
        
        for(i=0;i<pointArr.length-3;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    spline.points.push(
                        pointArr[i+k]+
                            ( pointArr[i+k+3] - pointArr[i+k] ) *
                            j/subd
                            );
                }
            }
        }
    }
    else
    if(subd>0 && bezier.get() )
    {

        for(i=3;i<pointArr.length-6;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    var p=ip(
                            (pointArr[i+k-3]+pointArr[i+k])/2,
                            pointArr[i+k+0],
                            (pointArr[i+k+3]+pointArr[i+k+0])/2,
                            j/subd
                            );

                    spline.points.push(p);
                }
            }
        }
    }
    else
    {
        points = pointArr.slice(); //fast array copy
    }

    // if(thickness.get()<1) thickness.set(1);

    if(!points || points.length===0)
    {
        // console.log('no points...',pointArr.length);
    }

    spline.geom.vertices=points;
    
    if(spline.oldLength!=spline.geom.vertices.length)
    {
        spline.oldLength=spline.geom.vertices.length;
        spline.geom.texCoords.length=0;
        spline.geom.verticesIndices.length=0;
        for(i=0;i<spline.geom.vertices.length;i+=3)
        {
            spline.geom.texCoords.push(0);
            spline.geom.texCoords.push(0);
            spline.geom.verticesIndices.push(i/3);
        }
        
    }


    

    if(!spline.mesh)  spline.mesh=new CGL.Mesh(cgl,spline.geom);
        else spline.mesh.setGeom(spline.geom);

}