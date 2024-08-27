// const nbind = require('nbind');
// const binding = nbind.init(__dirname);
// const lib = binding.lib;

const lib = require("bindings")("abletonlink");

lib.AbletonLink.prototype.startUpdate = function(interval_ms, callback) {
    this.update();
    if(callback) {
        this.timer = setInterval(() => {
            this.update();
            callback(this.beat, this.phase, this.bpm, this.isPlayingOnUpdate, this.numPeers);
        }, interval_ms);
        callback(this.beat, this.phase, this.bpm, this.isPlayingOnUpdate, this.numPeers);
    } else {
        this.timer = setInterval(() => {
            this.update();
        }, interval_ms);
    }
};

lib.AbletonLink.prototype.stopUpdate = function() {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
}

lib.AbletonLinkAudio.prototype.startUpdate = function(interval_ms, callback) {
    this.update();
    if(callback) {
        this.timer = setInterval(() => {
            this.update();
            callback(this.beat, this.phase, this.bpm, this.isPlayingOnUpdate, this.numPeers);
        }, interval_ms);
        callback(this.beat, this.phase, this.bpm, this.isPlayingOnUpdate, this.numPeers);
    } else {
        this.timer = setInterval(() => {
            this.update();
        }, interval_ms);
    }
};

lib.AbletonLinkAudio.prototype.stopUpdate = function() {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
}

lib.AbletonLink.Audio = lib.AbletonLinkAudio;
module.exports = lib.AbletonLink;
