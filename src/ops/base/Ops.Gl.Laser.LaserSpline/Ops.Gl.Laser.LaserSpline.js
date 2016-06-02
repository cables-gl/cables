
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

var coordmul=this.addInPort(new Port(this,"mul",OP_PORT_TYPE_VALUE));
var coordClamp=this.addInPort(new Port(this,"clamp",OP_PORT_TYPE_VALUE));

var colorMul=this.addInPort(new Port(this,"color intensity",OP_PORT_TYPE_VALUE));
colorMul.set(1.0);
var buffer = cgl.gl.createBuffer();


var hue=this.addInPort(new Port(this,"hue",OP_PORT_TYPE_VALUE));
colorMul.set(1.0);


var showR=this.addInPort(new Port(this,"show r",OP_PORT_TYPE_VALUE,{display:'bool'}));
var showG=this.addInPort(new Port(this,"show g",OP_PORT_TYPE_VALUE,{display:'bool'}));
var showB=this.addInPort(new Port(this,"show b",OP_PORT_TYPE_VALUE,{display:'bool'}));


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
var stride=6;

this.render.onTriggered=function()
{
    if(!cgl.frameStore.laserPoints)cgl.frameStore.laserPoints=[];
    var shader=cgl.getShader();
    self.trigger.trigger();
    
    if(!shader)return;
    bufferData();

    cgl.pushMvMatrix();
    mat4.identity(cgl.mvMatrix);

    if(mesh) mesh.render(cgl.getShader());

    function project(vec,viewWidth, viewHeight, fov, viewDistance)
    {
        var v=vec3.create();
        var factor, x, y;
        factor = fov / (viewDistance + vec[2]);
        x = vec[0] * factor + viewWidth / 2;
        y = vec[1] * factor + viewHeight / 2;
        vec3.set(v,x,y,0);
        return v;
    }
    


    var minX=9999999;
    var maxX=-9999999;
    var minY=9999999;
    var maxY=-9999999;
    

    var lastR=0;
    var lastG=0;
    var lastB=0;

    var numPoints=0;
    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {
        numPoints+=parseInt(Math.abs(cgl.frameStore.laserPoints[i].num),10);
    }
    laserObj.length=numPoints*stride;

    var ind=0;
    var lastX=0;
    var lastY=0;
    var addBlack=false;

    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {
        var vec=[0,0,0];
        vec3.set(vec, cgl.frameStore.laserPoints[i].x, cgl.frameStore.laserPoints[i].y, cgl.frameStore.laserPoints[i].z);
        
        cgl.pushMvMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        self.triggerPoints.trigger();
        cgl.popMvMatrix();

        var point=[
            cgl.frameStore.laserPoints[i].x, 
            cgl.frameStore.laserPoints[i].y, 
            cgl.frameStore.laserPoints[i].z];
        
        var vv=project(point,w.get(),h.get(),fov.get(),0.01);//viewWidth, viewHeight, fov, viewDistance)

        for(var ni=0;ni<Math.abs(cgl.frameStore.laserPoints[i].num);ni++)
        {
            var x=Math.round(-1*vv[0]*coordmul.get());
            var y=Math.round(-1*vv[1]*coordmul.get());

            var clamped=false;
            if(x>coordClamp.get()) 
            {
                clamped=true;
                x=coordClamp.get();
            }
            if(y>coordClamp.get())
            {
                clamped=true;
                y=coordClamp.get();
            }
            if(x<0-coordClamp.get()) 
            {
                clamped=true;
                x=0-coordClamp.get();
            }
            if(y<0-coordClamp.get())
            {
                clamped=true;
                y=0-coordClamp.get();
            }
    
            if(addBlack)
            {
                
                for(var nn=0;nn<2;nn++)
                {
                    laserObj[ind*stride+0] = x;
                    laserObj[ind*stride+1] = y;
                    laserObj[ind*stride+2] = 0;
                    laserObj[ind*stride+3] = 0;
                    laserObj[ind*stride+4] = 0;
                    laserObj[ind*stride+5] = 0;
                    ind++;
                }
    
                addBlack=false;
            }

            minX=Math.min(x,minX);
            maxX=Math.max(x,maxX);
            
            minY=Math.min(y,minY);
            maxY=Math.max(y,maxY);

            laserObj[ind*stride+0] = x;
            laserObj[ind*stride+1] = y;
            laserObj[ind*stride+2] = 0;

            if(cgl.frameStore.laserPoints[i].hasOwnProperty('colR'))
            {
                cgl.frameStore.laserPoints[i].colR*=colorMul.get();
                lastR=cgl.frameStore.laserPoints[i].colR;
            }
            else cgl.frameStore.laserPoints[i].colR=lastR;
            
            if(cgl.frameStore.laserPoints[i].hasOwnProperty('colG'))
            {
                cgl.frameStore.laserPoints[i].colG*=colorMul.get();
                lastG=cgl.frameStore.laserPoints[i].colG;
            }
            else cgl.frameStore.laserPoints[i].colG=lastG;
            
            if(cgl.frameStore.laserPoints[i].hasOwnProperty('colB'))
            {
                cgl.frameStore.laserPoints[i].colB*=colorMul.get();
                lastB=cgl.frameStore.laserPoints[i].colB;
            }
            else cgl.frameStore.laserPoints[i].colB=lastB;


            laserObj[ind*stride+3] = cgl.frameStore.laserPoints[i].colR*255;//parseInt((cgl.frameStore.laserPoints[i].colR || lastR)*255*colorMul.get(),10);
            laserObj[ind*stride+4] = cgl.frameStore.laserPoints[i].colG*255;//parseInt((cgl.frameStore.laserPoints[i].colG || lastG)*255*colorMul.get(),10);
            laserObj[ind*stride+5] = cgl.frameStore.laserPoints[i].colB*255;//parseInt((cgl.frameStore.laserPoints[i].colB || lastB)*255*colorMul.get(),10);

            
            if(!showR.get()) laserObj[ind*stride+3]=0;
            if(!showG.get()) laserObj[ind*stride+4]=0;
            if(!showB.get()) laserObj[ind*stride+5]=0;

            ind++;

        }
        if(cgl.frameStore.laserPoints[i].hasOwnProperty('black')) addBlack=true;

        lastX=x;
        lastY=y;
    }

    laserObj.push(lastX);
    laserObj.push(lastY);
    laserObj.push(0);
    laserObj.push(0);
    laserObj.push(0);
    laserObj.push(0);

    laserObj.push(lastX);
    laserObj.push(lastY);
    laserObj.push(0);
    laserObj.push(0);
    laserObj.push(0);
    laserObj.push(0);

    // console.log('minmax',minX,maxX,minY,maxY);

    outNumPoints.set(ind);
    cgl.popMvMatrix();
    cgl.frameStore.laserPoints.length=0;
    outObj.set(laserObj);
};


var mesh=null;
var geom=new CGL.Geometry();

function bufferData()
{
    if(!cgl.frameStore.laserPoints)cgl.frameStore.laserPoints=[];
    var verts=[];
    var indices=[];
    var vertsColors=[];

    var colR=0;
    var colG=0;
    var colB=0;
    var addBlack=false;
    var index=0;
    for(var i=0;i<cgl.frameStore.laserPoints.length;i++)
    {

        //other point
        verts.push( cgl.frameStore.laserPoints[i].x );
        verts.push( cgl.frameStore.laserPoints[i].y );
        verts.push( cgl.frameStore.laserPoints[i].z );

        if(cgl.frameStore.laserPoints[i].hasOwnProperty('colR'))
            colR=cgl.frameStore.laserPoints[i].colR;
        
        if(cgl.frameStore.laserPoints[i].hasOwnProperty('colG'))
            colG=cgl.frameStore.laserPoints[i].colG;
        
        if(cgl.frameStore.laserPoints[i].hasOwnProperty('colB'))
            colB=cgl.frameStore.laserPoints[i].colB;
        
        if(addBlack)
        {
            addBlack=false;

            vertsColors.push(0);
            vertsColors.push(0);
            vertsColors.push(0);
            vertsColors.push(1);

            verts.push( cgl.frameStore.laserPoints[i].x );
            verts.push( cgl.frameStore.laserPoints[i].y );
            verts.push( cgl.frameStore.laserPoints[i].z );

            
            indices[index]=index;
            index++;
        }
        
        
        vertsColors.push(colR);
        vertsColors.push(colG);
        vertsColors.push(colB);
        vertsColors.push(1);
        
        if(cgl.frameStore.laserPoints[i].hasOwnProperty('black'))
        {
            addBlack=true;
        }

    
        indices[index]=index;
        index++;
    }

    cgl.frameStore.SplinePoints=verts;

    

    geom.vertices=verts;
    geom.vertexColors=vertsColors;
    geom.verticesIndices=indices;

    if(!mesh) mesh=new CGL.Mesh(cgl,geom,cgl.gl.LINE_STRIP);
    mesh.setGeom(geom);

}

bufferData();