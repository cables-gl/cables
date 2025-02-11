import * as utils from "./utils.js";
import Anim from "./anim.js";
import { Link } from "./core_link.js";
import { Port } from "./core_port.js";
import { Op } from "./core_op.js";
import { EMBED } from "./embedding.js";
import { Profiler } from "./core_profiler.js";
import Patch from "./core_patch.js";
import { LoadingStatus } from "./loadingstatus.js";
import { WEBAUDIO } from "./webaudio.js";
import { Variable } from "./sessionvar.js";
import { Timer, now, internalNow } from "./timer.js";
import { CONSTANTS } from "./constants.js";
import { CGP } from "./cgp/index.js";
import { CG } from "./cg/cg_constants.js";
import { CGL } from "./cgl/index.js";
import AnimKey from "./anim_key.js";
import { CGState } from "./cg/cg_state.js";

window.CABLES = window.CABLES || {};

CABLES.CGL = CGL;
CABLES.CG = CG;
CABLES.CGP = CGP;
CABLES.EMBED = EMBED;
CABLES.Link = Link;
CABLES.Port = Port;
CABLES.Op = Op;
CABLES.Profiler = Profiler;
CABLES.Patch = Patch;
CABLES.Timer = Timer;
CABLES.WEBAUDIO = WEBAUDIO;
CABLES.Variable = Variable;
CABLES.LoadingStatus = LoadingStatus;
CABLES.now = now;
CABLES.internalNow = internalNow;
CABLES.Anim = Anim;
CABLES.AnimKey = AnimKey;

CABLES.shortId = utils.shortId;
CABLES.uuid = utils.uuid;
CABLES.getShortOpName = utils.getShortOpName;
CABLES.simpleId = utils.simpleId;
CABLES.clamp = utils.clamp;
CABLES.map = utils.map;
CABLES.shuffleArray = utils.shuffleArray;
CABLES.generateUUID = utils.generateUUID;
CABLES.prefixedHash = utils.prefixedHash;
CABLES.smoothStep = utils.smoothStep;
CABLES.smootherStep = utils.smootherStep;
CABLES.cacheBust = utils.cacheBust;
CABLES.copyArray = utils.copyArray;
CABLES.basename = utils.basename;
CABLES.logStack = utils.logStack;
CABLES.filename = utils.filename;
CABLES.ajaxSync = utils.ajaxSync;
CABLES.ajax = utils.ajax;
CABLES.request = utils.request;
CABLES.keyCodeToName = utils.keyCodeToName;
CABLES.logErrorConsole = utils.logErrorConsole;
CABLES.isNumeric = utils.isNumeric;
CABLES.isArray = utils.isArray;
CABLES.float32Concat = utils.float32Concat;
CABLES.uniqueArray = utils.uniqueArray;

CABLES.CGState = CGState;

CABLES = Object.assign(CABLES,
    CONSTANTS.PORT,
    CONSTANTS.PACO,
    CONSTANTS.ANIM,
    CONSTANTS.OP
);

// CABLES.map = utils.map;
export default CABLES;

if (!(function () { return !this; }())) console.warn("not in strict mode: index core"); // eslint-disable-line
