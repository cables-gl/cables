// from https://github.com/ahoiin/supershape.js/blob/master/js/objects.js

op.name="SuperShape";

var render=op.inFunction("render");
var pNormalizeSize=op.inValueBool("Normalize Size",true);
var asPointCloud=op.inValueBool("Point Cloud",false);
var pStep=op.inValue("Step",0.05);

var a1=op.inValue("a1",1);
var b1=op.inValue("b1",1);
var m1=op.inValue("m1",5);
var n11=op.inValue("n11",1);
var n21=op.inValue("n21",1);
var n31=op.inValue("n31",2);

var a2=op.inValue("a2",1);
var b2=op.inValue("b2",1);
var m2=op.inValue("m2",5);
var n12=op.inValue("n12",1);
var n22=op.inValue("n22",1);
var n32=op.inValue("n32",3);

var trigger=op.outFunction("Trigger");
var outNumVerts=op.outValue("Num Vertices");
var outGeom=op.outObject("geom");

var needsUpdate=true;
var geometry=new CGL.Geometry();
var mesh=null;
var verts=[];

function doUpdate()
{
    needsUpdate=true;
}

asPointCloud.onChange=function()
{
    mesh=null;
    needsUpdate=true;
};
pNormalizeSize.onChange=doUpdate;
pStep.onChange=doUpdate;
a1.onChange=doUpdate;
b1.onChange=doUpdate;
m1.onChange=doUpdate;
n11.onChange=doUpdate;
n21.onChange=doUpdate;
n31.onChange=doUpdate;
a2.onChange=doUpdate;
b2.onChange=doUpdate;
m2.onChange=doUpdate;
n12.onChange=doUpdate;
n22.onChange=doUpdate;
n32.onChange=doUpdate;

render.onTriggered=function()
{
    if(needsUpdate)update();
    if(mesh) mesh.render(op.patch.cgl.getShader());

    trigger.trigger();
};

function update()
{
    verts.length=0;
    geometry.clear();
    // geometry=new CGL.Geometry();
    needsUpdate=false;
    // geometry.dynamic = true;
    step = pStep.get();
    var q = parseInt(2 * Math.PI / step + 1.3462);
    var o = parseInt(Math.PI / step + 1.5);
    
    var resize=pNormalizeSize.get();
    var max=0;

    for (var l = 0; l < (q); l++) {
        var u = -Math.PI + l * step;
        for (var h = 0; h < (o); h++) {
            var s = -Math.PI / 2 + h * step;
            var m, k, n, g, v, e, t;
            var f = 0;
            var p = 0;
            var w = 0;
            m = Math.cos(m1.get() * u / 4);
            m = 1 / a1.get() * Math.abs(m);
            m = Math.abs(m);
            k = Math.sin(m1.get() * u / 4);
            k = 1 / b1.get() * Math.abs(k);
            k = Math.abs(k);
            g = Math.pow(m, n21.get()) + Math.pow(k, n31.get());
            v = Math.abs(g);
            v = Math.pow(v, (-1 / n11.get()));
            m = Math.cos(m2.get() * s / 4);
            m = 1 / a2.get() * Math.abs(m);
            m = Math.abs(m);
            k = Math.sin(m2.get() * s / 4);
            k = 1 / b2.get() * Math.abs(k);
            k = Math.abs(k);
            e = Math.pow(m, n22.get()) + Math.pow(k, n32.get());
            t = Math.abs(e);
            t = Math.pow(t, (-1 / n12.get()));
            f = v * Math.cos(u) * t * Math.cos(s);
            p = v * Math.sin(u) * t * Math.cos(s);
            w = t * Math.sin(s);
            verts.push(f);
            verts.push(p);
            verts.push(w);
            
            if(resize)
            {
                max=Math.max(max,Math.abs(f));
                max=Math.max(max,Math.abs(p));
                max=Math.max(max,Math.abs(w));
            }
        }
    }
    
    if(resize && max>1) for(var i=0;i<verts.length;i++) verts[i]/=max;

    
    if(asPointCloud.get())
    {
        geometry.setPointVertices(verts);
        mesh =new CGL.Mesh(op.patch.cgl,geometry,op.patch.cgl.gl.POINTS);
        mesh.addVertexNumbers=true;
        mesh.setGeom(geometry);
    }
    else
    {
        for (var u = 0; u < (q - 1); u++)
        {
            for (var s = 0; s < (o - 1); s++)
            {
                var d = u * o + s;
                var c = u * o + s + 1;
                var b = (u + 1) * o + s + 1;
                var a = (u + 1) * o + s;
                // geometry.faces.push(new THREE.Face4(d, c, b, a));
                geometry.verticesIndices.push(d);
                geometry.verticesIndices.push(c);
                geometry.verticesIndices.push(b);
                
                geometry.verticesIndices.push(a);
                geometry.verticesIndices.push(b);
                geometry.verticesIndices.push(d);
            }
        }
        geometry.vertices=verts;
        outNumVerts.set(verts.length);
        
        geometry.calculateNormals({"forceZUp":true});
    
        if(!mesh) mesh=new CGL.Mesh(op.patch.cgl,geometry);
            else mesh.setGeom(geometry);        
    }

    outGeom.set(null);
    outGeom.set(geometry);
};

