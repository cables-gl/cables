var CABLES = CABLES || {};

/**
 * patch-config
 * @typedef {Object} patchConfig
 * @memberof CABLES
 * @property {string} [prefixAssetPath=''] path to assets
 * @property {string} [glCanvasId='glcanvas'] dom element id of canvas element
 * @property {function} [onError=null] called when an error occurs
 * @property {function} [onFinishedLoading=null] called when patch finished loading all assets
 * @property {function} [onFirstFrameRendered=null] called when patch rendered it's first frame
 * @property {boolean} [glCanvasResizeToWindow=false] resize canvas automatically to window size
 * @property {boolean} [silent=false] 
 * @property {Number} [fpsLimit=0] 0 for maximum possible frames per second
 */

/**
 * @name Patch
 * @memberof CABLES
 * @param {patchConfig} config
 * @constructor
 * @class
 */
CABLES.Patch = function(cfg) {
    this.ops = [];
    this.settings = {};
    this.timer = new CABLES.Timer();
    this.freeTimer = new CABLES.Timer();
    this.animFrameOps = [];
    this.animFrameCallbacks = [];
    this.gui = false;
    this.silent = false;
    this.profiler = null;
    this.onLoadStart = null;
    this.onLoadEnd = null;
    this.aborted = false;
    this.loading = new CABLES.LoadingStatus();

    this._fps=0;
    this._fpsFrameCount=0;
    this._fpsMsCount=0;
    this._fpsStart=0;

    this._volumeListeners = [];
    this._paused = false;
    this._frameNum = 0;
    this.instancing = new CABLES.Instancing();
    this.onOneFrameRendered=null;

    this.config = cfg || {
        glCanvasResizeToWindow: false,
        glCanvasId: 'glcanvas',
        prefixAssetPath: '',
        silent: false,
        onError: null,
        onFinishedLoading: null,
        onFirstFrameRendered: null,
        fpsLimit: 0
    };

    if (!this.config.prefixAssetPath) this.config.prefixAssetPath = '';
    if (!this.config.masterVolume) this.config.masterVolume = 1.0;

    this._variables = {};
    this._variableListeners = [];
    this.vars = {};
    if (cfg && cfg.vars) this.vars = cfg.vars;

    this.cgl = new CGL.Context();
    this.cgl.patch = this;
    this.cgl.setCanvas(this.config.glCanvasId);
    if (this.config.glCanvasResizeToWindow === true) this.cgl.setAutoResizeToWindow(true);
    this.loading.setOnFinishedLoading(this.config.onFinishedLoading);

    if (this.cgl.aborted) this.aborted = true;
    if (this.cgl.silent) this.silent = true;

    this.freeTimer.play();
    this.exec();

    if (!this.aborted) {
        if (this.config.patch) {
            this.deSerialize(this.config.patch);
            this.timer.play();
        } else
        if (this.config.patchFile) {
            CABLES.ajax(this.config.patchFile, function(err, _data) {
                var data = JSON.parse(_data);
                if (err) {
                    var txt = '';

                    console.error('err', err);
                    console.error('data', data);
                    console.error('data', data.msg);
                    return;
                }

                this.deSerialize(data);
            }.bind(this));

            this.timer.play();
        }
    }

    console.log("made with cables.gl")

};

CABLES.Patch.prototype.isPlaying = function() {
    return !this._paused;
};

CABLES.Patch.prototype.renderOneFrame = function() {
    this._paused=true;
    this._renderOneFrame=true;
    this.exec();
    this._renderOneFrame=false;
}

/**
 * current number of frames per second
 * @name CABLES.Patch#getFPS
 * @return {Number} fps
 * @function
 */
CABLES.Patch.prototype.getFPS = function() {
    return this._fps;
};


/**
 * pauses patch execution
 * @name CABLES.Patch#pause
 * @function
 */
CABLES.Patch.prototype.pause = function() {
    this._paused = true;
    this.freeTimer.pause();
};

/**
 * resumes patch execution
 * @name CABLES.Patch#resume
 * @function
 */
CABLES.Patch.prototype.resume = function() {
    if (this._paused) {
        this._paused = false;
        this.freeTimer.play();
        this.exec();
    }
};

/**
 * set volume [0-1]
 * @name CABLES.Patch#setVolume
 * @function
 */
CABLES.Patch.prototype.setVolume = function(v) {
    this.config.masterVolume = v;
    for (var i = 0; i < this._volumeListeners.length; i++)
        this._volumeListeners[i].onMasterVolumeChanged(v);
};

/**
 * get url/filepath for a filename 
 * this uses prefixAssetpath in exported patches
 * @name CABLES.Patch#getFilePath
 * @param {String} filename
 * @return {String} url
 * @function
 */
CABLES.Patch.prototype.getFilePath = function(filename) {
    if (!filename) return filename;
    if (filename.indexOf('https:') === 0 || filename.indexOf('http:') === 0) return filename;

    filename = filename.replace('//', '/');

    var finalFilename = this.config.prefixAssetPath + filename + (this.config.suffixAssetPath||'');
    // console.log('finalFilename',finalFilename);

    return finalFilename;
};

CABLES.Patch.prototype.clear = function() {
    this.cgl.TextureEffectMesh = null;
    this.animFrameOps.length = 0;
    this.timer = new CABLES.Timer();
    while (this.ops.length > 0)
        this.deleteOp(this.ops[0].id);
};


CABLES.Patch.getOpClass = function(objName) {
    var parts = objName.split('.');
    var opObj = null;

    try {

        if (parts.length == 2) opObj = window[parts[0]][parts[1]];
        else if (parts.length == 3) opObj = window[parts[0]][parts[1]][parts[2]];
        else if (parts.length == 4) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]];
        else if (parts.length == 5) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
        else if (parts.length == 6) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
        else if (parts.length == 7) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
        else if (parts.length == 8) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
        else if (parts.length == 9) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
        else if (parts.length == 10) opObj = window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
        return opObj;

    } catch (e) {
        return null;
    }
};

// CABLES.Patch.prototype.addOp=function(objName,uiAttribs,next)
// {
//     // if(CABLES.UI && gui.serverOps.opHasLibs(objName) && !gui.serverOps.opLibsLoaded(objName) )
//     // {
//     //     var self=this;
//     //
//     //     gui.serverOps.loadOpLibs(objName,function()
//     //     {
//     //         self.doAddOp(objName,uiAttribs,next);
//     //     });
//     // }
//     // else
//     return this.doAddOp(objName,uiAttribs,next);
// };

CABLES.Patch.prototype.createOp = function(objName) {
    var parts = objName.split('.');
    var op = null;

    try {
        var opObj = CABLES.Patch.getOpClass(objName);

        if (!opObj) {
            if (CABLES.UI) {
                CABLES.UI.MODAL.showError('unknown op', 'unknown op: ' + objName);
            }
            console.error('unknown op: ' + objName);
            throw('unknown op: ' + objName);
        } else {
            if (parts.length == 2) op = new window[parts[0]][parts[1]](this, objName);
            else if (parts.length == 3) op = new window[parts[0]][parts[1]][parts[2]](this, objName);
            else if (parts.length == 4) op = new window[parts[0]][parts[1]][parts[2]][parts[3]](this, objName);
            else if (parts.length == 5) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]](this, objName);
            else if (parts.length == 6) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]](this, objName);
            else if (parts.length == 7) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]](this, objName);
            else if (parts.length == 8) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]](this, objName);
            else if (parts.length == 9) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]](this, objName);
            else if (parts.length == 10) op = new window[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]](this, objName);
            else console.log('parts.length', parts.length);
        }
    }
    catch (e)
    {
        console.error('instancing error ' + objName);
        if (CABLES.UI)
            CABLES.UI.MODAL.showOpException(e, objName);
        else
        {
            if (CABLES.api) CABLES.api.sendErrorReport(e);
            console.log(e);
            console.log(e.stacktrace);
            throw 'instancing error ' + objName;
        }
    }

    if (op) {
        op.objName = objName;
        op.patch = this;
    }
    return op;
};

CABLES.Patch.prototype.addOp = function(objName, uiAttribs) {
    if (!objName || objName.indexOf('.') == -1) {
        CABLES.UI.MODAL.showError('could not create op', 'op unknown');
        return;
    }

    var op = this.createOp(objName);

    if (op) {
        op.uiAttr(uiAttribs);
        if (op.onCreate) op.onCreate();

        if (op.hasOwnProperty('onAnimFrame')) this.animFrameOps.push(op);
        if (op.hasOwnProperty('onMasterVolumeChanged')) this._volumeListeners.push(op);

        this.ops.push(op);

        if (this.onAdd) this.onAdd(op);
    }

    // if(next) next(op);
    return op;
};

CABLES.Patch.prototype.addOnAnimFrame = function(op) {
    this.animFrameOps.push(op);
};

CABLES.Patch.prototype.removeOnAnimFrame = function(op) {
    for (var i = 0; i < this.animFrameOps.length; i++) {
        if (this.animFrameOps[i] == op) {
            this.animFrameOps.splice(i, 1);
            return;
        }
    }
};

CABLES.Patch.prototype.addOnAnimFrameCallback = function(cb) {
    this.animFrameCallbacks.push(cb);
};

CABLES.Patch.prototype.removeOnAnimCallback = function(cb) {
    for (var i = 0; i < this.animFrameCallbacks.length; i++) {
        if (this.animFrameCallbacks[i] == cb) {
            this.animFrameCallbacks.splice(i, 1);
            return;
        }
    }
};

CABLES.Patch.prototype.deleteOp = function(opid, tryRelink) {
    for (var i in this.ops) {
        if (this.ops[i].id == opid) {
            var op = this.ops[i];
            var reLinkP1 = null;
            var reLinkP2 = null;

            if (op) {
                if (tryRelink) {
                    if (
                        (this.ops[i].portsIn.length > 0 && this.ops[i].portsIn[0].isLinked()) &&
                        (this.ops[i].portsOut.length > 0 && this.ops[i].portsOut[0].isLinked())) {
                        if (this.ops[i].portsIn[0].getType() == this.ops[i].portsOut[0].getType()) {
                            reLinkP1 = this.ops[i].portsIn[0].links[0].getOtherPort(this.ops[i].portsIn[0]);
                            reLinkP2 = this.ops[i].portsOut[0].links[0].getOtherPort(this.ops[i].portsOut[0]);
                        }
                    }
                }

                var opToDelete = this.ops[i];
                opToDelete.removeLinks();
                this.onDelete(opToDelete);
                // opToDelete.id=generateUUID();
                this.ops.splice(i, 1);

                if (opToDelete.onDelete) opToDelete.onDelete();
                opToDelete.cleanUp();

                if (reLinkP1 !== null && reLinkP2 !== null) {
                    this.link(
                        reLinkP1.parent,
                        reLinkP1.getName(),
                        reLinkP2.parent,
                        reLinkP2.getName()
                    );
                }
            }
        }
    }
};

CABLES.Patch.prototype.getFrameNum = function() {
    return this._frameNum;
};

var frameNext = 0;
var frameInterval = 0;
var lastFrameTime = 0;
var wasdelayed = true;

CABLES.Patch.prototype.renderFrame = function(e) {
    this.timer.update();
    this.freeTimer.update();

    var time = this.timer.getTime();


    for (var i = 0; i < this.animFrameCallbacks.length; ++i) {
        if (this.animFrameCallbacks[i]) this.animFrameCallbacks[i](time, this._frameNum);
    }

    for (var i = 0; i < this.animFrameOps.length; ++i) {
        if (this.animFrameOps[i].onAnimFrame) this.animFrameOps[i].onAnimFrame(time);
    }
    this._frameNum++;
    if (this._frameNum == 1) {
        if (this.config.onFirstFrameRendered) this.config.onFirstFrameRendered();
    }
};

CABLES.Patch.prototype.exec = function(e) {

    if(!this._renderOneFrame && ( this._paused || this.aborted )) return;

    this.config.fpsLimit = this.config.fpsLimit || 0;
    if (this.config.fpsLimit) {
        frameInterval = 1000 / this.config.fpsLimit;
    }

    var now = CABLES.now();
    var frameDelta = now - frameNext;
    

    if (CABLES.UI) {
        if (CABLES.UI.capturer) CABLES.UI.capturer.capture(this.cgl.canvas);

        if(!this._renderOneFrame)
        {
            if (now - lastFrameTime > 500 && lastFrameTime !== 0 && !wasdelayed) {
                lastFrameTime = 0;
                setTimeout(this.exec.bind(this), 500);
    
                if (CABLES.UI) $('#delayed').show();
                wasdelayed = true;
                return;
            }
    
        }

        // if(now-lastFrameTime>300 && lastFrameTime!==0  && !wasdelayed)
        // {
        //     lastFrameTime=0;
        //     setTimeout(this.exec.bind(this),300);
        //
        //     if(CABLES.UI)$('#delayed').show();
        //     wasdelayed=true;
        //     return;
        // }
    }

    if(this._renderOneFrame || this.config.fpsLimit === 0 || frameDelta > frameInterval || wasdelayed) {
        var startFrameTime=CABLES.now();
        this.renderFrame();
        this._fpsMsCount+=CABLES.now()-startFrameTime;

        if (frameInterval) frameNext = now - (frameDelta % frameInterval);
    }

    if (wasdelayed) {
        if (CABLES.UI) $('#delayed').hide();
        wasdelayed = false;
    }

    if(this._renderOneFrame && this.onOneFrameRendered)
    {
        this.onOneFrameRendered();
        this._renderOneFrame=false;
    }

    if(CABLES.now()-this._fpsStart>=1000)
    {
        if(this._fps!=this._fpsFrameCount)
        {
            this._fps=this._fpsFrameCount;
            if(CABLES.UI)
            {
                if(!CABLES.UI.fpsElement) CABLES.UI.fpsElement=$('#canvasInfoFPS');
                CABLES.UI.fpsElement.html('| fps: '+this._fps+' | ms: '+Math.round(this._fpsMsCount/this._fpsFrameCount));
            }
            this._fpsFrameCount=0;
            this._fpsMsCount=0;
            this._fpsStart=CABLES.now();
        }
    }
    
    lastFrameTime = CABLES.now();
    this._fpsFrameCount++;

    requestAnimationFrame(this.exec.bind(this));
};


CABLES.Patch.prototype.link = function(op1, port1Name, op2, port2Name) {
    if (!op1 || !op2) return;
    var port1 = op1.getPort(port1Name);
    var port2 = op2.getPort(port2Name);

    if (!port1) {
        console.warn('port not found! ' + port1Name);
        return;
    }

    if (!port2) {
        console.warn('port not found! ' + port2Name + ' of ' + op2.name);
        return;
    }

    if (!port1.shouldLink(port1, port2) || !port2.shouldLink(port1, port2)) {
        return false;
    }

    if (CABLES.Link.canLink(port1, port2)) {
        var link = new CABLES.Link(this);
        link.link(port1, port2);

        this.onLink(port1, port2);
        return link;
    }
};

CABLES.Patch.prototype.onAdd = function(op) {};
CABLES.Patch.prototype.onDelete = function(op) {};
CABLES.Patch.prototype.onLink = function(p1, p2) {};
CABLES.Patch.prototype.onUnLink = function(p1, p2) {};
CABLES.Patch.prototype.serialize = function(asObj) {
    var obj = {};

    obj.ops = [];
    obj.settings = this.settings;
    for (var i in this.ops) {
        // console.log(this.ops[i].objName);
        obj.ops.push(this.ops[i].getSerialized());
    }

    if (asObj) return obj;
    return JSON.stringify(obj);
};

CABLES.Patch.prototype.getOpById = function(opid) {
    for (var i in this.ops) {
        if (this.ops[i].id == opid) return this.ops[i];
    }
};

CABLES.Patch.prototype.getOpsByName = function(name) {
    var arr = [];
    for (var i in this.ops) {
        if (this.ops[i].name == name) arr.push(this.ops[i]);
    }
    return arr;
};

CABLES.Patch.prototype.getOpsByObjName = function(name) {
    var arr = [];
    for (var i in this.ops) {
        if (this.ops[i].objName == name) arr.push(this.ops[i]);
    }
    return arr;
};

CABLES.Patch.prototype.loadLib = function(which) {
    CABLES.ajaxSync('/ui/libs/' + which + '.js',
        function(err, res) {
            var se = document.createElement('script');
            se.type = "text/javascript";
            se.text = res;
            document.getElementsByTagName('head')[0].appendChild(se);
        }, 'GET');
    // open and send a synchronous request
    // xhrObj.open('GET', '/ui/libs/'+which+'.js', false);
    // xhrObj.send('');
    // add the returned content to a newly created script tag
};

CABLES.Patch.prototype.reloadOp = function(objName, cb) {
    var count = 0;
    var ops = [];
    for (var i in this.ops) {
        if (this.ops[i].objName == objName) {
            count++;
            var oldOp = this.ops[i];
            oldOp.deleted = true;
            var self = this;

            var op = this.addOp(objName, oldOp.uiAttribs);
            ops.push(op);

            var j, k, l;
            for (j in oldOp.portsIn) {
                if (oldOp.portsIn[j].links.length === 0) {
                    op.getPort(oldOp.portsIn[j].name).set(oldOp.portsIn[j].get());
                } else
                    while (oldOp.portsIn[j].links.length) {
                        var oldName = oldOp.portsIn[j].links[0].portIn.name;
                        var oldOutName = oldOp.portsIn[j].links[0].portOut.name;
                        var oldOutOp = oldOp.portsIn[j].links[0].portOut.parent;
                        oldOp.portsIn[j].links[0].remove();

                        l = self.link(
                            op,
                            oldName,
                            oldOutOp,
                            oldOutName
                        );
                        l.setValue();
                    }
            }

            for (j in oldOp.portsOut) {
                while (oldOp.portsOut[j].links.length) {
                    var oldNewName = oldOp.portsOut[j].links[0].portOut.name;
                    var oldInName = oldOp.portsOut[j].links[0].portIn.name;
                    var oldInOp = oldOp.portsOut[j].links[0].portIn.parent;
                    oldOp.portsOut[j].links[0].remove();

                    l = self.link(
                        op,
                        oldNewName,
                        oldInOp,
                        oldInName
                    );
                    l.setValue();
                }
            }


            this.deleteOp(oldOp.id);
        }
    }
    cb(count, ops);
};

CABLES.Patch.prototype.getSubPatchOps = function(patchId) {
    var ops = [];
    for (var i in this.ops) {
        if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId) {
            ops.push(this.ops[i]);
        }
    }
    return ops;
};

CABLES.Patch.prototype.getSubPatchOp = function(patchId, objName) {
    for (var i in this.ops) {
        if (this.ops[i].uiAttribs && this.ops[i].uiAttribs.subPatch == patchId && this.ops[i].objName == objName) {
            return this.ops[i];
        }
    }
    return false;
};

CABLES.Patch.prototype.deSerialize = function(obj, genIds) {

    if (this.aborted) return;

    var loadingId = this.loading.start('core', 'deserialize');
    if (this.onLoadStart) this.onLoadStart();

    var stopwatch=null;
    if(CABLES.StopWatch)stopwatch=new CABLES.StopWatch('deserialize');

    
    if (typeof obj === "string") obj = JSON.parse(obj);
    var self = this;

    if(stopwatch)stopwatch.stop('jsonparse');

    this.settings = obj.settings;

    function addLink(opinid, opoutid, inName, outName) {
        var found = false;
        if (!found) {
            self.link(
                self.getOpById(opinid),
                inName,
                self.getOpById(opoutid),
                outName
            );
        }
    }

    if(stopwatch)stopwatch.stop('add ops..');

    var reqs=new CABLES.Requirements(this);
    


    // console.log('add ops ',self.config.glCanvasId);
    // add ops...
    for (var iop in obj.ops) {

        var start=CABLES.now();
        var op = this.addOp(obj.ops[iop].objName, obj.ops[iop].uiAttribs);
        reqs.checkOp(op);

        if (op) {
            op.id = obj.ops[iop].id;
            if (genIds) op.id = CABLES.generateUUID();

            for (var ipi in obj.ops[iop].portsIn) {
                var objPort = obj.ops[iop].portsIn[ipi];
                var port = op.getPort(objPort.name);

                // if(typeof objPort.value =='string' && !isNaN(objPort.value)) objPort.value=parseFloat(objPort.value);
                if (port && (port.uiAttribs.display == 'bool' || port.uiAttribs.type == 'bool') && !isNaN(objPort.value)) {
                    objPort.value = true === objPort.value;
                }

                if (port && objPort.value !== undefined && port.type != OP_PORT_TYPE_TEXTURE) {
                    port.set(objPort.value);
                }
                if (objPort.animated) port.setAnimated(objPort.animated);
                if (objPort.anim) {
                    if (!port.anim) port.anim = new CABLES.TL.Anim();

                    if (objPort.anim.loop) port.anim.loop = objPort.anim.loop;

                    for (var ani in objPort.anim.keys) {
                        // var o={t:objPort.anim.keys[ani].t,value:objPort.anim.keys[ani].v};
                        port.anim.keys.push(new CABLES.TL.Key(objPort.anim.keys[ani]));
                    }
                }
            }

            for (var ipo in obj.ops[iop].portsOut) {
                var port2 = op.getPort(obj.ops[iop].portsOut[ipo].name);
                if (port2 && port2.type != OP_PORT_TYPE_TEXTURE && obj.ops[iop].portsOut[ipo].hasOwnProperty('value')) {
                    port2.set(obj.ops[iop].portsOut[ipo].value);
                }
            }
        }

        var timeused=Math.round(100*(CABLES.now()-start))/100;
        // if(!this.silent && timeused>10)console.warn('long op init ',obj.ops[iop].objName,timeused);
        // else console.log('op time',obj.ops[iop].objName,timeused);
    }

    if(stopwatch)stopwatch.stop('onloaded valueset');

    for (var i in this.ops) {
        if (this.ops[i].onLoadedValueSet) {
            this.ops[i].onLoadedValueSet();
            this.ops[i].onLoadedValueSet = null;
        }
    }


    if(stopwatch)stopwatch.stop('create links');

    // create links...
    if(obj.ops)
    for (iop =0;iop< obj.ops.length;iop++) {
        if(obj.ops[iop].portsIn)
        for (var ipi2 =0;ipi2< obj.ops[iop].portsIn.length;ipi2++) {
            if(obj.ops[iop].portsIn[ipi2].links)
            for (var ili=0;ili< obj.ops[iop].portsIn[ipi2].links.length;ili++) {
                if (obj.ops[iop].portsIn[ipi2].links[ili])
                {
                    addLink(
                        obj.ops[iop].portsIn[ipi2].links[ili].objIn,
                        obj.ops[iop].portsIn[ipi2].links[ili].objOut,
                        obj.ops[iop].portsIn[ipi2].links[ili].portIn,
                        obj.ops[iop].portsIn[ipi2].links[ili].portOut);
                }
            }
        }
    }

    if(stopwatch)stopwatch.stop('onloaded');

    for (var i in this.ops) {
        if (this.ops[i].onLoaded) {
            this.ops[i].onLoaded();
            this.ops[i].onLoaded = null;
        }
    }

    if(stopwatch)stopwatch.stop('finished');


    this.loading.finished(loadingId);

    if (this.onLoadEnd) this.onLoadEnd();
};

CABLES.Patch.prototype.profile = function(enable) {
    this.profiler = new CABLES.Profiler();
    for (var i in this.ops) {
        this.ops[i].profile(enable);
    }

};




// ----------------------

/**
 * @name Variable
 * @param {String} name
 * @param {String|Number} value
 * @memberof CABLES.Patch
 * @constructor
 * @class
 */
CABLES.Patch.Variable = function(name, val) {
    this._name = name;
    this._changeListeners = [];
    this.setValue(val);
};

/**
 * @name CABLES.Patch.Variable#getValue
 * @returns {String|Number|Boolean} 
 * @function
 */
CABLES.Patch.Variable.prototype.getValue = function() {
    return this._v;
};

/**
 * @name CABLES.Patch.Variable#getName
 * @returns {String|Number|Boolean} 
 * @function
 */
CABLES.Patch.Variable.prototype.getName = function() {
    return this._name;
};

/**
 * @name CABLES.Patch.Variable#setValue
 * @returns {String|Number|Boolean} 
 * @function
 */
CABLES.Patch.Variable.prototype.setValue = function(v) {
    this._v = v;
    for (var i = 0; i < this._changeListeners.length; i++) {
        this._changeListeners[i](v);
    }
};

/**
 * function will be called when value of variable is changed
 * @name CABLES.Patch.Variable#addListener
 * @param {Function} callback
 * @function
 */
CABLES.Patch.Variable.prototype.addListener = function(cb) {
    this._changeListeners.push(cb);
};

/**
 * remove listener
 * @name CABLES.Patch.Variable#removeListener
 * @param {Function} callback
 * @function
 */
CABLES.Patch.Variable.prototype.removeListener = function(cb) {
    var ind = this._changeListeners.indexOf(cb);
    this._changeListeners.splice(ind, 1);
};

// ------------------

CABLES.Patch.prototype.addVariableListener = function(cb) {
    this._variableListeners.push(cb);
};

CABLES.Patch.prototype._callVariableListener = function(cb) {
    for (var i = 0; i < this._variableListeners.length; i++) {
        this._variableListeners[i]();
    }
};

CABLES.Patch.prototype.setVarValue = function(name, val) {
    if (this._variables.hasOwnProperty(name)) {
        this._variables[name].setValue(val);
    } else {
        this._variables[name] = new CABLES.Patch.Variable(name, val);
        this._callVariableListener();
    }
    return this._variables[name];
};

CABLES.Patch.prototype.getVarValue = function(name, val) {
    if (this._variables.hasOwnProperty(name))
        return this._variables[name].getValue();
};

/**
 * @name CABLES.Patch#getVar
 * @param {String} name
 * @return {CABLES.Patch.Variable} variable
 * @function
 */
CABLES.Patch.prototype.getVar = function(name) {
    if (this._variables.hasOwnProperty(name))
        return this._variables[name];
};

/**
 * @name CABLES.Patch#getVars
 * @return {Array<CABLES.Patch.Variable>} variables
 * @function
 */
CABLES.Patch.prototype.getVars = function() {
    return this._variables;
};

