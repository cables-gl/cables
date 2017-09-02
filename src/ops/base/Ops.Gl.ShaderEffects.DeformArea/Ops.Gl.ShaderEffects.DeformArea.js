op.name="DeformArea";

var cgl=op.patch.cgl;

op.render=op.addInPort(new Port(this,"render",OP_PORT_TYPE_FUNCTION));
op.trigger=op.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));

var inSize=op.inValue("Size",1);
var inStrength=op.inValueSlider("Strength",0.5);
var inSmooth=op.inValueBool("Smooth",true);

{
    // position

    var x=op.inValue("x");
    var y=op.inValue("y");
    var z=op.inValue("z");
}


var shader=null;

var srcHeadVert=attachments.deformarea_vert;

var srcBodyVert=''
    .endl()+'pos=MOD_deform(pos);'
    .endl();
    

// var srcHeadFrag=''
//     .endl()+'IN vec4 MOD_areaPos;'
//     .endl()+'UNI float MOD_size;'
//     .endl()+'UNI float MOD_amount;'
    
//     .endl()+'UNI float MOD_r;'
//     .endl()+'UNI float MOD_g;'
//     .endl()+'UNI float MOD_b;'

//     .endl()+'UNI float MOD_x;'
//     .endl()+'UNI float MOD_y;'
//     .endl()+'UNI float MOD_z;'

//     .endl();

// var srcBodyFrag=''
//     .endl()+'   float MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z),MOD_areaPos.xyz);'
//     .endl()+'   MOD_de=1.0-smoothstep(0.0,MOD_size,MOD_de);'
//     .endl()+'   col.rgb=mix(col.rgb,vec3(MOD_r,MOD_g,MOD_b), MOD_de*MOD_amount);'
//     .endl();


// var moduleFrag=null;
var moduleVert=null;

function removeModule()
{
    // if(shader && moduleFrag) shader.removeModule(moduleFrag);
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
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        // moduleFrag=shader.addModule(
        //     {
        //         title:op.objName,
        //         name:'MODULE_COLOR',
        //         srcHeadFrag:srcHeadFrag,
        //         srcBodyFrag:srcBodyFrag
        //     },moduleVert);
            
        inSize.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'size',inSize);
        inStrength.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'strength',inStrength);
        inSmooth.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'smooth',inSmooth);

        // r.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'r',r);
        // g.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'g',g);
        // b.uniform=new CGL.Uniform(shader,'f',moduleFrag.prefix+'b',b);

        x.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'x',x);
        y.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'y',y);
        z.uniform=new CGL.Uniform(shader,'f',moduleVert.prefix+'z',z);
        
    }
    
    
    if(!shader)return;

    op.trigger.trigger();
};













