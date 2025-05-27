/** @namespace WEBAUDIO */

import { CONSTANTS, Patch } from "cables";

/**
 * Part of the Web Audio API, the AudioBuffer interface represents a short audio asset residing in memory.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer}
 */

/**
 * Part of the Web Audio API, the AudioNode interface is a generic interface for representing an audio processing module.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioNode}
 */

/**
 * The AudioContext interface represents an audio-processing graph built from audio modules linked together
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AudioContext}
 */

export class WebAudio
{

    constructor()
    {
        this.toneJsInitialized = "bla";
    }

    /**
     * Checks if a global audio context has been created and creates
     * it if necessary. This audio context can be used for native Web Audio as well as Tone.js ops.
     * Associates the audio context with Tone.js if it is being used
     * @param {Op} op - The operator which needs the Audio Context
     */
    createAudioContext(op)
    {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        if (window.AudioContext)
        {
            if (!window.audioContext)
            {
                window.audioContext = new AudioContext();
            }
            // check if tone.js lib is being used
            if (window.Tone && !this.toneJsInitialized)
            {
                // set current audio context in tone.js
                Tone.setContext(window.audioContext);
                this.toneJsInitialized = true;
            }
        }
        else
        {
            if (op.patch.config.onError)op.logError("NO_WEBAUDIO", "Web Audio is not supported in this browser.");
            return;
        }
        return window.audioContext;
    }

    /**
     * Returns the audio context.
     * Before `createAudioContext` must have been called at least once.
     * It most cases you should use `createAudioContext`, which just returns the audio context
     * when it has been created already.
     */
    getAudioContext()
    {
        return window.audioContext;
    }

    /**
     * Creates an audio in port for the op with name `portName`
     * When disconnected it will disconnect the previous connected audio node
     * from the op's audio node.
     * @param {Op} op - The operator to create the audio port in
     * @param {string} portName - The name of the port
     * @param {AudioNode} audioNode - The audionode incoming connections should connect to
     * @param {number} [inputChannelIndex=0] - If the audio node has multiple inputs, this is the index of the input channel to connect to
     * @returns {Port|undefined} - The newly created audio in port or `undefined` if there was an error
     */
    createAudioInPort(op, portName, audioNode, inputChannelIndex)
    {
        if (!op || !portName || !audioNode)
        {
            const msg = "ERROR: createAudioInPort needs three parameters, op, portName and audioNode";
            op.log(msg);
            throw new Error(msg);
            // return;
        }
        if (!inputChannelIndex)
        {
            inputChannelIndex = 0;
        }
        op.webAudio = op.webAudio || {};
        op.webAudio.audioInPorts = op.webAudio.audioInPorts || [];
        const port = op.inObject(portName);
        port.webAudio = {};
        port.webAudio.previousAudioInNode = null;
        port.webAudio.audioNode = audioNode;

        op.webAudio.audioInPorts[portName] = port;

        port.onChange = function ()
        {
            const audioInNode = port.get();
            // when port disconnected, disconnect audio nodes
            if (!audioInNode)
            {
                if (port.webAudio.previousAudioInNode)
                {
                    try
                    {
                        if (port.webAudio.previousAudioInNode.disconnect) port.webAudio.previousAudioInNode.disconnect(port.webAudio.audioNode, 0, inputChannelIndex);
                        op.setUiError("audioCtx", null);
                    }
                    catch (e)
                    {
                        try
                        {
                            port.webAudio.previousAudioInNode.disconnect(port.webAudio.audioNode);
                        }
                        catch (er)
                        {
                            op.log(
                                "Disconnecting audio node with in/out port index, as well as without in/out-port-index did not work ",
                                e,
                            );
                            if (e.printStackTrace)
                            {
                                e.printStackTrace();
                            }
                            throw e;
                        }
                    }
                }
            }
            else
            {
                try
                {
                    if (audioInNode.connect)
                    {
                        audioInNode.connect(port.webAudio.audioNode, 0, inputChannelIndex);
                        op.setUiError("audioCtx", null);
                    }
                    else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
                }
                catch (e)
                {
                    op.log("Error: Failed to connect web audio node!", e);
                    op.log("port.webAudio.audioNode", port.webAudio.audioNode);
                    op.log("audioInNode: ", audioInNode);
                    op.log("inputChannelIndex:", inputChannelIndex);
                    op.log("audioInNode.connect: ", audioInNode.connect);
                    throw e;
                }
            }
            port.webAudio.previousAudioInNode = audioInNode;
        };
        // TODO: Maybe add subtype to audio-node-object?
        return port;
    }

    /**
     * Sometimes it is necessary to replace a node of a port, if so all
     * connections to this node must be disconnected and connections to the new
     * node must be made.
     * Can be used for both Audio ports as well as AudioParam ports
     * if used with an AudioParam pass e.g. `synth.frequency` as newNode
     * @param {Port} port - The port where the audio node needs to be replaced
     * @param oldNode
     * @param newNode
     */
    replaceNodeInPort(port, oldNode, newNode)
    {
        const connectedNode = port.webAudio.previousAudioInNode;
        // check if connected
        if (connectedNode && connectedNode.disconnect)
        {
            try
            {
                connectedNode.disconnect(oldNode);
            }
            catch (e)
            {
                if (e.printStackTrace)
                {
                    e.printStackTrace();
                }
                throw new Error("replaceNodeInPort: Could not disconnect old audio node. " + e.name + " " + e.message);
            }
            port.webAudio.audioNode = newNode;
            try
            {
                connectedNode.connect(newNode);
            }
            catch (e)
            {
                if (e.printStackTrace)
                {
                    e.printStackTrace();
                }
                throw new Error("replaceNodeInPort: Could not connect to new node. " + e.name + " " + e.message);
            }
        }
    }

    /**
     * Creates an audio out port which takes care of (dis-)connecting on it’s own
     * @param {Op} op - The op to create an audio out port for
     * @param {string} portName - The name of the port to be created
     * @param {AudioNode} audioNode - The audio node to link to the port
     * @returns {(CABLES.Port|undefined)} - The newly created audio out port or `undefined` if there was an error
     */
    createAudioOutPort(op, portName, audioNode)
    {
        if (!op || !portName || !audioNode)
        {
            const msg = "ERROR: createAudioOutPort needs three parameters, op, portName and audioNode";
            op.log(msg);
            throw new Error(msg);
        }

        const port = op.outObject(portName);
        // TODO: Maybe add subtype to audio-node-object?
        port.set(audioNode);
        return port;
    }

    /**
     * Creates an audio param in port for the op with name portName.
     * The port accepts other audio nodes as signals as well as values (numbers)
     * When the port is disconnected it will disconnect the previous connected audio node
     * from the op's audio node and restore the number value set before.
     * @param {Op} op - The operator to create an audio param input port for
     * @param {string} portName - The name of the port to create
     * @param audioNode
     * @param options
     * @param defaultValue
     * @returns {(CABLES.Port|undefined)} - The newly created port, which takes care of (dis-)connecting on its own, or `undefined` if there was an error
     */
    createAudioParamInPort(op, portName, audioNode, options, defaultValue)
    {
        if (!op || !portName || !audioNode)
        {
            op.log("ERROR: createAudioParamInPort needs three parameters, op, portName and audioNode");
            if (op && op.name) op.log("opname: ", op.name);
            op.log("portName", portName);
            op.log("audioNode: ", audioNode);
            return;
        }
        op.webAudio = op.webAudio || {};
        op.webAudio.audioInPorts = op.webAudio.audioInPorts || [];
        // var port = op.inObject(portName);
        const port = op.inDynamic(
            portName,
            [CONSTANTS.OP.OP_PORT_TYPE_VALUE, CONSTANTS.OP.OP_PORT_TYPE_OBJECT],
            options,
            defaultValue,
        );
        port.webAudio = {};
        port.webAudio.previousAudioInNode = null;
        port.webAudio.audioNode = audioNode;

        op.webAudio.audioInPorts[portName] = port;

        /*
         * port.onLinkChanged = function() {
         *   op.log("onLinkChanged");
         *   if(port.isLinked()) {
         *
         *       if(port.links[0].portOut.type === CABLES.CONSTANTS.OP.OP_PORT_TYPE_) { // value
         *
         *       } else if(port.links[0].portOut.type === CABLES.CONSTANTS.OP.OP_PORT_TYPE_OBJECT) { // object
         *
         *       }
         *   } else { // unlinked
         *
         *   }
         * };
         */

        port.onChange = function ()
        {
            const audioInNode = port.get();
            const node = port.webAudio.audioNode;
            const audioCtx = WEBAUDIO.getAudioContext();

            if (audioInNode != undefined)
            {
                if (typeof audioInNode === "object" && audioInNode.connect)
                {
                    try
                    {
                        audioInNode.connect(node);
                    }
                    catch (e)
                    {
                        op.log("Could not connect audio node: ", e);
                        if (e.printStackTrace)
                        {
                            e.printStackTrace();
                        }
                        throw e;
                    }
                    port.webAudio.previousAudioInNode = audioInNode;
                }
                else
                {
                    // tone.js audio param
                    if (node._param && node._param.minValue && node._param.maxValue)
                    {
                        if (audioInNode >= node._param.minValue && audioInNode <= node._param.maxValue)
                        {
                            try
                            {
                                if (node.setValueAtTime)
                                {
                                    node.setValueAtTime(audioInNode, audioCtx.currentTime);
                                }
                                else
                                {
                                    node.value = audioInNode;
                                }
                            }
                            catch (e)
                            {
                                op.log("Possible AudioParam problem with tone.js op: ", e);
                                if (e.printStackTrace)
                                {
                                    e.printStackTrace();
                                }
                                throw e;
                            }
                        }
                        else
                        {
                            op.log("Warning: The value for an audio parameter is out of range!");
                        }
                    } // native Web Audio param
                    else if (node.minValue && node.maxValue)
                    {
                        if (audioInNode >= node.minValue && audioInNode <= node.maxValue)
                        {
                            try
                            {
                                if (node.setValueAtTime)
                                {
                                    node.setValueAtTime(audioInNode, audioCtx.currentTime);
                                }
                                else
                                {
                                    node.value = audioInNode;
                                }
                            }
                            catch (e)
                            {
                                op.log(
                                    "AudioParam has minValue / maxValue defined, and value is in range, but setting the value failed! ",
                                    e,
                                );
                                if (e.printStackTrace)
                                {
                                    e.printStackTrace();
                                }
                                throw e;
                            }
                        }
                        else
                        {
                            op.log("Warning: The value for an audio parameter is out of range!");
                        }
                    } // no min-max values, try anyway
                    else
                    {
                        try
                        {
                            if (node.setValueAtTime)
                            {
                                node.setValueAtTime(audioInNode, audioCtx.currentTime);
                            }
                            else
                            {
                                node.value = audioInNode;
                            }
                        }
                        catch (e)
                        {
                            op.log("Possible AudioParam problem (without minValue / maxValue): ", e);
                            if (e.printStackTrace)
                            {
                                e.printStackTrace();
                            }
                            throw e;
                        }
                    }

                    if (port.webAudio.previousAudioInNode && port.webAudio.previousAudioInNode.disconnect)
                    {
                        try
                        {
                            port.webAudio.previousAudioInNode.disconnect(node);
                        }
                        catch (e)
                        {
                            op.log("Could not disconnect previous audio node: ", e);
                            throw e;
                        }
                        port.webAudio.previousAudioInNode = undefined;
                    }
                }
            }
            else
            {
                // disconnected
                if (port.webAudio.previousAudioInNode)
                {
                }
            }
        };
        return port;
    }

    /**
     * Loads an audio file and updates the loading indicators when cables is run in the editor.
     * @param {Patch} patch - The cables patch, when called from inside an op this is `op.patch`
     * @param {string} url - The url of the audio file to load
     * @param {function} onFinished - The callback to be called when the loading is finished, passes the AudioBuffer
     * @param {function} onError - The callback when there was an error loading the file, the rror message is passed
     * @param loadingTask
     * @see {@link https://developer.mozilla.org/de/docs/Web/API/AudioContext/decodeAudioData}
     */
    loadAudioFile(patch, url, onFinished, onError, loadingTask)
    {
        const audioContext = WEBAUDIO.createAudioContext();

        if (!audioContext) onError(new Error("No Audiocontext"));

        let loadingId = null;
        if (loadingTask || loadingTask === undefined)
        {
            loadingId = patch.loading.start("audio", url);
            if (patch.isEditorMode()) gui.jobs().start({ "id": "loadaudio" + loadingId, "title": " loading audio (" + url + ")" });
        }
        const request = new XMLHttpRequest();

        if (!url) return;

        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = function ()
        {
            patch.loading.finished(loadingId);
            if (patch.isEditorMode()) gui.jobs().finish("loadaudio" + loadingId);

            audioContext.decodeAudioData(request.response, onFinished, onError).catch((e) =>
            {
                onError(e);
            });
        };
        request.send();
    }

    /**
     * Checks if the passed time is a valid time to be used in any of the Tone.js ops.
     * @param {(string|number)} t - The time to check
     * @returns {boolean} - True if time is valid, false if not
     */
    isValidToneTime(t)
    {
        try
        {
            const time = new Tone.Time(t);
        }
        catch (e)
        {
            return false;
        }
        return true;
    }

    /**
     * Checks if the passed note is a valid note to be used with Tone.js
     * @param {string} note - The note to be checked, e.g. `"C4"`
     * @returns {boolean} - True if the note is a valid note, false otherwise
     */
    isValidToneNote(note)
    {
        try
        {
            Tone.Frequency(note);
        }
        catch (e)
        {
            return false;
        }
        return true;
    }
}

const WEBAUDIO = new WebAudio();
console.log("HERE", WEBAUDIO);

window.CABLES = window.CABLES || {};
window.CABLES.WEBAUDIO = WEBAUDIO;

export { WEBAUDIO };
