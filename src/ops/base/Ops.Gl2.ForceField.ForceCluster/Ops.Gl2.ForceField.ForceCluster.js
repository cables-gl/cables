op.name="ForceCluster";

var exec=op.inFunction("Exec");
var doreset=op.inFunction("reset");

var num=op.inValue("num",20);

var range=op.inValue("Range Radius",1);
var attraction=op.inValue("attraction");
var angle=op.inValue("Angle");
var show=op.inValueBool("Show");

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var next=op.outFunction("next");

var forceObj={};

var mesh=null;
var pos=[0,0,0];
var cgl=op.patch.cgl;

range.onChange=reset;
attraction.onChange=reset;
angle.onChange=reset;
posX.onChange=reset;
posY.onChange=reset;
posZ.onChange=reset;

var forces=[];

num.onChange=reset;
doreset.onTriggered=reset;

function reset()
{
    forces.length=Math.floor(num.get());
    for(var i=0;i<num.get();i++)
    {
        forces[i]=forces[i]||{};

        // forces[i].pos=[0,0,0,0];
        forces[i].pos=[
            posX.get()*Math.random()-posX.get()/2,
            posY.get()*Math.random()-posY.get()/2,
            posZ.get()*Math.random()-posZ.get()/2,
            ];
            
        forces[i].range=range.get()*Math.random()-range.get()/2;
        forces[i].attraction=attraction.get()*Math.random()-attraction.get()/2;
        forces[i].angle=angle.get()*Math.random()-angle.get()/2;
    }
    
    // console.log(forces);
}


var mark=new CGL.Marker(cgl);
op.onDelete=function(){};


exec.onTriggered=function()
{
    // if(show.get())
    // {
    //     cgl.pushMvMatrix();

    //     if(!mesh)mesh=new CGL.WirePoint(cgl);
    //     mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[posX.get(),posY.get(),posZ.get()]);
    //     mesh.render(cgl,range.get()*2);
    //     cgl.popMvMatrix();
    // }
    if(show.get())
    {
        
        for(var i=0;i<num.get();i++)
        {
            // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mvMatrix);
            // CABLES.forceFieldForces.push( forces[i] );

            cgl.pushMvMatrix();
    
            // if(!mesh)mesh=new CGL.WirePoint(cgl);
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix,forces[i].pos);
            // mesh.render(cgl,range.get()*2);
            mark.draw(cgl);
            cgl.popMvMatrix();
        }
    }


    // updateForceObject();

    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    // CABLES.forceFieldForces.push(forceObj);

    for(var i=0;i<num.get();i++)
    {
        // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mvMatrix);
        CABLES.forceFieldForces.push( forces[i] );
    }
    // console.log(forces[0].pos);
    // console.log(CABLES.forceFieldForces.length);

    next.trigger();

    for(var i=0;i<num.get();i++) 
        CABLES.forceFieldForces.pop();


};

reset();
