op.name="MetroHeightMap";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var smooth=op.addInPort(new Port(op,"smooth",OP_PORT_TYPE_VALUE,{"display":"bool"}));
var nRows=op.addInPort(new Port(op,"rows",OP_PORT_TYPE_VALUE));
var nColumns=op.addInPort(new Port(op,"columns",OP_PORT_TYPE_VALUE));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outGeom=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
outGeom.ignoreValueSerialize=true;


nRows.set(20);
nColumns.set(20);

var mesh=null;
var cgl=op.patch.cgl;
var image = new Image();

render.onTriggered=function()
{
    if(mesh) mesh.render(cgl.getShader());
        else rebuildGeom();
    trigger.trigger();
};


smooth.onValueChanged=rebuildGeom;
nRows.onValueChanged=rebuildGeom;
nColumns.onValueChanged=rebuildGeom;

// window.METROPOLIS.maxLat=34.475449999999974;
// window.METROPOLIS.maxLon=-117.17766399999971;
// window.METROPOLIS.minLat=33.31545;
// window.METROPOLIS.minLon=-119.017664;
// window.METROPOLIS.latLonCoord=function(lat,lon)

function rebuildGeom()
{
    if(!window.METROPOLIS || !window.METROPOLIS.elevationLoaded)
    {
        console.log('wait for elevation...');
        return;
    }
    console.log('calc elevation heightmap... ',window.METROPOLIS.elevationLoaded);
    var geom=new CGL.Geometry();

    var verts=[];
    var tc=[];
    var indices=[];

    var minLat=window.METROPOLIS.minLat;
    var minLon=window.METROPOLIS.minLon;
    var maxLat=window.METROPOLIS.maxLat;
    var maxLon=window.METROPOLIS.maxLon;

    var count=0;
    var numRows=parseFloat(nRows.get());
    var numColumns=parseFloat(nColumns.get());
    var geoWidth=Math.abs(maxLat-minLat);
    var geoHeight=Math.abs(maxLon-minLon);
    
    // console.log(window.METROPOLIS.lowres);

    var stepLat=geoWidth/numColumns;
    var stepLon=geoHeight/numRows;

    var c=0;
    var r=0;

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            var lat=minLat+c*stepLat;
            var lon=minLon+r*stepLon;

            var coord=window.METROPOLIS.latLonCoord(lat,lon);
// console.log('coord',coord);
            verts.push(coord.lat);
            verts.push(coord.lon);
            verts.push(coord.z);
        }
    }

    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v2);
            indices.push(v3);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    if(!smooth.get())geom.unIndex();
    geom.calculateNormals({"forceZUp":true});
    outGeom.set(geom);

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
    mesh.setGeom(geom);
}


