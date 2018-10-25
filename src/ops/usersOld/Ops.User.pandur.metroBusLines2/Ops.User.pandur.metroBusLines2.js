var patch=this.patch;
var cgl=this.patch.cgl;
//Op.apply(this, arguments);

this.name='metroBusLines';
var self=this;

var exe=this.addInPort(new CABLES.Port(this,"exe",CABLES.OP_PORT_TYPE_FUNCTION));
var trigger=this.addOutPort(new CABLES.Port(this,"next",CABLES.OP_PORT_TYPE_FUNCTION));
filename=this.addInPort(new CABLES.Port(this,"file",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'json' } ));

var time=this.addInPort(new CABLES.Port(this,"time",CABLES.OP_PORT_TYPE_VALUE));

var speed=this.addInPort(new CABLES.Port(this,"speed",CABLES.OP_PORT_TYPE_VALUE));
speed.set(0.08);



var outR=this.addOutPort(new CABLES.Port(this,"r",CABLES.OP_PORT_TYPE_VALUE));
var outG=this.addOutPort(new CABLES.Port(this,"g",CABLES.OP_PORT_TYPE_VALUE));
var outB=this.addOutPort(new CABLES.Port(this,"b",CABLES.OP_PORT_TYPE_VALUE));

var outIndex=this.addOutPort(new CABLES.Port(this,"index",CABLES.OP_PORT_TYPE_VALUE));


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

                        verts.push( data[i].items[j].latitude-34 );
                        verts.push( Math.sin( (data[i].items[j].longitude+data[i].items[j].latitude)*32.0 )*0.001 );
                        verts.push( data[i].items[j].longitude+118 );

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

        // cgl.pushModelMatrix();
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
        // cgl.popModelMatrix();

    

    }
    trigger.trigger();


};
