var patch=this.patch;
var cgl=this.patch.cgl;
Op.apply(this, arguments);

this.name='metroBusLines';
var self=this;

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new Port(this,"next",OP_PORT_TYPE_FUNCTION));
filename=this.addInPort(new Port(this,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE));

var speed=this.addInPort(new Port(this,"speed",OP_PORT_TYPE_VALUE));
speed.set(0.08);



var outR=this.addOutPort(new Port(this,"r",OP_PORT_TYPE_VALUE));
var outG=this.addOutPort(new Port(this,"g",OP_PORT_TYPE_VALUE));
var outB=this.addOutPort(new Port(this,"b",OP_PORT_TYPE_VALUE));

var outIndex=this.addOutPort(new Port(this,"index",OP_PORT_TYPE_VALUE));


var data=null;
var meshes=[];

// var speed=0.08;

var reload=function()
{

    CABLES.ajax(
        patch.getFilePath(filename.get()),
        function(err,_data,xhr)
        {
            try
            {
                data=JSON.parse(_data);
                var geom=new CGL.Geometry();

                var count=0;
                for(var i in data)
                {
                    count=0;

                    var verts=[];
                    var indices=[];
                    var tc=[];

                    for(var j in data[i].items)
                    {
                        var time=count*0.1;

                        var coord=window.METROPOLIS.latLonCoord(data[i].items[j].latitude,data[i].items[j].longitude);
                        verts.push( coord.lat );
                        verts.push( coord.lon );
                        verts.push( coord.z );
                        // verts.push( Math.sin( (data[i].items[j].longitude+data[i].items[j].latitude)*32.0 )*0.001 );

                        tc.push(0);
                        tc.push(j/data[i].items.length);

// anim.posX.addKey(new CABLES.TL.Key({time:time,v:data[i].items[j].latitude-34}));
// anim.posZ.addKey(new CABLES.TL.Key({time:time,v:data[i].items[j].longitude+118}));

                        count++;
                    }

                    for(var k=0;k<verts.length/3;k++)
                    {
                        indices.push(k);
                        // indices.push(k*3+1);
                        // indices.push(k*3+2);
                    }


                    geom.vertices=verts;
                    geom.texCoords=tc;
                    geom.verticesIndices=indices;
                    var mesh=new CGL.Mesh(cgl,geom);
                    meshes.push(mesh);

                }

                // console.log('anims OK...',anims.length);
                self.uiAttr({'error':null});
            }
            catch(e)
            {
                self.uiAttr({'error':'error loading json'});
                console.log(e.stack);
            }
        });

};

filename.onValueChanged=reload;
var tempVec=vec3.create();
var index=0;

exe.onTriggered=function()
{
    var count=0;

    for(var i in meshes)
    {
        meshes[i].render(cgl.getShader());

        // if(i==0)
        // {
        //     // console.log(anims[i].posX.keys);
        // }
        
        // var t = (time.get()*speed.get())% (0.1 * anims[i].posX.keys.length);

        //             outIndex.set(i);

        // cgl.pushMvMatrix();
        // vec3.set(tempVec,
        //     anims[i].posX.getValue(t),
        //     0,
        //     anims[i].posZ.getValue(t)
        //     );

        // outR.set(anims[i].colr);
        // outG.set(anims[i].colg);
        // outB.set(anims[i].colb);

        // mat4.translate(cgl.mvMatrix,cgl.mvMatrix, tempVec);
        // trigger.trigger();
        // cgl.popMvMatrix();

    

    }
    trigger.trigger();


};
