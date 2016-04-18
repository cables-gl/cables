op.name='Spline';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var thickness=op.addInPort(new Port(op,"thickness",OP_PORT_TYPE_VALUE));
var subDivs=op.addInPort(new Port(op,"subDivs",OP_PORT_TYPE_VALUE));
var bezier=op.addInPort(new Port(op,"Bezier",OP_PORT_TYPE_VALUE,{display:'bool'}));
var centerpoint=op.addInPort(new Port(op,"centerpoint",OP_PORT_TYPE_VALUE,{display:'bool'}));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var triggerPoints=op.addOutPort(new Port(op,"triggerPoints",OP_PORT_TYPE_FUNCTION));

centerpoint.set(false);
thickness.set(1.0);

var cgl=op.patch.cgl;
var buffer = cgl.gl.createBuffer();
cgl.frameStore.SplinePoints=[];


render.onTriggered=function()
{
    cgl.frameStore.SplinePoints.length=0;

    var shader=cgl.getShader();
    trigger.trigger();
    if(!shader)return;
    bufferData();

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);

    
    shader.bind();
    cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
    cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    if(centerpoint.get())cgl.gl.drawArrays(cgl.gl.LINES, 0, buffer.numItems);
      else cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

    for(var i=0;i<cgl.frameStore.SplinePoints.length;i+=3)
    {
        var vec=[0,0,0];
        vec3.set(vec, cgl.frameStore.SplinePoints[i+0], cgl.frameStore.SplinePoints[i+1], cgl.frameStore.SplinePoints[i+2]);
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        triggerPoints.trigger();
        cgl.popMvMatrix();
    }

    cgl.popMvMatrix();

    cgl.frameStore.SplinePoints.length=0;
};

function ip(x0,x1,x2,t)//Bezier 
{
    var r =(x0 * (1-t) * (1-t) + 2 * x1 * (1 - t)* t + x2 * t * t);
    return r;
}
    
function bufferData()
{
    var subd=subDivs.get();

    if(centerpoint.get())
    {
        var points=[];

        for(var i=0;i<cgl.frameStore.SplinePoints.length;i+=3)
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

        cgl.frameStore.SplinePoints=points;
    }

    if(subd>0 && !bezier.get())
    {
        var points=[];
        for(var i=0;i<cgl.frameStore.SplinePoints.length-3;i+=3)
        {
            for(var j=0;j<subd;j++)
            {
                for(var k=0;k<3;k++)
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
    if(subd>0 && bezier.get())
    {
        var points=[];

        for(var i=3;i<cgl.frameStore.SplinePoints.length-6;i+=3)
        {
            for(var j=0;j<subd;j++)
            {
                for(var k=0;k<3;k++)
                {
                    var p=ip(
                            (cgl.frameStore.SplinePoints[i+k-3]+cgl.frameStore.SplinePoints[i+k])/2,
                            cgl.frameStore.SplinePoints[i+k+0],
                            (cgl.frameStore.SplinePoints[i+k+3]+cgl.frameStore.SplinePoints[i+k+0])/2,
                            j/subd
                            )

                            ;
                            
                    points.push(p);

                }


            }
        }



        cgl.frameStore.SplinePoints=points;
    }

    if(thickness.get()<1)thickness.set(1);

    cgl.gl.lineWidth(thickness.get());
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(cgl.frameStore.SplinePoints), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = cgl.frameStore.SplinePoints.length/buffer.itemSize;
}

bufferData();