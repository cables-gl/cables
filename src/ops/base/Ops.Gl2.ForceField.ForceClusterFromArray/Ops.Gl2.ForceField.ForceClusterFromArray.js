op.name="ForceClusterFromArray";

var exec=op.inTrigger("Exec");
var doreset=op.inTriggerButton("reset");

// var num=op.inValue("num",20);
var inPoints=op.inArray("Positions");

var range=op.inValue("Range Radius",1);
var attraction=op.inValue("attraction");
var angle=op.inValue("Angle");
var show=op.inValueBool("Show");


var next=op.outTrigger("next");

var outNumPoints=op.outValue("Num Points");

var forceObj={};

var mesh=null;
var pos=[0,0,0];
var cgl=op.patch.cgl;

range.onChange=reset;
attraction.onChange=reset;
angle.onChange=reset;

var forces=[];

// num.onChange=reset;
doreset.onTriggered=reset;

inPoints.onChange=reset;


function reset()
{
    var points=inPoints.get();
    if(!points)return;

    if(forces.length != points.length/3) 
        forces.length=points.length/3;

    // forces.length=Math.floor(num.get());
    for(var i=0;i<points.length/3;i++)
    {
        forces[i]=forces[i]||{};

        forces[i].pos=forces[i].pos||[0,0,0];
        forces[i].pos[0]=points[i*3+0];
        forces[i].pos[1]=points[i*3+1];
        forces[i].pos[2]=points[i*3+2];

        forces[i].range=range.get()*0.8;
        forces[i].attraction=attraction.get()*4;
        forces[i].angle=angle.get();

        // forces[(i*2+1)]=forces[i*2+1]||{};
        // forces[(i*2+1)].pos=[
        //     points[(i)*3+0],
        //     points[(i)*3+1],
        //     points[(i)*3+2],
        //     ];
            
        // forces[(i*2+1)].range=range.get();
        // forces[(i*2+1)].attraction=-attraction.get();
        // forces[(i*2+1)].angle=angle.get();
    }
}


var mark=new CGL.Marker(cgl);
op.onDelete=function(){};


exec.onTriggered=function()
{
    if(!inPoints.get())
    {
        next.trigger();
        return;
    }

    var num=inPoints.get().length/3*2;

    if(show.get())
    {
        
        for(var i=0;i<num;i++)
        {
            if(forces[i])
            {
                cgl.pushModelMatrix();
        
                // if(!mesh)mesh=new CGL.WirePoint(cgl);
                mat4.translate(cgl.mvMatrix,cgl.mvMatrix,forces[i].pos);
                // mesh.render(cgl,range.get()*2);
                mark.draw(cgl);
                cgl.popModelMatrix();
                
            }
        }
    }

    outNumPoints.set( inPoints.get().length/3 );


    // updateForceObject();

    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    // CABLES.forceFieldForces.push(forceObj);

    for(var i=0;i<num;i++)
    {
        // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mvMatrix);
        if(forces[i])
            CABLES.forceFieldForces.push( forces[i] );
    }
    // console.log(forces[0].pos);
    // console.log(CABLES.forceFieldForces.length);

    next.trigger();

    for(var i=0;i<num;i++) 
        if(forces[i])
            CABLES.forceFieldForces.pop();


};

reset();
