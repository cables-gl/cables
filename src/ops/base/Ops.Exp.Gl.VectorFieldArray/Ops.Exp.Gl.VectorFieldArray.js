var cgl=op.patch.cgl;

op.name='VectorFieldArray';
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));
var geom=op.addInPort(new Port(op,"geom",OP_PORT_TYPE_OBJECT));
geom.ignoreValueSerialize=true;

var tex=op.inTexture("Texture");


var numColumns=op.inValue("Columns",100);
var numRows=op.inValue("Rows",100);
var spacingColumns=op.inValue("Spacing Columns",1);
var spacingRows=op.inValue("Spacing Rows",1);
var doCenter=op.inValueBool("Center",true);

var transRotate=op.inValueBool("Rotate",true);
var transScale=op.inValueBool("Scale",false);

function updateTransforms()
{
    if(!shader)return;
    if(transRotate.get())shader.define("TRANS_ROTATE");
        else shader.removeDefine("TRANS_ROTATE");

    if(transScale.get())shader.define("TRANS_SCALE");
        else shader.removeDefine("TRANS_SCALE");
}

transRotate.onChange=updateTransforms;
transScale.onChange=updateTransforms;


var transformations=[];
var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var uniSpaceX=null;
var uniSpaceY=null;
var recalc=true;


numRows.onChange=reset;
numColumns.onChange=reset;
doCenter.onChange=reset;

geom.onChange=reset;
exe.onTriggered=doRender;
exe.onLinkChanged=removeModule;

var srcHeadVert=''
    .endl()+'uniform float do_instancing;'
    .endl()+'uniform sampler2D {{mod}}_field;'
    
    .endl()+'uniform float {{mod}}_spaceX;'
    .endl()+'uniform float {{mod}}_spaceY;'
    .endl()+'uniform float {{mod}}_rows;'
    .endl()+'uniform float {{mod}}_cols;'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   attribute mat4 instMat;'
    .endl()+'   varying mat4 instModelMat;'
    .endl()+'#endif'

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
    .endl()+'#ifdef INSTANCING'
    .endl()+'   if( do_instancing==1.0 )'
    .endl()+'   {'
    .endl()+'       instModelMat=instMat;'
    .endl()+'       float tx=(instModelMat[3][0])/{{mod}}_cols;'
    .endl()+'       float ty=(instModelMat[3][1])/{{mod}}_rows;'
    .endl()+'       instModelMat[3][0]*={{mod}}_spaceX;'
    .endl()+'       instModelMat[3][1]*={{mod}}_spaceY;'
    .endl()+'       vec4 instCol = texture2D( {{mod}}_field, vec2(tx,ty) );'
    
    .endl()+'       #ifdef TRANS_ROTATE'
    .endl()+'           instModelMat*=rotationMatrix(vec3(0.0,0.0,1.0),instCol.r*3.1415926535897932384626433832795*2.0);'
    .endl()+'       #endif'

    .endl()+'       #ifdef TRANS_SCALE'
    .endl()+'           pos.rgb*=instCol.r;'
    .endl()+'       #endif'
    
// .endl()+'       pos*=instCol.r;'
    .endl()+'       mvMatrix=viewMatrix * modelMatrix * instModelMat;'
    .endl()+'   }'
    .endl()+'#endif'
    .endl();


function reset()
{
    recalc=true;
}

function prepare()
{
    if(geom.get())
    {
        calc();

        var num=transformations.length;
        var arrs = [].concat.apply([], transformations);
        
        // console.log(transformations);
        var matrices = new Float32Array(arrs);
    
        mesh=new CGL.Mesh(cgl,geom.get());
        mesh.numInstances=num;
        
        mesh.addAttribute('instMat',matrices,16);
        recalc=false;


    }
}


function removeModule()
{
    if(shader && mod)
    {
        shader.removeModule(mod);
        shader=null;
    }
}


function doRender()
{
    if(recalc)prepare();
    if(mesh)
    {
        if(cgl.getShader() && cgl.getShader()!=shader)
        {
            if(shader && mod)
            {
                shader.removeModule(mod);
                shader=null;
            }
    
            shader=cgl.getShader();
            if(!shader.hasDefine('INSTANCING'))
            {
                mod=shader.addModule(
                    {
                        name: 'MODULE_VERTEX_POSITION',
                        srcHeadVert: srcHeadVert,
                        srcBodyVert: srcBodyVert
                    });
        
                shader.define('INSTANCING');    
                uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
                uniSpaceX=new CGL.Uniform(shader,'f',mod.prefix+'_spaceX',0);
                uniSpaceY=new CGL.Uniform(shader,'f',mod.prefix+'_spaceY',0);
                uniTexture=new CGL.Uniform(shader,'t',mod.prefix+'_field',5);
                uniCols=new CGL.Uniform(shader,'f',mod.prefix+'_cols',numColumns);
                uniRows=new CGL.Uniform(shader,'f',mod.prefix+'_rows',numRows);
                
                updateTransforms();
            }
            else
            {
                uniDoInstancing=shader.getUniform('do_instancing');
            }
        }

        if(uniSpaceX)
        {
            uniSpaceX.setValue(spacingColumns.get());
            uniSpaceY.setValue(spacingRows.get());
            
            uniCols.setValue(numColumns.get());
            uniRows.setValue(numRows.get());
            
        }

        if(tex.get())
        cgl.setTexture(5,tex.get().tex);


        uniDoInstancing.setValue(1);
        mesh.render(shader);
        uniDoInstancing.setValue(0);
    }
    else
    {
        prepare();    
    }
}



function calc()
{
    var m=mat4.create();
    var cols=Math.round(numColumns.get());
    var rows=Math.round(numRows.get());
    if(cols<=0)cols=1;
    if(rows<=0)rows=1;
    
    var distX=spacingColumns.get();
    var distY=spacingRows.get();
    
    var centerX=0;
    var centerY=0;
    if(doCenter.get())
    {
        centerX=cols*spacingColumns.get()/2;
        centerY=rows*spacingRows.get()/2;
    }
    
    transformations.length=cols*rows;
    

    for(var x=0;x<cols;x++)
    {
        for(var y=0;y<rows;y++)
        {
            mat4.identity(m);
            mat4.translate(m,m,[x-centerX,y-centerY, 0]);
            transformations[x+y*cols]= Array.prototype.slice.call(m);
        }        
    }
    
    op.log("reset",transformations.length,cols,rows);

}

