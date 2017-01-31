op.name='Spline';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var thickness=op.addInPort(new Port(op,"thickness",OP_PORT_TYPE_VALUE));
var subDivs=op.addInPort(new Port(op,"subDivs",OP_PORT_TYPE_VALUE));
var bezier=op.addInPort(new Port(op,"Bezier",OP_PORT_TYPE_VALUE,{display:'bool'}));
var centerpoint=op.addInPort(new Port(op,"centerpoint",OP_PORT_TYPE_VALUE,{display:'bool'}));
var doClose=op.addInPort(new Port(op,"Closed",OP_PORT_TYPE_VALUE,{display:'bool'}));
var renderLines=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_VALUE,{display:'bool'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var triggerPoints=op.addOutPort(new Port(op,"triggerPoints",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));

renderLines.set(true);
centerpoint.set(false);
thickness.set(1.0);
outPoints.ignoreValueSerialize=true;

var points=[];
var mesh=null;
var oldLength=0;
var cgl=op.patch.cgl;


var geom=new CGL.Geometry();

var mySplinePoints=[];
var oldSplinePoints=null;
render.onTriggered=function()
{

    if(cgl.frameStore.SplinePoints) oldSplinePoints=cgl.frameStore.SplinePoints;

    mySplinePoints.length=0;
    cgl.frameStore.SplinePoints=mySplinePoints;
    

    var shader=cgl.getShader();
    trigger.trigger();
    if(!shader)return;
    bufferData();

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);
    
    if(renderLines.get() && mesh)
    {
        var oldPrim=shader.glPrimitive;
        if(centerpoint.get()) shader.glPrimitive=cgl.gl.LINES;
            shader.glPrimitive=cgl.gl.LINE_STRIP;
        
        cgl.gl.lineWidth(thickness.get());
        
        mesh.render(shader);
        shader.glPrimitive=oldPrim;
    }

    if(triggerPoints.isLinked())
    {
        for(var i=0;i<cgl.frameStore.SplinePoints.length;i+=3)
        {
            var vec=[0,0,0];
            vec3.set(vec, cgl.frameStore.SplinePoints[i+0], cgl.frameStore.SplinePoints[i+1], cgl.frameStore.SplinePoints[i+2]);
            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
            triggerPoints.trigger();
            cgl.popMvMatrix();
        }
    }

    outPoints.set(null);
    outPoints.set(points);

    cgl.popMvMatrix();
    // cgl.frameStore.SplinePoints.length=0;
    mySplinePoints.length=0;
    
    if(oldSplinePoints) cgl.frameStore.SplinePoints=oldSplinePoints;
    oldSplinePoints=null;

};

function ip(x0,x1,x2,t)//Bezier 
{
    var r =(x0 * (1-t) * (1-t) + 2 * x1 * (1 - t)* t + x2 * t * t);
    return r;
}

    
function bufferData()
{
    var i=0,k=0,j=0;
    var subd=subDivs.get();

    if(!cgl.frameStore.SplinePoints || cgl.frameStore.SplinePoints.length===0)return;
    points.length=0;

    if(doClose.get())
    {
        cgl.frameStore.SplinePoints.push(cgl.frameStore.SplinePoints[0]);
        cgl.frameStore.SplinePoints.push(cgl.frameStore.SplinePoints[1]);
        cgl.frameStore.SplinePoints.push(cgl.frameStore.SplinePoints[2]);
    }

    if(centerpoint.get())
    {
        for(i=0;i<cgl.frameStore.SplinePoints.length;i+=3)
        {
            //center point...
            points.push( cgl.frameStore.SplinePoints[0] );
            points.push( cgl.frameStore.SplinePoints[1] );
            points.push( cgl.frameStore.SplinePoints[2] );

            //other point
            points.push( cgl.frameStore.SplinePoints[i+0] );
            points.push( cgl.frameStore.SplinePoints[i+1] );
            points.push( cgl.frameStore.SplinePoints[i+2] );
        }

        // cgl.frameStore.SplinePoints=points;
    }
    else
    if(subd>0 && !bezier.get())
    {
        
        for(i=0;i<cgl.frameStore.SplinePoints.length-3;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    points.push(
                        cgl.frameStore.SplinePoints[i+k]+
                            ( cgl.frameStore.SplinePoints[i+k+3] - cgl.frameStore.SplinePoints[i+k] ) *
                            j/subd
                            );
                }
            }
        }
    }
    else
    if(subd>0 && bezier.get() )
    {

        for(i=3;i<cgl.frameStore.SplinePoints.length-6;i+=3)
        {
            for(j=0;j<subd;j++)
            {
                for(k=0;k<3;k++)
                {
                    var p=ip(
                            (cgl.frameStore.SplinePoints[i+k-3]+cgl.frameStore.SplinePoints[i+k])/2,
                            cgl.frameStore.SplinePoints[i+k+0],
                            (cgl.frameStore.SplinePoints[i+k+3]+cgl.frameStore.SplinePoints[i+k+0])/2,
                            j/subd
                            );

                    points.push(p);
                }
            }
        }
    }
    else
    {
        points = cgl.frameStore.SplinePoints.slice(); //fast array copy
    }

    if(thickness.get()<1) thickness.set(1);

    if(!points || points.length===0)
    {
        // console.log('no points...',cgl.frameStore.SplinePoints.length);
    }

    geom.vertices=points;
    
    if(oldLength!=geom.vertices.length)
    {
        oldLength=geom.vertices.length;
        geom.texCoords.length=0;
        geom.verticesIndices.length=0;
        for(i=0;i<geom.vertices.length;i+=3)
        {
            geom.texCoords.push(0);
            geom.texCoords.push(0);
            geom.verticesIndices.push(i/3);
        }
        
    }


    

    if(!mesh)  mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

}

bufferData();