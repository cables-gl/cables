// view-source:http://toji.github.io/webgl2-particles-2/


CGL.Mesh.prototype.hasFeedbacks=function()
{
    return this._feedBacks.length>0;
};

CGL.Mesh.prototype.feedBacksSwapBuffers=function()
{
    for(var i=0;i<this._feedBacks.length;i++)
    {
        var t=this._feedBacks[i].attrib.buffer;
        this._feedBacks[i].attrib.buffer=this._feedBacks[i].bufferB;
        this._feedBacks[i].bufferB=t;
    }
};

CGL.Mesh.prototype.setFeedback=function(attrib,nameOut,initialArr)
{
    var fb={
            "nameOut":nameOut,
        };

    var found=false;

    for(var i=0;i<this._feedBacks.length;i++)
    {
        if(this._feedBacks[i].nameOut==nameOut)
        {
            fb=this._feedBacks[i];

            found=true;
        }
    }

    if(!found)this._feedBacksChanged=true;

    fb.initialArr=initialArr;
    fb.attrib=attrib;

    console.log("setfeedback");


    if(fb.bufferB)this._cgl.gl.deleteBuffer(fb.bufferB);
    fb.bufferB= this._cgl.gl.createBuffer();
    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.bufferB);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, fb.initialArr, this._cgl.gl.DYNAMIC_COPY);


    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.attrib.buffer);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, fb.initialArr, this._cgl.gl.DYNAMIC_COPY);

    if(!found)this._feedBacks.push(fb);


    console.log('initialArr',initialArr.length/3);
    console.log('vertices',fb.attrib.numItems);
    console.log('vertices',this._bufVertexAttrib.numItems);


    return fb;
};

CGL.Mesh.prototype.drawFeedbacks=function(shader,prim)
{
    var i=0;
    if(this._transformFeedBackLoc==-1)this._transformFeedBackLoc=this._cgl.gl.createTransformFeedback();

    this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, this._transformFeedBackLoc);

    if(this._feedBacksChanged)
    {
        var names=[];
        for( i=0;i<this._feedBacks.length;i++) names.push(this._feedBacks[i].nameOut);
        shader.setFeedbackNames(names);

        shader.compile();
        this._feedBacksChanged=false;
        return;
    }

    for( i=0;i<this._feedBacks.length;i++)
    {
        var fb=this._feedBacks[i];
        // console.log('initialArr',fb.initialArr.length);
        // if(fb.attrib.loc==-1) fb.attrib.loc = this._cgl.gl.getAttribLocation(shader.getProgram(), fb.attrib.name);

        // this._cgl.gl.enableVertexAttribArray(fb.attrib.loc);

        this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.attrib.buffer);

        this._cgl.gl.vertexAttribPointer(
            fb.attrib.loc,
            fb.attrib.itemSize,
            fb.attrib.type,
            false,
            fb.attrib.itemSize*4, 0);

        this._cgl.gl.bindBufferBase(this._cgl.gl.TRANSFORM_FEEDBACK_BUFFER, i, fb.bufferB);
    }

    // draw
    this._cgl.gl.beginTransformFeedback(this.glPrimitive);
    this._cgl.gl.drawArrays(prim, 0,this._feedBacks[0].attrib.numItems);


    // unbind
    this._cgl.gl.endTransformFeedback();

    for(i=0;i<this._feedBacks.length;i++)
    {
        this._cgl.gl.bindBufferBase(this._cgl.gl.TRANSFORM_FEEDBACK_BUFFER, i, null);
        this._cgl.gl.disableVertexAttribArray(this._feedBacks[i].attrib.loc);
    }

    this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, null);

    this.feedBacksSwapBuffers();
};
