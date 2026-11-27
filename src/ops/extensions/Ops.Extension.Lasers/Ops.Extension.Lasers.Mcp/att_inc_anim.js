// animated ports: keyframes and easings

const EASING_NAME_CLIP = "Clip";
const easingConverter = new CABLES.Anim();

// finds an animatable port (number input) of an op in the patch, returns { port } or { error }
function getAnimatablePort(opId, portName)
{
    const targetOp = CABLES.patch.getOpById(opId);
    if (!targetOp) return { "error": "no op found with id " + opId };

    const port = targetOp.getPort(portName);
    if (!port) return { "error": "no port named \"" + portName + "\" on op " + opId };
    if (port.direction !== CABLES.Port.DIR_IN || port.type !== CABLES.Port.TYPE_VALUE) return { "error": "port \"" + portName + "\" on op " + opId + " is not a number input port, only those can be animated" };

    return { "port": port };
}

// easing names as shown in the timeline, the anim easing constants are not in the order of Anim.EASINGNAMES.
// clip easing is left out, it needs a clip anim to work
function easingNames()
{
    return CABLES.Anim.EASINGNAMES.filter((n) => n != EASING_NAME_CLIP);
}

function easingByName(name)
{
    const names = easingNames();
    for (let i = 0; i < names.length; i++)
        if (names[i].toLowerCase() == String(name).toLowerCase()) return easingConverter.easingFromString(names[i]);
    return null;
}

function easingName(easing)
{
    const names = easingNames();
    for (let i = 0; i < names.length; i++)
        if (easingConverter.easingFromString(names[i]) === easing) return names[i];
    return String(easing);
}

function portAnimState(port)
{
    return { "animated": port.isAnimated(), "anim": port.anim ? port.anim.getSerialized() : null };
}

function applyPortAnimState(opId, portName, state)
{
    const o = CABLES.patch.getOpById(opId);
    if (!o) return;
    const p = o.getPort(portName);
    if (!p) return;

    p.setAnimated(state.animated);
    if (state.animated && state.anim)
    {
        p.anim.deserialize(state.anim, true);
        p.anim.loop = state.anim.loop || CABLES.Anim.LOOP_OFF;
        p.anim.emitEvent(CABLES.Anim.EVENT_CHANGE, p.anim);
    }
    o.patch.emitEvent(CABLES.Port.EVENT_ANIM_UPDATED, o, p, p.anim);
    gui.savedState.setUnSaved("mcpAnim", o.getSubPatch());
    if (gui.patchView.isCurrentOp(o)) o.refreshParams();
}

// runs change(port) and registers one undo step that restores the animation state of the port from before
function changePortAnimUndoable(opId, portName, title, change)
{
    const port = CABLES.patch.getOpById(opId).getPort(portName);
    const oldState = portAnimState(port);

    change(port);
    if (port.anim) port.anim.emitEvent(CABLES.Anim.EVENT_CHANGE, port.anim);
    applyPortAnimState(opId, portName, portAnimState(port));

    const newState = portAnimState(port);
    CABLES.UI.undo.add(
    {
        "title": title,
        "context": { "portname": portName },
        "undo": () => { applyPortAnimState(opId, portName, oldState); },
        "redo": () => { applyPortAnimState(opId, portName, newState); }
    });
}

function portAnimInfo(port)
{
    const anim = port.anim;
    const time = CABLES.patch.timer.getTime();
    const info = { "animated": port.isAnimated(), "time": round3(time), "value": port.get() };
    if (!anim) return info;

    info.loop = ["off", "repeat", "mirror", "offset"][anim.getLoop()] || anim.getLoop();
    info.length = anim.keys.length ? round3(anim.lastKey.time) : 0;
    info.valueAtTime = anim.keys.length ? anim.getValue(time) : null;
    info.keys = [];
    for (let i = 0; i < anim.keys.length; i++)
        info.keys.push({ "time": round3(anim.keys[i].time), "value": anim.keys[i].value, "easing": easingName(anim.keys[i].getEasing()) });
    return info;
}

function round3(v)
{
    return Math.round(v * 1000) / 1000;
}

// registers the tools of this file, called by buildMcpServer
function registerAnimTools(server)
{
    server.tool(
        "timeline",
        "control the timeline: play (true plays, false pauses) and time (jump to a time in seconds). viewStart/viewLength scroll/zoom the timeline panel so it shows viewLength seconds starting at viewStart (animated, the reported view is from before the change). without arguments it only reports the current time, whether it is playing and, if the timeline panel is open, its view. animated ports and Ops.TimeLine.* ops follow this time.", { "play": z.boolean().optional().describe("true plays, false pauses"), "time": z.number().optional().describe("jump to this time in seconds"), "viewStart": z.number().optional().describe("timeline panel: first visible second"), "viewLength": z.number().optional().describe("timeline panel: number of visible seconds") },
        ({ play, time, viewStart, viewLength }) =>
        {
            const timer = CABLES.patch.timer;
            logMcp("timeline" + (play !== undefined ? (play ? " play" : " pause") : "") + (time !== undefined ? " time " + time : ""));

            if (time !== undefined) timer.setTime(time);
            if (play === true) timer.play();
            if (play === false) timer.pause();

            const result = { "time": round3(timer.getTime()), "playing": timer.isPlaying() };
            const glTimeline = gui.glTimeline;
            if (glTimeline)
            {
                result.view = { "start": round3(glTimeline.view.timeLeft), "length": round3(glTimeline.view.visibleTime), "saved": glTimeline.savePatchData().view };
                if (viewLength !== undefined) glTimeline.view.setZoomLength(viewLength);
                if (viewStart !== undefined) glTimeline.view.scrollTo(viewStart);
            }
            else if (viewStart !== undefined || viewLength !== undefined) return respondError("timeline is not open, run the command \"Show timeline\" first");

            return respondText(JSON.stringify(result));
        }
    );

    server.tool(
        "set-port-animated",
        "make a number input port animated (keyframed by the timeline) or not animated anymore. a newly animated port gets a first keyframe with its current value at the current timeline time. undoable. the same way Ops.TimeLine.Anim has an animated \"Value\" port whose anim can be reused by linking its \"Anim\" output to several Ops.TimeLine.AnimGetValue ops.", { "opId": param.opId(), "portName": param.portName(), "animated": z.boolean().describe("true makes it animated, false removes the animation") },
        ({ opId, portName, animated }) =>
        {
            logMcp((animated ? "animate " : "unanimate ") + opLabel(opId) + "." + portName);

            const found = getAnimatablePort(opId, portName);
            if (found.error) return respondError(found.error);

            if (found.port.isAnimated() != animated)
                changePortAnimUndoable(opId, portName, (animated ? "Animate " : "Unanimate ") + portName, (port) => { port.setAnimated(animated); });

            return respondText(JSON.stringify(portAnimInfo(found.port)));
        }
    );

    server.tool(
        "get-anim",
        "get the animation of a port: whether it is animated, its keyframes (time in seconds, value, easing), loop mode, length (time of the last keyframe), the current timeline time and the value at that time.", { "opId": param.opId(), "portName": param.portName() },
        ({ opId, portName }) =>
        {
            logMcp("get anim " + opLabel(opId) + "." + portName);

            const found = getAnimatablePort(opId, portName);
            if (found.error) return respondError(found.error);

            return respondText(JSON.stringify(portAnimInfo(found.port)));
        }
    );

    server.tool(
        "set-keyframes",
        "add or change keyframes of a number input port, the port is made animated if it is not yet. keys is a list of { time (seconds), value, easing (optional) }, a key at an existing time replaces it. easing is the curve from this key to the next one, one of: " + easingNames().join(", ") + " (default linear). clear=true removes all existing keys first. loop sets the loop mode after the last key: off, repeat, mirror or offset. undoable as one step.",
        {
            "opId": param.opId(),
            "portName": param.portName(),
            "keys": z.array(z.object({ "time": z.number().describe("time in seconds"), "value": z.number(), "easing": z.string().optional().describe("curve to the next key, default linear") })).describe("keyframes, e.g. [{ \"time\": 0, \"value\": 0 }, { \"time\": 2, \"value\": 1 }]"),
            "clear": z.boolean().optional().describe("remove all existing keys first"),
            "loop": z.enum(["off", "repeat", "mirror", "offset"]).optional().describe("what happens after the last key")
        },
        ({ opId, portName, keys, clear, loop }) =>
        {
            logMcp("set " + keys.length + " keyframes " + opLabel(opId) + "." + portName);

            const found = getAnimatablePort(opId, portName);
            if (found.error) return respondError(found.error);
            if (clear && keys.length == 0) return respondError("clear needs at least one key, use set-port-animated to remove the animation");

            for (let i = 0; i < keys.length; i++)
                if (keys[i].easing !== undefined && easingByName(keys[i].easing) === null) return respondError("unknown easing \"" + keys[i].easing + "\", use one of: " + easingNames().join(", "));

            changePortAnimUndoable(opId, portName, "Keyframes " + portName, (port) =>
            {
                if (!port.isAnimated()) port.setAnimated(true);
                if (clear) port.anim.clear();

                for (let i = 0; i < keys.length; i++)
                {
                    const key = port.anim.setValue(keys[i].time, keys[i].value);
                    if (keys[i].easing !== undefined) key.setEasing(easingByName(keys[i].easing));
                }
                port.anim.sortKeys();

                if (loop !== undefined) port.anim.setLoop(["off", "repeat", "mirror", "offset"].indexOf(loop));
            });

            return respondText(JSON.stringify(portAnimInfo(found.port)));
        }
    );

    server.tool(
        "delete-keyframes",
        "delete keyframes of an animated port by their times in seconds (see get-anim). an animation needs at least one key, to remove the whole animation use set-port-animated with animated=false. undoable as one step.", { "opId": param.opId(), "portName": param.portName(), "times": z.array(z.number()).describe("times in seconds of the keys to delete, as listed by get-anim") },
        ({ opId, portName, times }) =>
        {
            logMcp("delete " + times.length + " keyframes " + opLabel(opId) + "." + portName);

            const found = getAnimatablePort(opId, portName);
            if (found.error) return respondError(found.error);
            if (!found.port.isAnimated()) return respondError("port \"" + portName + "\" on op " + opId + " is not animated");

            const anim = found.port.anim;
            const toDelete = [];
            const notFound = [];
            for (let i = 0; i < times.length; i++)
            {
                const key = anim.keys.find((k) => Math.abs(k.time - times[i]) < KEYFRAME_TIME_TOLERANCE);
                if (key) toDelete.push(key);
                else notFound.push(times[i]);
            }

            if (notFound.length) return respondError("no keyframe at time " + notFound.join(", ") + ", nothing deleted");
            if (toDelete.length >= anim.keys.length) return respondError("that would delete all keyframes, use set-port-animated with animated=false to remove the animation");

            changePortAnimUndoable(opId, portName, "Delete keyframes " + portName, (port) =>
            {
                for (let i = 0; i < toDelete.length; i++) port.anim.remove(toDelete[i]);
            });

            return respondText(JSON.stringify(portAnimInfo(found.port)));
        }
    );
}
