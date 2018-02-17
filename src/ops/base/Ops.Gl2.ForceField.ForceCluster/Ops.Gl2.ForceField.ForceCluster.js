op.name="ForceCluster";

var exec=op.inFunction("Exec");
var doreset=op.inFunctionButton("reset");

var num=op.inValue("num",20);

var range=op.inValue("Range Radius",1);
var attraction=op.inValue("attraction");
var angle=op.inValue("Angle");
var show=op.inValueBool("Show");
var seed=op.inValue("Random Seed");

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var areaX=op.inValue("Area X");
var areaY=op.inValue("Area Y");
var areaZ=op.inValue("Area Z");

var next=op.outFunction("next");

var outPoints=op.outArray("Points");

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
areaX.onChange=reset;
areaY.onChange=reset;
areaZ.onChange=reset;
seed.onChange=reset;

var forces=[];

num.onChange=reset;
doreset.onTriggered=reset;

function reset()
{
    var fPoints=[];
    Math.randomSeed=seed.get();


    forces.length=Math.floor(num.get());
    for(var i=0;i<num.get();i++)
    {
        forces[i]=forces[i]||{};

        var x=posX.get()+areaX.get()*Math.seededRandom()-areaX.get()/2;
        var y=posY.get()+areaY.get()*Math.seededRandom()-areaY.get()/2;
        var z=posZ.get()+areaZ.get()*Math.seededRandom()-areaZ.get()/2;

        fPoints.push(x,y,z);

        // forces[i].pos=[0,0,0,0];
        forces[i].pos=[x,y,z];
            
        forces[i].range=range.get()*Math.seededRandom()-range.get()/2;
        forces[i].attraction=attraction.get()*Math.seededRandom()-attraction.get()/2;
        forces[i].angle=angle.get()*Math.seededRandom()-angle.get()/2;
    }

    outPoints.set(fPoints);
    // console.log(forces);
}


var mark=new CGL.Marker(cgl);
op.onDelete=function(){};


exec.onTriggered=function()
{
    // if(show.get())
    // {
    //     cgl.pushModelMatrix();

    //     if(!mesh)mesh=new CGL.WirePoint(cgl);
    //     mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[posX.get(),posY.get(),posZ.get()]);
    //     mesh.render(cgl,range.get()*2);
    //     cgl.popModelMatrix();
    // }
    if(show.get())
    {
        
        for(var i=0;i<num.get();i++)
        {
            // vec3.transformMat4(forces[i].pos, forces[i].posOrig, cgl.mvMatrix);
            // CABLES.forceFieldForces.push( forces[i] );

            cgl.pushModelMatrix();
    
            // if(!mesh)mesh=new CGL.WirePoint(cgl);
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix,forces[i].pos);
            // mesh.render(cgl,range.get()*2);
            mark.draw(cgl);
            cgl.popModelMatrix();
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
