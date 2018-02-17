Op.apply(this, arguments);
var self=this;
var cgl=self.patch.cgl;
this.name='transform';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.posX=this.addInPort(new Port(this,"posX"));
this.posY=this.addInPort(new Port(this,"posY"));
this.posZ=this.addInPort(new Port(this,"posZ"));

this.scaleX=this.addInPort(new Port(this,"scaleX"));
this.scaleY=this.addInPort(new Port(this,"scaleY"));
this.scaleZ=this.addInPort(new Port(this,"scaleZ"));

this.rotX=this.addInPort(new Port(this,"rotX"));
this.rotY=this.addInPort(new Port(this,"rotY"));
this.rotZ=this.addInPort(new Port(this,"rotZ"));

var vPos=vec3.create();
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

var doScale=false;
var doTranslate=false;

var translationChanged=true;
var scaleChanged=true;
var rotChanged=true;

this.render.onTriggered=function()
{
    var updateMatrix=false;
    if(translationChanged)
    {
        updateTranslation();
        updateMatrix=true;
    }
    if(scaleChanged)
    {
        updateScale();
        updateMatrix=true;
    }
    if(rotChanged)
    {
        updateMatrix=true;
    }
    if(updateMatrix)doUpdateMatrix();


    cgl.pushModelMatrix();
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix,transMatrix);

    self.trigger.trigger();
    cgl.popModelMatrix();
};

var doUpdateMatrix=function()
{
    mat4.identity(transMatrix);
    if(doTranslate)mat4.translate(transMatrix,transMatrix, vPos);

    if(self.rotX.get()!==0)mat4.rotateX(transMatrix,transMatrix, self.rotX.get()*CGL.DEG2RAD);
    if(self.rotY.get()!==0)mat4.rotateY(transMatrix,transMatrix, self.rotY.get()*CGL.DEG2RAD);
    if(self.rotZ.get()!==0)mat4.rotateZ(transMatrix,transMatrix, self.rotZ.get()*CGL.DEG2RAD);

    if(doScale)mat4.scale(transMatrix,transMatrix, vScale);
    rotChanged=false;
};

function updateTranslation()
{
    doTranslate=false;
    if(self.posX.get()!==0.0 || self.posY.get()!==0.0 || self.posZ.get()!==0.0)doTranslate=true;
    vec3.set(vPos, self.posX.get(),self.posY.get(),self.posZ.get());
    translationChanged=false;
}

function updateScale()
{
    doScale=false;
    if(self.scaleX.get()!==0.0 || self.scaleY.get()!==0.0 || self.scaleZ.get()!==0.0)doScale=true;
    vec3.set(vScale, self.scaleX.get(),self.scaleY.get(),self.scaleZ.get());
    scaleChanged=false;
}

this.translateChanged=function()
{
    translationChanged=true;
};

this.scaleChanged=function()
{
    scaleChanged=true;
};

this.rotChanged=function()
{
    rotChanged=true;
};

this.rotX.onValueChanged=this.rotChanged;
this.rotY.onValueChanged=this.rotChanged;
this.rotZ.onValueChanged=this.rotChanged;

this.scaleX.onValueChanged=this.scaleChanged;
this.scaleY.onValueChanged=this.scaleChanged;
this.scaleZ.onValueChanged=this.scaleChanged;

this.posX.onValueChanged=this.translateChanged;
this.posY.onValueChanged=this.translateChanged;
this.posZ.onValueChanged=this.translateChanged;

this.rotX.set(0.0);
this.rotY.set(0.0);
this.rotZ.set(0.0);

this.scaleX.set(1.0);
this.scaleY.set(1.0);
this.scaleZ.set(1.0);

this.posX.set(0.0);
this.posY.set(0.0);
this.posZ.set(0.0);

doUpdateMatrix();
