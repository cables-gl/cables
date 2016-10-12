var cgl=op.patch.cgl;

var shader=null;

op.name='Twist';
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var amount=op.addInPort(new Port(op,"amount",OP_PORT_TYPE_VALUE));

var axisX=op.addInPort(new Port(op,"X",OP_PORT_TYPE_VALUE));
var axisY=op.addInPort(new Port(op,"Y",OP_PORT_TYPE_VALUE));
var axisZ=op.addInPort(new Port(op,"Z",OP_PORT_TYPE_VALUE));

var centerX=op.addInPort(new Port(op,"Center X",OP_PORT_TYPE_VALUE));
var centerY=op.addInPort(new Port(op,"Center Y",OP_PORT_TYPE_VALUE));
var centerZ=op.addInPort(new Port(op,"Center Z",OP_PORT_TYPE_VALUE));


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
    .endl()+'   float an=( (pos.y) * (pos.x));'

    

    .endl()+'   pos=pos*rotationMatrix(vec3({{mod}}_axis_x,{{mod}}_axis_y,{{mod}}_axis_z),an * {{mod}}_amount/100.0 );'

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

        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_amount',amount);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_x',axisX);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_y',axisY);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_axis_z',axisZ);

        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_x',centerX);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_y',centerY);
        uniAmount=new CGL.Uniform(shader,'f',module.prefix+'_center_z',centerZ);
    }

    trigger.trigger();
};
