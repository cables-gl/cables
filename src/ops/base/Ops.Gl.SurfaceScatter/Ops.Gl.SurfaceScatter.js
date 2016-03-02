Op.apply(this, arguments);
var self=this;
var cgl=this.patch.cgl;

this.name='SurfaceScatter';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var geometry=this.addInPort(new Port(this,"geometry",OP_PORT_TYPE_OBJECT));
geometry.ignoreValueSerialize=true;

var num=this.addInPort(new Port(this,"num",OP_PORT_TYPE_VALUE));
num.set(20);

this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
this.index=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));


var objects=[];


var vec=vec3.create();

function initRandom()
{
        objects.length=0;

    if(!geometry.get())
    {
        return;
    }
    for(var i=0;i<num.get();i++)
    {
        var obj={};
        var geom=geometry.get();
        
        var faceIndex=Math.floor(geom.verticesIndices.length/3*Math.random())*3;
        
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

            

        // works for sphere...        
        // var vm2=vec3.create();
        // vec3.set(vm2,0,0,1);
        // var posNorm=vec3.create();
        // vec3.normalize(posNorm,obj.pos);
        // quat.rotationTo(obj.q,vm2,obj.pos);


        var vm2=vec3.create();
        vec3.set(vm2,0,0,1);


        // var posNorm=vec3.create();
        // vec3.normalize(posNorm,obj.pos);
        quat.rotationTo(obj.q,vm2,obj.norm);

// console.log('posNorm',posNorm);
// console.log('vm2',vm2);
console.log('norm',obj.norm);

        obj.qMat=mat4.create();
        mat4.fromQuat(obj.qMat, obj.q);
    


        objects.push(obj);

    }
}

geometry.onValueChanged=initRandom;
num.onValueChanged=initRandom;


this.render.onTriggered=function()
{
    if(geometry.get())
    {

        // for(var i=0;i<geometry.val.vertices.length;i+=3)
        for(var j=0;j<objects.length;j++)
        {
            // var i=indices[j];
            


            cgl.pushMvMatrix();
            mat4.translate(cgl.mvMatrix,cgl.mvMatrix, objects[j].pos);

mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, objects[j].qMat);

            self.trigger.trigger();
            cgl.popMvMatrix();

            self.index.set(j);
            // cgl.pushMvMatrix();
            // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
            self.trigger.trigger();
            // cgl.popMvMatrix();
        }
    }
};

