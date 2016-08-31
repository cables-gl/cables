var cgl=op.patch.cgl;

var shader=null;

this.name='Twist';
var render=this.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var amount=this.addInPort(new Port(this,"amount",OP_PORT_TYPE_VALUE));

var axisX=this.addInPort(new Port(this,"X",OP_PORT_TYPE_VALUE));
var axisY=this.addInPort(new Port(this,"Y",OP_PORT_TYPE_VALUE));
var axisZ=this.addInPort(new Port(this,"Z",OP_PORT_TYPE_VALUE));

var centerX=this.addInPort(new Port(this,"Center X",OP_PORT_TYPE_VALUE));
var centerY=this.addInPort(new Port(this,"Center Y",OP_PORT_TYPE_VALUE));
var centerZ=this.addInPort(new Port(this,"Center Z",OP_PORT_TYPE_VALUE));


var srcHeadVert=''
    .endl()+'uniform float {{mod}}_amount;'
    .endl()+'uniform float {{mod}}_axis_x;'
    .endl()+'uniform float {{mod}}_axis_y;'
    .endl()+'uniform float {{mod}}_axis_z;'
    .endl()+'uniform float {{mod}}_center_x;'
    .endl()+'uniform float {{mod}}_center_y;'
    .endl()+'uniform float {{mod}}_center_z;'
    
    .endl()+'mat4 rotationMatrix(vec3 axis, float angle)'
    .endl()+'{'
    .endl()+'    axis = normalize(axis);'
    .endl()+'    float s = sin(angle);'
    .endl()+'    float c = cos(angle);'
    .endl()+'    float oc = 1.0 - c;'
        
    .endl()+'    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,'
    .endl()+'                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,'
    .endl()+'                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,'
    .endl()+'                0.0,                                0.0,                                0.0,                                1.0);'
    .endl()+'}';

    var srcBodyVert=''
    
    .endl()+'   pos.x-={{mod}}_center_x;'
    .endl()+'   pos.y-={{mod}}_center_y;'
    .endl()+'   pos.z-={{mod}}_center_z;'
    // .endl()+'   float an=( (pos.z-{{mod}}_center_z) * (pos.x - {{mod}}_center_x));'
    .endl()+'   float an=( (pos.y) * (pos.x));'

    

    .endl()+'   pos=pos*rotationMatrix(vec3({{mod}}_axis_x,{{mod}}_axis_y,{{mod}}_axis_z),an * {{mod}}_amount/100.0 );'
    // .endl()+'   pos.x+={{mod}}_center_x;'
    // .endl()+'   pos.y+={{mod}}_center_y;'
    // .endl()+'   pos.z+={{mod}}_center_z;'

    .endl()+'   pos.x+={{mod}}_center_x;'
    .endl()+'   pos.y+={{mod}}_center_y;'
    .endl()+'   pos.z+={{mod}}_center_z;'

    .endl();



var uniAmount=null;

function removeModule()
{
    if(shader && module)
    {
        shader.removeModule(module);
        shader=null;
    }
}

render.onLinkChanged=removeModule;
render.onTriggered=function()
{
    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        module=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        // uniTime=new CGL.Uniform(shader,'f',module.prefix+'_time',0);
        // uniFrequency=new CGL.Uniform(shader,'f',module.prefix+'_frequency',self.frequency.val);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_amount',amount);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_x',axisX);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_y',axisY);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_z',axisZ);

        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_x',centerX);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_y',centerY);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_z',centerZ);
        
        // uniPhase=new CGL.Uniform(shader,'f',module.prefix+'_phase',self.phase.val);
        // setDefines();
    }

    // uniTime.setValue(Date.now()/1000.0-startTime);
    trigger.trigger();
};

// amount.onValueChange(function(){
//     if(uniAmount) uniAmount.setValue(amount.get());
// });