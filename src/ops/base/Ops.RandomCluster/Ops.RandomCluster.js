// todo: move to ops.gl

Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;

this.name='random cluster';
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var num=this.addInPort(new Port(this,"num"));
var size=this.addInPort(new Port(this,"size"));
var seed=this.addInPort(new Port(this,"random seed"));

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION)) ;
var idx=this.addOutPort(new Port(this,"index")) ;
var rnd=this.addOutPort(new Port(this,"rnd")) ;
var randoms=[];
var randomsRot=[];
var randomsFloats=[];

var scaleX=this.addInPort(new Port(this,"scaleX",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleY=this.addInPort(new Port(this,"scaleY",OP_PORT_TYPE_VALUE,{ display:'range' }));
var scaleZ=this.addInPort(new Port(this,"scaleZ",OP_PORT_TYPE_VALUE,{ display:'range' }));
scaleX.set(1);
scaleY.set(1);
scaleZ.set(1);

var transVec=vec3.create();
var mat=mat4.create();

function doRender()
{
    for(var i=0;i<randoms.length;i++)
    {
        cgl.pushMvMatrix();

        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, randoms[i]);

        mat4.rotateX(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][0]);
        mat4.rotateY(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][1]);
        mat4.rotateZ(cgl.mvMatrix,cgl.mvMatrix, randomsRot[i][2]);
        // mat4.fromRotationTranslation(mat, randomsRot[i], randoms[i]);
        // mat4.multiply(cgl.mvMatrix, cgl.mvMatrix, mat);

        idx.set(i);
        rnd.set(randomsFloats[i]);

        trigger.trigger();

        cgl.popMvMatrix();
    }
}

exe.onTriggered=doRender;

function reset()
{
    randoms.length=0;
    randomsRot.length=0;
    randomsFloats.length=0;

    Math.randomSeed=seed.get();

    for(var i=0;i<num.get();i++)
    {
        randomsFloats.push(Math.seededRandom());
        randoms.push(vec3.fromValues(
            scaleX.get()*(Math.seededRandom()-0.5)*size.get(),
            scaleY.get()*(Math.seededRandom()-0.5)*size.get(),
            scaleZ.get()*(Math.seededRandom()-0.5)*size.get()
            ));

        // var q=quat.create();            
        // quat.rotateX(q, q, Math.seededRandom()*360*CGL.DEG2RAD);
        // quat.rotateY(q, q, Math.seededRandom()*360*CGL.DEG2RAD);
        // quat.rotateZ(q, q, Math.seededRandom()*360*CGL.DEG2RAD);
    
        // randomsRot.push(q);
        randomsRot.push(vec3.fromValues(
            Math.seededRandom()*360*CGL.DEG2RAD,
            Math.seededRandom()*360*CGL.DEG2RAD,
            Math.seededRandom()*360*CGL.DEG2RAD
            ));
    }
}

size.set(40);
seed.set(1);
seed.onValueChange(reset);
num.onValueChange(reset);
size.onValueChange(reset);
scaleX.onValueChange(reset);
scaleZ.onValueChange(reset);
scaleY.onValueChange(reset);

num.set(100);