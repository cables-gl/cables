
var exe=op.inFunction("Exec");
var inArr=op.inArray("Array3x");

var fov=this.addInPort(new CABLES.Port(this,"fov",CABLES.OP_PORT_TYPE_VALUE));
var w=this.addInPort(new CABLES.Port(this,"w",CABLES.OP_PORT_TYPE_VALUE));
var h=this.addInPort(new CABLES.Port(this,"h",CABLES.OP_PORT_TYPE_VALUE));

var px=this.addInPort(new CABLES.Port(this,"Pos X",CABLES.OP_PORT_TYPE_VALUE));
var py=this.addInPort(new CABLES.Port(this,"Pos Y",CABLES.OP_PORT_TYPE_VALUE));

var coordmul=this.addInPort(new CABLES.Port(this,"mul",CABLES.OP_PORT_TYPE_VALUE));
// var coordClamp=this.addInPort(new CABLES.Port(this,"clamp",CABLES.OP_PORT_TYPE_VALUE));

exe.onTriggered=function()
{
    if(needsUpdate) update();
};


var outArr=op.outArray("Array2x");

var needsUpdate=false;

var minX=9999999;
var maxX=-9999999;
var minY=9999999;
var maxY=-9999999;

var cgl=op.patch.cgl;

function project(vec,viewWidth, viewHeight, fov, viewDistance)
{

    // var v=vec3.create();
    // var factor, x, y;
    // factor = fov / (viewDistance + vec[2]);
    // x = vec[0] * factor + viewWidth / 2;
    // y = vec[1] * factor + viewHeight / 2;
    // vec3.set(v ,x,y,0);
    // return v;
}


var pos=vec3.create();
var m=mat4.create();
var trans=vec3.create();
var pm=mat4.create();

function proj(p)
{
    
    pm=mat4.perspective(pm, fov.get()*CGL.DEG2RAD, 1, 0.0001, 100);
    
    // mat4.identity(m);
    mat4.multiply(m,cgl.vMatrix,cgl.mvMatrix);
    vec3.transformMat4(pos, [px.get(),py.get(),0], m);
    vec3.add(pos,pos,p);

 
    vec3.transformMat4(trans, pos, pm);

    var height=h.get();
    var width=w.get();
    x= trans[0] * width  ;
    y= trans[1] * height ;

    // x.set( vp[2]-( vp[2]  * 0.5 - trans[0] * vp[2] * 0.5 / trans[2] ));
    // y.set( vp[3]-( vp[3]  * 0.5 + trans[1] * vp[3] * 0.5 / trans[2] ));

    return [x,y,0];
}



inArr.onChange=function()
{
    needsUpdate=true;
};

function update()
{
    var points3d=inArr.get();
    if(!points3d)return;

    var ind=0;
    var laserArr=[];
    var point=vec3.create();

    for(var i=0;i<points3d.length/3;i++)
    {

        vec3.set(point, 
            points3d[i*3+0], 
            points3d[i*3+1], 
            points3d[i*3+2]
            );

        // cgl.pushModelMatrix();
        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
        // self.triggerPoints.trigger();
        // cgl.popModelMatrix();

        // var point=[
        //     points3d[i].x, 
        //     points3d[i].y, 
        //     points3d[i].z];
        
        var vv=proj(point);//viewWidth, viewHeight, fov, viewDistance)

        // for(var ni=0;ni<points3d.length/3;ni++)
        {

            // var x=Math.round(-1*vv[0]*coordmul.get());
            // var y=Math.round(-1*vv[1]*coordmul.get());
            var x=vv[0];
            var y=vv[1];
            if(x==null)x=0;
            if(y==null)y=0;
            
            x+=w.get()/2;
            y+=h.get()/2;
            
            // x+=coordClamp.get()/2;
            // y+=coordClamp.get()/2;

            
            // var addBlack=false;
    
            // if(addBlack)
            // {
                
            //     for(var nn=0;nn<2;nn++)
            //     {
            //         laserArr[ind++] = x;
            //         laserArr[ind++] = y;
            //     }
    
            //     addBlack=false;
            // }

            minX=Math.min(x,minX);
            maxX=Math.max(x,maxX);
            
            minY=Math.min(y,minY);
            maxY=Math.max(y,maxY);
            
            x=Math.round(x);
            y=Math.round(y);

            laserArr[ind++] = x;
            laserArr[ind++] = y;

            // if(points3d[i].hasOwnProperty('colR'))
            // {
            //     points3d[i].colR*=colorMul.get();
            //     lastR=points3d[i].colR;
            // }
            // else points3d[i].colR=lastR;
            
            // if(points3d[i].hasOwnProperty('colG'))
            // {
            //     points3d[i].colG*=colorMul.get();
            //     lastG=points3d[i].colG;
            // }
            // else points3d[i].colG=lastG;
            
            // if(points3d[i].hasOwnProperty('colB'))
            // {
            //     points3d[i].colB*=colorMul.get();
            //     lastB=points3d[i].colB;
            // }
            // else points3d[i].colB=lastB;




        }
        // if(points3d[i].hasOwnProperty('black')) addBlack=true;

        // lastX=x;
        // lastY=y;
    }
    
    outArr.set(null);
    outArr.set(laserArr);
    needsUpdate=false;
    
}
