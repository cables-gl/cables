var self=this;
var cgl=self.patch.cgl;

this.name='PickingMaterial';
this.render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
this.trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

this.isPicked=this.addOutPort(new Port(this,"is picked",OP_PORT_TYPE_VALUE));

var pickedTrigger=op.outFunction("On Picked");

this.doBillboard=this.addInPort(new Port(this,"billboard",OP_PORT_TYPE_VALUE,{ display:'bool' }));
this.doBillboard.set(false);
this.doBillboard.onValueChanged=function()
{
    if(self.doBillboard.get())
        shader.define('BILLBOARD');
    else
        shader.removeDefine('BILLBOARD');
};

var cursor=this.addInPort(new Port(this,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["","pointer","auto","default","crosshair","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help"]} ));
cursor.set('pointer');



this.doRender=function()
{
    cgl.frameStore.pickingpassNum+=2;
    var currentPickingColor=cgl.frameStore.pickingpassNum;

    if(cgl.frameStore.pickingpass)
    {
        self.isPicked.set(false);

        pickColorUniformR.setValue(currentPickingColor/255);
        cgl.setShader(shader);
        self.trigger.trigger();
        cgl.setPreviousShader();
    }
    else
    {
        self.isPicked.set( cgl.frameStore.pickedColor==currentPickingColor );
        
        if(cgl.frameStore.pickedColor==currentPickingColor)
        {
            if(cursor.get().length>0 && cgl.canvas.style.cursor!=cursor.get())
            {
                cgl.canvas.style.cursor=cursor.get();
            }
            pickedTrigger.trigger();
        }
        else
        {
        }

        self.trigger.trigger();
    }

};

var srcVert=''
    .endl()+'attribute vec3 vPosition;'
    .endl()+'uniform mat4 projMatrix;'
    .endl()+'uniform mat4 mvMatrix;'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   #ifdef BILLBOARD'
    .endl()+'       vec3 position=vPosition;'
    .endl()+"       gl_Position = projMatrix * mvMatrix * vec4(( "
    .endl()+"           position.x * vec3("
    .endl()+"               mvMatrix[0][0],"
    .endl()+"               mvMatrix[1][0], "
    .endl()+"               mvMatrix[2][0] ) +"
    .endl()+"           position.y * vec3("
    .endl()+"               mvMatrix[0][1],"
    .endl()+"               mvMatrix[1][1], "
    .endl()+"               mvMatrix[2][1]) ), 1.0);"
    .endl()+"   #endif "

    .endl()+"   #ifndef BILLBOARD"
    .endl()+"       gl_Position = projMatrix * mvMatrix * vec4(vPosition,  1.0);"
    .endl()+"   #endif "
    
    .endl()+"}";

var srcFrag=''
    .endl()+'precision highp float;'
    .endl()+'uniform float r;'
    .endl()+''
    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   gl_FragColor = vec4(r,1.0,0.0,1.0);'
    .endl()+'}';

var shader=new CGL.Shader(cgl,"PickingMaterial");
shader.offScreenPass=true;
shader.setSource(srcVert,srcFrag);

this.onLoaded=shader.compile;

var pickColorUniformR=new CGL.Uniform(shader,'f','r',0);

this.render.onTriggered=this.doRender;
this.doRender();
