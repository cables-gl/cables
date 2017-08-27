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
    .endl()+'UNI float MOD_amount;'
    .endl()+'UNI float MOD_axis_x;'
    .endl()+'UNI float MOD_axis_y;'
    .endl()+'UNI float MOD_axis_z;'
    .endl()+'UNI float MOD_center_x;'
    .endl()+'UNI float MOD_center_y;'
    .endl()+'UNI float MOD_center_z;'
    
    .endl()+'mat4 MOD_rotationMatrix(vec3 axis, float angle)'
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
    .endl()+'   pos.x-=MOD_center_x;'
    .endl()+'   pos.y-=MOD_center_y;'
    .endl()+'   pos.z-=MOD_center_z;'
    .endl()+'   float MOD_an=( (pos.y) * (pos.x));'

    .endl()+'   pos=pos*MOD_rotationMatrix(vec3(MOD_axis_x,MOD_axis_y,MOD_axis_z),MOD_an * MOD_amount/100.0 );'

    .endl()+'   pos.x+=MOD_center_x;'
    .endl()+'   pos.y+=MOD_center_y;'
    .endl()+'   pos.z+=MOD_center_z;'
    .endl();


var uniAmount=null;
var cgl=op.patch.cgl;
var shader=null;
var mod=null;

function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
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
        mod=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'amount',amount);
        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'axis_x',axisX);
        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'axis_y',axisY);
        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'axis_z',axisZ);

        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'center_x',centerX);
        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'center_y',centerY);
        uniAmount=new CGL.Uniform(shader,'f',mod.prefix+'center_z',centerZ);
    }

    trigger.trigger();
};
