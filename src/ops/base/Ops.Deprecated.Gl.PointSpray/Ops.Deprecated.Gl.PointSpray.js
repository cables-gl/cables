op.name = "PointSpray";

let render = op.inTrigger("render");
let timeIn = op.inValue("time");
let sizeY = op.inValue("Size Y");
let sinY = op.inValue("Sin Y");
let sizeZ = op.inValue("Size Z");
let sinZ = op.inValue("Sin Z");
let lifeTime = op.inValue("Lifetime", 2);
let speed = op.inValue("Speed", 1);
let numPoints = op.inValue("Num Points", 1000);
let simTexPosOut = op.outObject("SimPosTex");

let cgl = op.patch.cgl;
let simTexPos = new CGL.Texture(cgl, { "isFloatingPointTexture": true });
simTexPos.setSize(1024, 1024);
simTexPosOut.set(simTexPos);

let uniTexture = null;
// position

let srcHeadVert = ""
    .endl() + "IN float attrVertIndex;"

    .endl() + "UNI sampler2D {{mod}}_texturePos;"
    .endl();

let srcBodyVert = ""
    .endl() + "pos.rgb=texture2D( {{mod}}_texturePos, vec2(pos.r,pos.g)).rgb;"
// .endl()+'psMul*=pos.a;'

    // .endl()+'pos.g+=random(texCoord);'
    .endl();


// simulation...

let simSrc = ""
    .endl() + "precision highp float;"
    .endl() + "UNI sampler2D texPosition;"
    .endl() + "UNI float time;"
    .endl() + "UNI float sizeZ;"
    .endl() + "UNI float sinZ;"
    .endl() + "UNI float sizeY;"
    .endl() + "UNI float sinY;"
    .endl() + "UNI float lifeTime;"
    .endl() + "UNI float speed;"

    .endl() + "UNI sampler2D simTexPos;"

    .endl() + "IN vec2 texCoord;"

    .endl() + "float random(vec2 co)"
    .endl() + "{"
    .endl() + "   return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);"
    .endl() + "}"

    .endl() + "void main()"
    .endl() + "{"
    .endl() + "   vec4 old = texture2D( simTexPos, texCoord );"
    .endl() + "   float rand=random(gl_FragCoord.xy)*3.0;"

    .endl() + " float pLifeTime=(random(texCoord*1.12320)*lifeTime);"
    .endl() + " float rndOffset=(4.0 * random(texCoord));"


    .endl() + "   float x=-1.0*mod(time*speed + rndOffset , pLifeTime);"
    .endl() + "   float y=random(texCoord*3.32123)*sizeY-sizeY/2.0+sinY*random(texCoord*2.223)*sizeY*sin(time+16.0*random(texCoord*1.12123));"
    .endl() + "   float z=random(texCoord*1.111)*sizeZ-sizeZ/2.0+sinZ*random(texCoord*1.453)*sizeZ*sin(time+16.0*random(texCoord*1.4523));"

    .endl() + "   gl_FragColor = vec4(x,y,z,x/lifeTime*0.7);"
    .endl() + "}";

let simShader = new CGL.Shader(cgl, "pointspray");
simShader.setSource(simShader.getDefaultVertexShader(), simSrc);
new CGL.Uniform(simShader, "t", "simTexPos", 3);
new CGL.Uniform(simShader, "f", "sizeZ", sizeZ);
new CGL.Uniform(simShader, "f", "sizeY", sizeY);
new CGL.Uniform(simShader, "f", "sinY", sinY);
new CGL.Uniform(simShader, "f", "sinZ", sinZ);

new CGL.Uniform(simShader, "f", "lifeTime", lifeTime);
new CGL.Uniform(simShader, "f", "speed", speed);


let uniTime = new CGL.Uniform(simShader, "f", "time", 0);

let effect = new CGL.TextureEffect(cgl, { "fp": true });
effect.setSourceTexture(simTexPos);

numPoints.onChange = setPoints;
let mesh = null;
let geom = new CGL.Geometry();

let posShader = null;

setPoints();

function setPoints()
{
    geom.vertices.length = Math.round(numPoints.get()) * 3;
    let texCoords = [];
    texCoords.length = Math.round(numPoints.get()) * 2;

    let sq = Math.round(Math.sqrt(numPoints.get()));
    if (sq > 1024)sq = 1024;

    for (let i = 0; i < sq; i++)
    {
        for (let j = 0; j < sq; j++)
        {
            let index = i * 1024 + j;
            geom.vertices[index * 3 + 0] = i / 1024;
            geom.vertices[index * 3 + 1] = j / 1024;
            geom.vertices[index * 3 + 2] = 0;

            texCoords[index * 2] = 0;
            texCoords[index * 2 + 1] = 0;
        }
    }

    geom.setPointVertices(geom.vertices);
    geom.setTexCoords(texCoords);

    mesh = new CGL.Mesh(cgl, geom, { "glPrimitive": cgl.gl.POINTS });
    mesh.addVertexNumbers = true;
    mesh.setGeom(geom);
}

let posModule = null;


function removeModule()
{
    if (posShader && posModule)
    {
        posShader.removeModule(posModule);
        posShader = null;
    }
}

render.onLinkChanged = removeModule;

render.onTriggered = function ()
{
    // set position shader...

    if (cgl.getShader() != posShader)
    {
        if (posShader) removeModule();

        posShader = cgl.getShader();

        posModule = posShader.addModule(
            {
                "name": "MODULE_VERTEX_POSITION",
                "srcHeadVert": srcHeadVert,
                "srcBodyVert": srcBodyVert
            });

        uniTexture = new CGL.Uniform(posShader, "t", posModule.prefix + "_texturePos", 4);
    }



    // do simulation
    let t = effect.getCurrentSourceTexture().tex;
    cgl.pushShader(simShader);
    effect.bind();

    cgl.setTexture(3, t);

    effect.finish();
    cgl.popShader();

    uniTime.setValue(timeIn.get());


    if (simTexPos)
    {
        // cgl.setTexture(0,t);
        cgl.setTexture(4, simTexPos.tex);
        // cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, simTexPos.tex);
    }

    // render points...
    if (mesh) mesh.render(cgl.getShader());
};
