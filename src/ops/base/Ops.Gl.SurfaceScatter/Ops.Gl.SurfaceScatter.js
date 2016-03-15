Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='SurfaceScatter';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var geometry=this.addInPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;

var num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
num.set(20);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.index=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));

var seed=this.addInPort(new Port(this,"random seed",OP_PORT_TYPE_VALUE));


var objects=[];


var vec=vec3.create();

function initRandom()
{
    objects.length=0;

    if(!geometry.get())
    {
        self.uiAttr({'error':'no geometry'});
        return;
    }
    else
    {
        self.uiAttr({'error':null});
    }
    
    Math.randomSeed=seed.get();

    for(var i=0;i<num.get();i++)
    {
        var obj={};
        var geom=geometry.get();
        var faceIndex=Math.floor(geom.verticesIndices.length/3*Math.seededRandom())*3;
        
        obj.pos=vec3.create();
        obj.norm=vec3.create();
        
        vec3.set(obj.pos,
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+0],
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+1],
            geom.vertices[geom.verticesIndices[faceIndex+0]*3+2]
            );

        vec3.set(obj.norm,
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+0],
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+1],
            geom.vertexNormals[geom.verticesIndices[faceIndex+0]*3+2]
            );

        obj.q=quat.create();

        var vm2=vec3.create();
        vec3.set(vm2,0,0,1);
        quat.rotationTo(obj.q,vm2,obj.norm);

        obj.qMat=mat4.create();
        mat4.fromQuat(obj.qMat, obj.q);

        objects.push(obj);
        // console.log('.',obj.pos);

    }
}

geometry.onValueChanged=initRandom;
num.onValueChanged=initRandom;
seed.onValueChanged=initRandom;

this.render.onTriggered=function()
{
    if(geometry.get())
    {
        
        // console.log(objects.length);
        
        
        for(var j=0;j<objects.length;j++)
        {
            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, objects[j].pos);

            mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, objects[j].qMat);

            self.index.set(j);
            trigger.trigger();
            cgl.popMvMatrix();

            // self.trigger.trigger();
        }
    }
};

