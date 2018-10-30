
op.name='LineArray';
var render=op.inTrigger('render');
var width=op.addInPort(new CABLES.Port(op,"width"));
var height=op.addInPort(new CABLES.Port(op,"height"));
var doLog=op.inValueBool("Logarithmic",false);
var pivotX=op.addInPort(new CABLES.Port(op,"pivot x",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new CABLES.Port(op,"pivot y",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));
var nColumns=op.addInPort(new CABLES.Port(op,"num columns"));
var nRows=op.addInPort(new CABLES.Port(op,"num rows"));
var axis=op.addInPort(new CABLES.Port(op,"axis",CABLES.OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));
var trigger=op.outTrigger('trigger');
var outPointArrays=op.outArray("Point Arrays");

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

width.set(1.0);
height.set(1.0);
nRows.set(10);
nColumns.set(10);

var meshes=[];

axis.onChange=rebuildDelayed;
pivotX.onChange=rebuildDelayed;
pivotY.onChange=rebuildDelayed;
width.onChange=rebuildDelayed;
height.onChange=rebuildDelayed;
nRows.onChange=rebuildDelayed;
nColumns.onChange=rebuildDelayed;
doLog.onChange=rebuildDelayed;



rebuild();

render.onTriggered=function()
{
    for(var i=0;i<meshes.length;i++) meshes[i].render(cgl.getShader());
    trigger.trigger();
};

var delayRebuild=0;
function rebuildDelayed()
{
    clearTimeout(delayRebuild);
    delayRebuild=setTimeout(rebuild,60);
}

function rebuild()
{
    var x=0;
    var y=0;

    if(pivotX.get()=='center') x=0;
    if(pivotX.get()=='right') x=-width.get()/2;
    if(pivotX.get()=='left') x=+width.get()/2;

    if(pivotY.get()=='center') y=0;
    if(pivotY.get()=='top') y=-height.get()/2;
    if(pivotY.get()=='bottom') y=+height.get()/2;

    var numRows=parseInt(nRows.get(),10);
    var numColumns=parseInt(nColumns.get(),10);

    var stepColumn=width.get()/numColumns;
    var stepRow=height.get()/numRows;

    var c,r;
    meshes.length=0;

    var vx,vy,vz;
    var verts=[];
    var tc=[];
    var indices=[];
    var count=0;

    function addMesh()
    {
        var geom=new CGL.Geometry();
        geom.vertices=verts;
        geom.texCoords=tc;
        geom.verticesIndices=indices;
        
        var mesh=new CGL.Mesh(cgl, geom, cgl.gl.LINES);
        mesh.setGeom(geom);
        meshes.push(mesh);

        verts.length=0;
        tc.length=0;
        indices.length=0;
        count=0;
        lvx=null;
    }

    var min=Math.log(1/numRows);
    var max=Math.log(1);
    // op.log(min,max);

    var lines=[];

    for(r=numRows;r>=0;r--)
    {
        // op.log(r/numRows);
        var lvx=null,lvy=null,lvz=null;
        var ltx=null,lty=null;
        var log=0;
        var doLoga=doLog.get();
        
        var linePoints=[];
        lines.push(linePoints);
        

        for(c=numColumns;c>=0;c--)
        {
            vx = c * stepColumn - width.get()  / 2 + x;
            if(doLoga)
                vy=(Math.log((r/numRows) )/min)*height.get() - height.get() /2+y;
            else
                vy = r * stepRow    - height.get() / 2 + y;
            
            var tx = c/numColumns;
            var ty = 1.0-r/numRows;
            if(doLoga) ty = (Math.log((r/numRows) )/min);
            
            vz=0.0;

            if(axis.get()=='xz') 
            {
                vz=vy;
                vy= 0.0 ;
            }
            if(axis.get()=='xy') vz=0.0;

            if(lvx!==null)
            {
                verts.push( lvx );
                verts.push( lvy );
                verts.push( lvz );
                
                linePoints.push(lvx,lvy,lvz);
    
                verts.push( vx );
                verts.push( vy );
                verts.push( vz );
    
                tc.push( ltx );
                tc.push( lty );

                tc.push( tx );
                tc.push( ty );
    
                indices.push(count);
                count++;
                indices.push(count);
                count++;
            }
            
            if(count>64000)
            {
                addMesh();
            }

            ltx=tx;
            lty=ty;

            lvx=vx;
            lvy=vy;
            lvz=vz;
        }
    }
    
    outPointArrays.set(lines);

    addMesh();

    // op.log(meshes.length,' meshes');


}
