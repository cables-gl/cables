op.name="Fog";

var cgl=op.patch.cgl;
var id='mod'+Math.floor(Math.random()*10000);

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inStart=op.inValue("Start",2);
var inEnd=op.inValue("End",12);

var inAmount=op.inValueSlider("Amount",0.5);


{
    // rgba colors
    
    var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
    r.set(Math.random());
    
    var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
    g.set(Math.random());
    
    var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.set(Math.random());

}


var shader=null;

var srcHeadVert=''
    .endl()+'varying vec4 fog_pos;'
    .endl();

var srcBodyVert=''
    .endl()+'fog_pos=mvMatrix*pos;'
    .endl();

var srcHeadFrag=''
    .endl()+'varying vec4 fog_pos;'
    .endl()+'uniform float {{mod}}_start;'
    .endl()+'uniform float {{mod}}_end;'
    .endl()+'uniform float {{mod}}_amount;'
    
    .endl()+'uniform float {{mod}}_r;'
    .endl()+'uniform float {{mod}}_g;'
    .endl()+'uniform float {{mod}}_b;'
    .endl();

var srcBodyFrag=''
    .endl()+'   float de=(fog_pos.z+{{mod}}_start)/(-1.0*{{mod}}_end);'
    .endl()+'   col.rgb=mix(col.rgb,vec3({{mod}}_r,{{mod}}_g,{{mod}}_b), de*{{mod}}_amount);'
    .endl();


var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    if(shader && moduleFrag) shader.removeModule(moduleFrag);
    if(shader && moduleVert) shader.removeModule(moduleVert);
    shader=null;
}



op.render.onLinkChanged=removeModule;

op.render.onTriggered=function()
{
    if(!cgl.getShader())
    {
         op.trigger.trigger();
         return;
    }

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();

        moduleVert=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        // uniOffsetX=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetX',offsetX);
        // uniOffsetY=new CGL.Uniform(shader,'f',moduleVert.prefix+'_offsetY',offsetY);


        moduleFrag=shader.addModule(
            {
                name:'MODULE_COLOR',
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag
            });
        start=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_start',inStart);
        end=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_end',inEnd);
        amount=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_amount',inAmount);
        r.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_r',r);
        g.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_g',g);
        b.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'_b',b);


    }
    
    
    if(!shader)return;
    var texSlot=moduleVert.num+5;

    op.trigger.trigger();
};













