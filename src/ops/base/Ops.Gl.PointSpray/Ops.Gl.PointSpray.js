op.name="PointSpray";

var render=op.inFunction("render");
var timeIn=op.inValue("time");
var sizeY=op.inValue("Size Y");
var sinY=op.inValue("Sin Y");
var sizeZ=op.inValue("Size Z");
var sinZ=op.inValue("Sin Z");
var lifeTime=op.inValue("Lifetime",2);
var speed=op.inValue("Speed",1);
var numPoints=op.inValue("Num Points",1000);
var simTexPosOut=op.outObject("SimPosTex");

var cgl=op.patch.cgl;
var simTexPos=new CGL.Texture(cgl,{isFloatingPointTexture:true});
simTexPos.setSize(1024,1024);
simTexPosOut.set(simTexPos);


// position

var srcHeadVert=''
    .endl()+'attribute float attrVertIndex;'

    .endl()+'uniform sampler2D {{mod}}_texturePos;'
    .endl();

var srcBodyVert=''
    .endl()+'pos.rgb=texture2D( {{mod}}_texturePos, vec2(pos.r,pos.g)).rgb;'
    .endl()+'psMul*=pos.a;'
    
    // .endl()+'pos.g+=random(texCoord);'
    .endl();


// simulation...

var simSrc=''
    .endl()+'precision highp float;'
    .endl()+'uniform sampler2D texPosition;'
    .endl()+'uniform float time;'
    .endl()+'uniform float sizeZ;'
    .endl()+'uniform float sinZ;'
    .endl()+'uniform float sizeY;'
    .endl()+'uniform float sinY;'
    .endl()+'uniform float lifeTime;'
    .endl()+'uniform float speed;'
    
    .endl()+'uniform sampler2D simTexPos;'

    .endl()+'varying vec2 texCoord;'

    .endl()+'float random(vec2 co)'
    .endl()+'{'
    .endl()+'   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);'
    .endl()+'}'

    .endl()+'void main()'
    .endl()+'{'
    .endl()+'   vec4 old = texture2D( simTexPos, texCoord );'
    .endl()+'   float rand=random(gl_FragCoord.xy)*3.0;'
    
    .endl()+' float pLifeTime=(random(texCoord*1.12320)*lifeTime);'
    .endl()+' float rndOffset=(4.0 * random(texCoord));'
    

    .endl()+'   float x=-1.0*mod(time*speed + rndOffset , pLifeTime);'
    .endl()+'   float y=random(texCoord*3.32123)*sizeY-sizeY/2.0+sinY*random(texCoord*2.223)*sizeY*sin(time+16.0*random(texCoord*1.12123));'
    .endl()+'   float z=random(texCoord*1.111)*sizeZ-sizeZ/2.0+sinZ*random(texCoord*1.453)*sizeZ*sin(time+16.0*random(texCoord*1.4523));'

    .endl()+'   gl_FragColor = vec4(x,y,z,x/lifeTime*0.7);'
    .endl()+'}';

var simShader=new CGL.Shader(cgl);
simShader.setSource(simShader.getDefaultVertexShader(),simSrc);
new CGL.Uniform(simShader,'t','simTexPos',3);
new CGL.Uniform(simShader,'f','sizeZ',sizeZ);
new CGL.Uniform(simShader,'f','sizeY',sizeY);
new CGL.Uniform(simShader,'f','sinY',sinY);
new CGL.Uniform(simShader,'f','sinZ',sinZ);

new CGL.Uniform(simShader,'f','lifeTime',lifeTime);
new CGL.Uniform(simShader,'f','speed',speed);


var uniTime=new CGL.Uniform(simShader,'f','time',0);

var effect=new CGL.TextureEffect(cgl,{fp:true});
effect.setSourceTexture(simTexPos);

numPoints.onChange=setPoints;
var mesh=null;
var geom=new CGL.Geometry();

var posShader=null;

setPoints();

function setPoints()
{
    geom.vertices.length=Math.round(numPoints.get())*3;
    geom.texCoords.length=Math.round(numPoints.get())*2;

    var sq=Math.round( Math.sqrt(numPoints.get()) );
    if(sq>1024)sq=1024;

    for(var i=0;i<sq;i++)
    {
        for(var j=0;j<sq;j++)
        {
            var index=i*1024+j;
            geom.vertices[index*3+0]=i/1024;
            geom.vertices[index*3+1]=j/1024;
            geom.vertices[index*3+2]=0;
            
            geom.texCoords[index*2]=0;
            geom.texCoords[index*2+1]=0;
            
        }
    }

    geom.setPointVertices(geom.vertices);
    geom.texCoords=geom.texCoords;

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.POINTS);
    mesh.addVertexNumbers=true;
    mesh.setGeom(geom);
}

var posModule=null;


function removeModule()
{
    if(posShader && posModule)
    {
        posShader.removeModule(posModule);
        posShader=null;
    }
}

render.onLinkChanged=removeModule;

render.onTriggered=function()
{

    // set position shader...
    
    if(cgl.getShader()!=posShader)
    {
        if(posShader) removeModule();
        
        posShader=cgl.getShader();

        posModule=posShader.addModule(
            {
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:srcHeadVert,
                srcBodyVert:srcBodyVert
            });

        uniTexture=new CGL.Uniform(posShader,'t',posModule.prefix+'_texturePos',4);
    }



    // do simulation 
    var t=effect.getCurrentSourceTexture().tex;
    cgl.setShader(simShader);
    effect.bind();

    cgl.setTexture(3,t);

    effect.finish();
    cgl.setPreviousShader();

    uniTime.setValue(timeIn.get());
    
    
    if(simTexPos)
    {
        // cgl.setTexture(0,t);
        cgl.gl.activeTexture(cgl.gl.TEXTURE4);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, simTexPos.tex);
    }

    // render points...
    if(mesh) mesh.render(cgl.getShader());

};

