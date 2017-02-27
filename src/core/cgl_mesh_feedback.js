// view-source:http://toji.github.io/webgl2-particles-2/


CGL.Mesh.prototype.hasFeedbacks=function()
{
    return this._feedBacks.length>0;
};

CGL.Mesh.prototype.removeFeedbacks=function(shader)
{
    if(!this._feedbacks)return;
    this._feedbacks.length=0;
    this._feedBacksChanged=true;
};

CGL.Mesh.prototype.setAttributeFeedback=function()
{

};

CGL.Mesh.prototype.setFeedback=function(attrib,nameOut,initialArr)
{
    var fb={
            "nameOut":nameOut,
        };

    var found=false;

this.unBindFeedbacks();

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

    // console.log("setfeedback");

    if(fb.outBuffer)this._cgl.gl.deleteBuffer(fb.outBuffer);
    // if(fb.attrib.buffer)this._cgl.gl.deleteBuffer(fb.attrib.buffer);
    fb.outBuffer= this._cgl.gl.createBuffer();
    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.outBuffer);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, fb.initialArr, this._cgl.gl.STATIC_DRAW);

    this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.attrib.buffer);
    this._cgl.gl.bufferData(this._cgl.gl.ARRAY_BUFFER, fb.initialArr, this._cgl.gl.STATIC_DRAW);


    if(!found)this._feedBacks.push(fb);

    // console.log('initialArr',initialArr.length/3);
    // console.log('vertices',fb.attrib.numItems);
    // console.log('vertices',this._bufVertexAttrib.numItems);

    return fb;
};

CGL.Mesh.prototype.bindFeedback=function(attrib)
{
    if(!this._feedBacks || this._feedBacks.length===0)return;
    if(this._transformFeedBackLoc==-1)this._transformFeedBackLoc=this._cgl.gl.createTransformFeedback();

    this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, this._transformFeedBackLoc);

    var found=false;

    for(var  i=0;i<this._feedBacks.length;i++)
    {
        var fb=this._feedBacks[i];

        if(fb.attrib==attrib)
        {
            found=true;
            // this._cgl.gl.bindBuffer(this._cgl.gl.ARRAY_BUFFER, fb.attrib.buffer);
            //
            // this._cgl.gl.vertexAttribPointer(
            //     fb.attrib.loc,
            //     fb.attrib.itemSize,
            //     fb.attrib.type,
            //     false,
            //     fb.attrib.itemSize*4, 0);

            this._cgl.gl.bindBufferBase(this._cgl.gl.TRANSFORM_FEEDBACK_BUFFER, i, fb.outBuffer);

        }

    }

    if(!found)
    {
        // console.log("ARTTRIB NOT FOUND",attrib.name);
    }

};

CGL.Mesh.prototype.drawFeedbacks=function(shader,prim)
{
    var i=0;

    if(this._feedBacksChanged)
    {
        var names=[];
        this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, this._transformFeedBackLoc);

        for( i=0;i<this._feedBacks.length;i++) names.push(this._feedBacks[i].nameOut);
        shader.setFeedbackNames(names);

        console.log('feedbacknames',names);

        shader.compile();
        this._feedBacksChanged=false;
        this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, null);
        console.log('changed finished');
        return;
    }


    //
    // for( i=0;i<this._feedBacks.length;i++)
    // {
    //     var fb=this._feedBacks[i];
    //
    //     this._cgl.gl.bindBufferBase(this._cgl.gl.TRANSFORM_FEEDBACK_BUFFER, i, fb.outBuffer);
    // }

    // draw
    this._cgl.gl.beginTransformFeedback(this.glPrimitive);
    this._cgl.gl.drawArrays(prim, 0,this._feedBacks[0].attrib.numItems);

    // unbind
    this._cgl.gl.endTransformFeedback();

    this.unBindFeedbacks();

    this.feedBacksSwapBuffers();
};

CGL.Mesh.prototype.unBindFeedbacks=function()
{
    for(i=0;i<this._feedBacks.length;i++)
    {
        // this._cgl.gl.disableVertexAttribArray(this._feedBacks[i].attrib.loc);
        this._cgl.gl.bindBufferBase(this._cgl.gl.TRANSFORM_FEEDBACK_BUFFER, i, null);
    }

    this._cgl.gl.bindTransformFeedback(this._cgl.gl.TRANSFORM_FEEDBACK, null);
};

CGL.Mesh.prototype.feedBacksSwapBuffers=function()
{
    for(var i=0;i<this._feedBacks.length;i++)
    {
        var t=this._feedBacks[i].attrib.buffer;
        this._feedBacks[i].attrib.buffer=this._feedBacks[i].outBuffer;
        this._feedBacks[i].outBuffer=t;
    }
};
