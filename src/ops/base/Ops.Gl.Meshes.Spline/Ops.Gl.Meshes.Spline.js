Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;
cgl.frameStore.SplinePoints=[];

this.name='Spline';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.thickness=this.addInPort(new Port(this,"thickness",OP_PORT_TYPE_VALUE));
this.thickness.val=1.0;

this.subDivs=this.addInPort(new Port(this,"subDivs",OP_PORT_TYPE_VALUE));
this.centerpoint=this.addInPort(new Port(this,"centerpoint",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.centerpoint.val=false;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.triggerPoints=this.addOutPort(new Port(this,"triggerPoints",OP_PORT_TYPE_FUNCTION));

var buffer = cgl.gl.createBuffer();

function easeSmoothStep(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*(3 - 2*x); // smoothstep
    return perc;
}

function easeSmootherStep(perc)
{
    var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
    perc= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
    return perc;
}

this.render.onTriggered=function()
{
    var shader=cgl.getShader();
    self.trigger.trigger();
    if(!shader)return;
    bufferData();

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);

    
    shader.bind();
    cgl.gl.vertexAttribPointer(cgl.getShader().getAttrVertexPos(),buffer.itemSize, cgl.gl.FLOAT, false, 0, 0);
    cgl.gl.enableVertexAttribArray(cgl.getShader().getAttrVertexPos());

    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    if(self.centerpoint.val)cgl.gl.drawArrays(cgl.gl.LINES, 0, buffer.numItems);
      else cgl.gl.drawArrays(cgl.gl.LINE_STRIP, 0, buffer.numItems);

    for(var i=0;i<cgl.frameStore.SplinePoints.length;i+=3)
    {
        var vec=[0,0,0];
        vec3.set(vec, cgl.frameStore.SplinePoints[i+0], cgl.frameStore.SplinePoints[i+1], cgl.frameStore.SplinePoints[i+2]);
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        self.triggerPoints.trigger();
        cgl.popMvMatrix();
    }

    cgl.popMvMatrix();

    cgl.frameStore.SplinePoints.length=0;
};

function bufferData()
{
    var subd=self.subDivs.val;

    if(self.centerpoint.val)
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

    // if(subd>0)
    // {
        // var points=[];
    //     for(var i=0;i<cgl.frameStore.SplinePoints.length-3;i+=3)
    //     {
    //         for(var j=0;j<subd;j++)
    //         {
    //             for(var k=0;k<3;k++)
    //             {
    //                 points.push(
    //                     cgl.frameStore.SplinePoints[i+k]+
    //                         ( cgl.frameStore.SplinePoints[i+k+3] - cgl.frameStore.SplinePoints[i+k] ) *
    //                         easeSmootherStep(j/subd)
    //                         );
    //             }

    //             // console.log('easeSmootherStep(j/subd)',easeSmootherStep(j/subd));
                        
    //         }
    //     }

    // // console.log('cgl.frameStore.SplinePoints',cgl.frameStore.SplinePoints.length);
    // // console.log('points',points.length);
    

    //     cgl.frameStore.SplinePoints=points;
    // }

    if(self.thickness.get()<1)self.thickness.set(1);

    cgl.gl.lineWidth(self.thickness.val);
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(cgl.frameStore.SplinePoints), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = cgl.frameStore.SplinePoints.length/buffer.itemSize;
}

bufferData();