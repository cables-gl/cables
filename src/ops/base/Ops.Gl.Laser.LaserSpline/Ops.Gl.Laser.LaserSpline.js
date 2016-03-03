
Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;
cgl.frameStore.SplinePoints=[];

this.name='LaserSpline';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));

this.thickness=this.addInPort(new Port(this,"thickness",OP_PORT_TYPE_VALUE));
this.thickness.val=1.0;

this.centerpoint=this.addInPort(new Port(this,"centerpoint",OP_PORT_TYPE_VALUE,{display:'bool'}));
this.centerpoint.val=false;

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.triggerPoints=this.addOutPort(new Port(this,"triggerPoints",OP_PORT_TYPE_FUNCTION));

var outObj=this.addOutPort(new Port(this,"json",OP_PORT_TYPE_ARRAY));

var outNumPoints=this.addOutPort(new Port(this,"numPoints",OP_PORT_TYPE_VALUE));

var fov=this.addInPort(new Port(this,"fov",OP_PORT_TYPE_VALUE));
var w=this.addInPort(new Port(this,"w",OP_PORT_TYPE_VALUE));
var h=this.addInPort(new Port(this,"h",OP_PORT_TYPE_VALUE));

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

var laserObj=[];

this.render.onTriggered=function()
{
    if(!cgl.frameStore.laserPoints)cgl.frameStore.laserPoints=[];
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

    var projMat=mat4.create();
    mat4.perspective(projMat,30, 1, 0.1,2000);

    function project(vec,viewWidth, viewHeight, fov, viewDistance)
    {
        var v=vec3.create();
        var factor, x, y;
        factor = fov / (viewDistance + vec[2]);
        x = vec[0] * factor + viewWidth / 2;
        y = vec[1] * factor + viewHeight / 2;
        vec3.set(v,x,y);
        return v;
    }

    var lastR=255;
    var lastG=255;
    var lastB=255;

    var numPoints=0;
    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {
        numPoints+=parseInt(cgl.frameStore.laserPoints[i].num,10);
    }
    laserObj.length=numPoints*5;

    var ind=0;
    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {
        var vec=[0,0,0];
        vec3.set(vec, cgl.frameStore.laserPoints[i].x, cgl.frameStore.laserPoints[i].y, cgl.frameStore.laserPoints[i].z);
        // cgl.popMvMatrix();
        
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        self.triggerPoints.trigger();
        cgl.popMvMatrix();

        var point=[
            cgl.frameStore.laserPoints[i].x, 
            cgl.frameStore.laserPoints[i].y, 
            cgl.frameStore.laserPoints[i].z];
        
        var vv=project(point,w.get(),h.get(),fov.get(),0.01);//viewWidth, viewHeight, fov, viewDistance)


        for(var ni=0;ni<cgl.frameStore.laserPoints[i].num;ni++)
        {
            laserObj[ind*5+0] = -1*vv[0];
            laserObj[ind*5+1] = -1*vv[1];
            laserObj[ind*5+2] = (cgl.frameStore.laserPoints[i].colR || lastR)*255;
            laserObj[ind*5+3] = (cgl.frameStore.laserPoints[i].colG || lastG)*255;
            laserObj[ind*5+4] = (cgl.frameStore.laserPoints[i].colB || lastB)*255;
            ind++;
        }

        if(cgl.frameStore.laserPoints[i].colR) lastR=cgl.frameStore.laserPoints[i].colR;
        if(cgl.frameStore.laserPoints[i].colG) lastG=cgl.frameStore.laserPoints[i].colG;
        if(cgl.frameStore.laserPoints[i].colB) lastB=cgl.frameStore.laserPoints[i].colB;
    }

    outNumPoints.set(ind);

    cgl.popMvMatrix();
    cgl.frameStore.laserPoints.length=0;
    outObj.set(laserObj);
};

function bufferData()
{
    if(!cgl.frameStore.laserPoints)cgl.frameStore.laserPoints=[];
    var points=[];

    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {
        //center point...
        if(self.centerpoint.get())
        {
            points.push( cgl.frameStore.laserPoints[0].x );
            points.push( cgl.frameStore.laserPoints[0].y );
            points.push( cgl.frameStore.laserPoints[0].z );
        }

        //other point
        points.push( cgl.frameStore.laserPoints[i].x );
        points.push( cgl.frameStore.laserPoints[i].y );
        points.push( cgl.frameStore.laserPoints[i].z );
    }

    cgl.frameStore.SplinePoints=points;


    if(self.thickness.get()<1)self.thickness.set(1);

    cgl.gl.lineWidth(self.thickness.val);
    cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffer);
    cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, new Float32Array(cgl.frameStore.SplinePoints), cgl.gl.STATIC_DRAW);
    buffer.itemSize = 3;
    buffer.numItems = cgl.frameStore.SplinePoints.length/buffer.itemSize;
}

bufferData();