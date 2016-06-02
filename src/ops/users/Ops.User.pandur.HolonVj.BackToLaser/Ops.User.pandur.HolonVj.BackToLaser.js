op.name="BackToLaser";

var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION ));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var index=this.addInPort(new Port(this,"Index",OP_PORT_TYPE_VALUE ));
index.set(-1);
var outGeom=this.addOutPort(new Port(this,"geom",OP_PORT_TYPE_OBJECT));
var outGeom2=this.addOutPort(new Port(this,"geom2",OP_PORT_TYPE_OBJECT));

var meshes=[];
var lines=
    [
        [260.928,335.896,327.428,323.896,325.428,419.896,260.428,431.396,260.928,335.896],
        [250.572,364.783,250.572,345.283,320.572,332.783,334.572,342.283,332.572,417.783,328.072,418.783,250.572,364.783],
        [249.572,385.283,257.572,374.283,322.572,419.283,262.572,430.283,249.072,421.283,249.572,385.283],
        [256.434,357.723,255.934,393.223,263.434,401.723,254.934,415.223,253.934,432.223,325.434,419.723,337.934,405.723,339.434,373.223,290.934,339.722,269.934,343.222,256.434,357.723],
        [296.434,338.722,340.434,331.222,339.934,350.223,331.434,361.723,296.434,338.722],
        [268.253,343.589,324.254,333.089,337.254,342.089,336.754,378.089,289.753,426.089,264.753,430.089,252.753,421.089,254.253,358.089,268.253,343.589],
        [329.254,392.089,336.754,399.589,335.754,417.589,296.753,424.589,329.254,392.089],
        [256.891,356.752,269.391,342.752,281.391,340.752,330.891,374.752,329.891,418.252,255.391,431.752,256.891,356.752],
        [287.891,339.252,333.891,371.252,339.891,363.252,340.391,330.252,287.891,339.252],
    ];


function avg(which)
{
    var avgX=0,avgY=0;
    
    for(var j=0;j<lines[which].length;j+=2)
    {
        avgX+=lines[which][j];
        avgY+=lines[which][j+1];
    }
    avgX/=lines[which].length;
    avgY/=lines[which].length;
    return [avgX,avgY];
}

function create()
{
    meshes.length=0;
    outGeom.set(null);
    outGeom2.set(null);

    for(var i=0;i<lines.length;i++)
    {
        var indices=[];
        var vertices=[];
        var count=0;
        
        var avgXY=[];
        if(i===0) avgXY=avg(0);
        if(i==1 || i==2)
        {
            var avg1=avg(1);
            var avg2=avg(2);
            avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];
        }
        if(i==3 || i==4)
        {
            var avg1=avg(3);
            var avg2=avg(4);
            avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];
        }
        if(i==5 || i==6)
        {
            var avg1=avg(5);
            var avg2=avg(6);
            avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];
        }
        if(i==7 || i==8)
        {
            var avg1=avg(7);
            var avg2=avg(8);
            avgXY=[ (avg1[0]+avg2[0])/2, (avg1[1]+avg2[1])/2 ];
        }
        
        
        for(var j=0;j<lines[i].length;j+=2)
        {
            vertices.push( (lines[i][j]-avgXY[0]*2)*0.1 );
            vertices.push( (lines[i][j+1]-avgXY[1]*2)*-0.1 );
            vertices.push( 0 );
            indices.push(count);
            count++;
        }

        var geom=new CGL.Geometry();
        geom.vertices=vertices;
        geom.verticesIndices=indices;
        var mesh=new CGL.Mesh(op.patch.cgl,geom);
        meshes.push(mesh);

        if(index.get()===0 && i===0)
        {
            outGeom.set(geom);
        }
        if(index.get()==1 && i==1)
        {
            outGeom.set(geom);
        }
        if(index.get()==1 && i==2)
        {
            outGeom2.set(geom);
        }
        if(index.get()==2 && i==3)
        {
            outGeom.set(geom);
        }
        if(index.get()==2 && i==4)
        {
            outGeom2.set(geom);
        }
        if(index.get()==3 && i==5)
        {
            outGeom.set(geom);
        }
        if(index.get()==3 && i==6)
        {
            outGeom2.set(geom);
        }
        if(index.get()==4 && i==7)
        {
            outGeom.set(geom);
        }
        if(index.get()==4 && i==8)
        {
            outGeom2.set(geom);
        }

        // outGeom.set(geom);
    }
}

index.onValueChanged=create;

render.onTriggered=function()
{
    if(index.get()===0)
    {
        meshes[0].render(op.patch.cgl.getShader());
    }
    if(index.get()==1)
    {
        meshes[1].render(op.patch.cgl.getShader());
        meshes[2].render(op.patch.cgl.getShader());
    }
    if(index.get()==2)
    {
        meshes[3].render(op.patch.cgl.getShader());
        meshes[4].render(op.patch.cgl.getShader());
    }
    if(index.get()==3)
    {
        meshes[5].render(op.patch.cgl.getShader());
        meshes[6].render(op.patch.cgl.getShader());
    }
    if(index.get()==4)
    {
        meshes[7].render(op.patch.cgl.getShader());
        meshes[8].render(op.patch.cgl.getShader());
    }
    // for(var i in meshes) meshes[i].render(op.patch.cgl.getShader());
    trigger.trigger();
};