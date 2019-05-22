
var render=op.inTrigger("render");
var resetButton=op.inTriggerButton("Reset");
var inSizeX=op.inValue("Size Area X",3);
var inSizeY=op.inValue("Size Area Y",3);
var inSizeZ=op.inValue("Size Area Z",3);
var numPoints=op.inValue("Particles",300);
var speed=op.inValue("Speed",0.2);
var lifetime=op.inValue("Lifetime",5);
var fadeInOut=op.inValueSlider("Fade Birth Death",0.2);
var show=op.inValueBool("Show");
var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var cgl=op.patch.cgl;
var shaderModule=null;
var bufferB=null;
var verts=null;
var geom=null;
var mesh=null;
var shader=null;

numPoints.onChange=reset;
inSizeX.onChange=reset;
inSizeY.onChange=reset;
inSizeZ.onChange=reset;
resetButton.onTriggered=reset;

var id=CABLES.generateUUID();

var lastTime=0;
var mark=new CGL.Marker(cgl);
var needsRebuild=false;

function reset()
{
    needsRebuild=true;
}

function doReset()
{
    mesh=null;
    needsRebuild=false;
    var i=0;
    var num=Math.floor(numPoints.get())*3;
    if(!verts || verts.length!=num) verts=new Float32Array(num);
    if(!bufferB || bufferB.length!=num)bufferB=new Float32Array(num);


    var sizeX=inSizeX.get();
    var sizeY=inSizeY.get();
    var sizeZ=inSizeZ.get();
    for(i=0;i<verts.length;i+=3)
    {
        verts[i+0]=(Math.random()-0.5)*sizeX+posX.get();
        verts[i+1]=(Math.random()-0.5)*sizeY+posY.get();
        verts[i+2]=(Math.random()-0.5)*sizeZ+posZ.get();
        // verts[i+2]=0.0;

        bufferB[i+0]=(Math.random()-0.5)*sizeX+posX.get();
        bufferB[i+1]=(Math.random()-0.5)*sizeY+posY.get();
        bufferB[i+2]=(Math.random()-0.5)*sizeZ+posZ.get();
        // bufferB[i+2]=0.0;
    }

    if(!geom)geom=new CGL.Geometry();
    geom.setPointVertices(verts);
    
    for(i=0;i<geom.texCoords.length;i+=2)
    {
        geom.texCoords[i]=Math.random();
        geom.texCoords[i+1]=Math.random();
    }

    if(!mesh) 
    {
        mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    
        mesh.addVertexNumbers=true;
        mesh._verticesNumbers=null;


        op.log("NEW MESH");
    }
    else
    {
        mesh.unBind();
    }
    mesh.addVertexNumbers=true;
    mesh.setGeom(geom);

    // mesh.updateVertices(geom);
    
    // op.log("set geom",mesh._attributes.length);
    // op.log("set geom",mesh._attributes.length);


    // buffB = cgl.gl.createBuffer();
    // cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffB);
    // cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, bufferB, cgl.gl.DYNAMIC_COPY);
    // buffB.itemSize = 3;
    // buffB.numItems = bufferB.length/3;

    mesh.setAttribute("rndpos",bufferB,3);
    

    op.log("Reset particles",num,numPoints.get());
    
    mesh.removeFeedbacks();



    var life=new Float32Array(num);
    for(i=0;i<num;i+=3) 
    {
        life[i]=op.patch.freeTimer.get()-Math.random()*lifetime.get();
        life[i+1]=op.patch.freeTimer.get();
        life[i+2]=op.patch.freeTimer.get();
    }
    
    // console.log(op.patch.freeTimer.get(),life[0],bufferB[0]);

    // mesh.setAttribute("life",life,3);
    // mesh.setAttributeFeedback("life","outLife",life),



    
    
    mesh.setFeedback(
        mesh.setAttribute("inPos",bufferB,3),
        "outPos",bufferB );


    mesh.setFeedback(
        mesh.setAttribute("life",life,3),
        "outLife",life );


        // feebackOutpos.buffer=buffB;

    
    
    // var timeOffsetArr=new Float32Array(num/3);
    // for(i=0;i<num;i++)timeOffsetArr[i]=Math.random();
    
    // mesh.setAttribute("timeOffset",timeOffsetArr,1);

    // if(feebackOutpos)feebackOutpos.buffer=buffB;
}

reset();

var numForces=0;
var forceUniforms=[];
var firstTime=true;


function removeModule()
{
    if(shader && shaderModule)
    {
        shader.removeModule(shaderModule);
        shader=null;
    }
}
render.onLinkChanged=removeModule;


var particleSpawnStart=0;
var uniTime=null;
var uniSize=null;
var uniTimeDiff=null;
var uniPos=null;
var uniLifetime=null;
var uniFadeInOut=null;
var uniSpawnFrom=null;
var uniSpawnTo=null;

render.onTriggered=function()
{
    if(needsRebuild)doReset();
    var time=op.patch.freeTimer.get();
    var timeDiff=time-lastTime;

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        shader.glslVersion=300;
        shaderModule=shader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.flowfield_head_vert,
                srcBodyVert:attachments.flowfield_vert
            });

        uniTime=new CGL.Uniform(shader,'f',shaderModule.prefix+'time',0);
        uniPos=new CGL.Uniform(shader,'3f',shaderModule.prefix+'emitterPos',0);
        uniSizeX=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeX',inSizeX.get());
        uniSizeY=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeY',inSizeY.get());
        uniSizeZ=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeZ',inSizeZ.get());
        uniTimeDiff=new CGL.Uniform(shader,'f',shaderModule.prefix+'timeDiff',0);
        uniLifetime=new CGL.Uniform(shader,'f',shaderModule.prefix+'lifeTime',lifetime);
        uniFadeInOut=new CGL.Uniform(shader,'f',shaderModule.prefix+'fadeinout',fadeInOut);
        
        
        
        uniSpawnFrom=new CGL.Uniform(shader,'f',shaderModule.prefix+'spawnFrom',0);
        uniSpawnTo=new CGL.Uniform(shader,'f',shaderModule.prefix+'spawnTo',0);
    }
    
    if(!shader)return;

    for(var i=0;i<CABLES.forceFieldForces.length;i++)
    {
        var force=CABLES.forceFieldForces[i];
        if(force)
        if(!force.hasOwnProperty(id+"uniRange"))
        {
            force[id+'uniRange']=new CGL.Uniform(shader,'f','forces['+i+'].range',force.range);
            force[id+'uniAttraction']=new CGL.Uniform(shader,'f','forces['+i+'].attraction',force.attraction);
            force[id+'uniAngle']=new CGL.Uniform(shader,'f','forces['+i+'].angle',force.angle);
            force[id+'uniPos']=new CGL.Uniform(shader,'3f','forces['+i+'].pos',force.pos);
            force[id+'uniTime']=new CGL.Uniform(shader,'f','forces['+i+'].time',time);
        }
        else
        {
            force[id+'uniRange'].setValue(force.range);
            force[id+'uniAttraction'].setValue(force.attraction);
            force[id+'uniAngle'].setValue(force.angle);
            force[id+'uniPos'].setValue(force.pos);
            force[id+'uniTime'].setValue(time);
        }
    }

    uniSizeX.setValue(inSizeX.get());
    uniSizeY.setValue(inSizeY.get());
    uniSizeZ.setValue(inSizeZ.get());
    uniTimeDiff.setValue(timeDiff*(speed.get()));
    uniTime.setValue(time);
    
    
    uniPos.setValue([posX.get(),posY.get(),posZ.get()]);
    
    if(mesh) mesh.render(shader);

    // console.log( '1',mesh._bufVertexAttrib );
    // console.log( '1',feebackOutpos.buffer );

    // var t=mesh._bufVertexAttrib.buffer;
    // mesh._bufVertexAttrib.buffer=feebackOutpos.buffer;
    // feebackOutpos.buffer=t;
    lastTime=op.patch.freeTimer.get();
    
    
    if(show.get())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[posX.get(),posY.get(),posZ.get()]);
        mark.draw(cgl);
        cgl.popModelMatrix();
    }

    if(particleSpawnStart>numPoints.get())particleSpawnStart=0;

    var perSecond=numPoints.get()/lifetime.get();
    var numSpawn=perSecond*Math.min(1/33,timeDiff);
    uniSpawnFrom.setValue(particleSpawnStart);
    uniSpawnTo.setValue(particleSpawnStart+numSpawn);
    
    // op.log(particleSpawnStart,particleSpawnStart+numSpawn);
    // if(numSpawn>30)
    // console.log("should spawn",numSpawn);
    particleSpawnStart+=numSpawn;

    
    


};
