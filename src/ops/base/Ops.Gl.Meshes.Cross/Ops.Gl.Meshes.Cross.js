var render = op.inFunction('render');
var extend = op.inValue('extend');
var thick = op.inValue('thicker');
var target = op.inValueBool('Crosshair');
var active = op.inValueBool('Active',true);

var trigger = op.outFunction('trigger');
var outGeometry = op.outObject("geometry");


var cgl = op.patch.cgl;
var geom = null;
var mesh = null;

extend.set(1.0);
thick.set(0.25);

render.onTriggered=function()
{
    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

op.preRender=function()
{
    buildMesh();
    mesh.render(cgl.getShader());
};


function buildMesh()
{
    if(!geom)geom = new CGL.Geometry("cubemesh");
    geom.clear();
    
    var ext = extend.get();
    var thi = thick.get();
    
    if (thi < 0.0) 
    {
        thi = 0.0;
    }
    else if (thi > ext) 
    {
        thi = ext;
    }
    
    if (ext < 0.0) 
    {
        ext = 0.0;
        thi = 0.0;
    }
    
    //center verts
    var cx = thi;
    var cy = thi ;
    
    //o is outer verts from center
    var ox = ext ;
    var oy = ext ;


    geom.vertices = [
        //center piece
        -cx,-cy,0,          //0
        -cx,cy,0,           //1
        cx, cy,0,           //2
        cx,-cy,0,           //3
        
        //left piece
        -ox,-cy,0,          //4
        -ox,cy,0,           //5
        -cx,cy,0,           //6
        -cx,-cy,0,          //7
        
        //right piece
        cx,-cy,0,           //8
        cx,cy,0,            //9
        ox,cy,0,            //10
        ox,-cy,0,           //11
        
        //top piece
        -cx,cy,0,           //12
        -cx,oy,0,           //13
        cx, oy,0,           //14
        cx,cy,0,            //15
        
        //bottom piece
        -cx,-oy,0,          //12
        -cx,-cy,0,          //13
        cx, -cy,0,          //14
        cx,-oy,0            //15
        
        ];
    
    var texCoords = [];
    for (var i = 0; i < geom.vertices.length; i += 3)
    {
        var vx = (geom.vertices[i] / (ox) + 1) / 2;
        var vy = (geom.vertices[i+1] / (oy) + 1) / 2;
        
        // var index = (i / 3.0) * 2.0;
        texCoords.push(vx);
        texCoords.push(vy);
    }
    
    geom.setTexCoords(texCoords);

    geom.vertexNormals = [
        //center piece
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        
        //left
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //right
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //top
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        //bottom
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0,
        0.0,0.0,1.0
        
        
    ];
    //draws a solid cross
    var solidCross =[
        //center
        0,1,2,      0,2,3,
        //left
        4,5,6,      4,6,7,
        //right
        8,9,10,     8,10,11,
        //top
        12,13,14,   12,14,15,
        //bottom
        16,17,18,   16,18,19
        ];
    //removes center quad to make a crosshair
    var crossHair =[
        //left
        4,5,6,      4,6,7,
        //right
        8,9,10,     8,10,11,
        //top
        12,13,14,   12,14,15,
        //bottom
        16,17,18,   16,18,19
        ];

    if(target.get() == true )
    {
        geom.verticesIndices = crossHair;
    }
    else
    {
        geom.verticesIndices = solidCross;
    }
    
    mesh = new CGL.Mesh(cgl,geom);
    outGeometry.set(null);
    outGeometry.set(geom);

}

extend.onValueChanged = buildMesh;
thick.onValueChanged = buildMesh;
target.onChange = buildMesh;

buildMesh();