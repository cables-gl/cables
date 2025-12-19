import { Events, Logger } from "cables-shared-client";
import * as utils from "./utils.js";
import { Anim } from "./anim.js";
import { Link } from "./core_link.js";
import { Port } from "./core_port.js";
import { Op } from "./core_op.js";
import { EMBED } from "./embedding.js";
import { Profiler } from "./core_profiler.js";
import { Patch } from "./core_patch.js";
import { LoadingStatus } from "./loadingstatus.js";
import { Variable } from "./sessionvar.js";
import { Timer, now, internalNow } from "./timer.js";
import { CONSTANTS } from "./constants.js";
import { AnimKey } from "./anim_key.js";
import { RenderLoop } from "./renderloop.js";

import { PatchVariable } from "./core_variable.js";

CABLES = CABLES || {};
CABLES = {
    ...CABLES,
    ...CONSTANTS.PORT,
    ...CONSTANTS.PACO,
    ...CONSTANTS.ANIM,
    ...CONSTANTS.OP
};

CABLES.EMBED = EMBED;
CABLES.Link = Link;
CABLES.Port = Port;
CABLES.Op = Op;
CABLES.Profiler = Profiler;
CABLES.Patch = Patch;
CABLES.Timer = Timer;
CABLES.LoadingStatus = LoadingStatus;
CABLES.now = now;
CABLES.internalNow = internalNow;
CABLES.Anim = Anim;
CABLES.AnimKey = AnimKey;
CABLES.RenderLoop = RenderLoop;

CABLES.shortId = utils.shortId;
CABLES.uuid = utils.uuid;
CABLES.getShortOpName = utils.getShortOpName;
CABLES.simpleId = utils.simpleId;
CABLES.clamp = utils.clamp;
CABLES.map = utils.map;
CABLES.generateUUID = utils.generateUUID;
CABLES.prefixedHash = utils.prefixedHash;
CABLES.smoothStep = utils.smoothStep;
CABLES.smootherStep = utils.smootherStep;
CABLES.copyArray = utils.copyArray;
CABLES.basename = utils.basename;
CABLES.logStack = utils.logStack;
CABLES.filename = utils.filename;

/* minimalcore:start */
CABLES.ajax = utils.ajax;
CABLES.cacheBust = utils.cacheBust;
CABLES.shuffleArray = utils.shuffleArray;
CABLES.Variable = Variable;

/* minimalcore:end */

CABLES.logErrorConsole = utils.logErrorConsole;
CABLES.isNumeric = utils.isNumeric;
CABLES.uniqueArray = utils.uniqueArray;

/** @type {Array<Op>} */
CABLES.OPS = [];
CABLES.utils = utils;
CABLES.CONSTANTS = CONSTANTS;

CABLES.SHARED = {};
CABLES.SHARED.Events = Events;
CABLES.SHARED.Logger = Logger;

export default CABLES;
export { Anim, AnimKey, CONSTANTS, Link, Op, Patch, Port, Profiler, PatchVariable, EMBED, LoadingStatus, Timer, utils, now, RenderLoop };

if (!(function () { return !this; }())) console.warn("not in strict mode: index core"); // eslint-disable-line
