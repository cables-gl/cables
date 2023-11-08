import { CGL } from "./cgl"; // * if you remove this, the project wont build CGL properly.. wtf?
import * as base64 from "./base64";
import { EventTarget } from "./eventtarget";
import * as utils from "./utils";
import * as anim from "./anim";
import { Link } from "./core_link";
import { Port } from "./core_port";
import { Op } from "./core_op";
import { EMBED } from "./embedding";
import { Profiler } from "./core_profiler";
import Patch from "./core_patch";
import { Instancing } from "./instancing";
import { LoadingStatus } from "./loadingstatus";
import { WEBAUDIO } from "./webaudio";
import { Variable } from "./sessionvar";
import { Timer, now, internalNow } from "./timer";
import * as PatchConnections from "./patchConnection";
import { CONSTANTS } from "./constants";
import { BranchStack, Branch } from "./banchprofiler";
import { CGP } from "./cgp";
import { CG } from "./cg/cg_constants";

window.CABLES = window.CABLES || {};

CABLES.CG = CG;
CABLES.CGP = CGP;
CABLES.EventTarget = EventTarget;
CABLES.EMBED = EMBED;
CABLES.Link = Link;
CABLES.Port = Port;
CABLES.Op = Op;
CABLES.Profiler = Profiler;
CABLES.Patch = Patch;
CABLES.Instancing = Instancing;
CABLES.Timer = Timer;
CABLES.WEBAUDIO = WEBAUDIO;
CABLES.Variable = Variable;
CABLES.LoadingStatus = LoadingStatus;
CABLES.now = now;
CABLES.internalNow = internalNow;
CABLES.BranchStack = BranchStack;
CABLES.Branch = Branch;


CABLES = Object.assign(CABLES,
    base64,
    utils,
    anim,
    PatchConnections,
    CONSTANTS.PORT,
    CONSTANTS.PACO,
    CONSTANTS.ANIM,
    CONSTANTS.OP
);

export default CABLES;

if (!(function () { return !this; }())) console.warn("not in strict mode: index core"); // eslint-disable-line
