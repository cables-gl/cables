/*
	meSpeak-front	v.2.0.7
	based on speak.js, https://github.com/kripken/speak.js
	eSpeak and other code here are under the GNU GPL.
	meSpeak (Modular eSpeak) is a mod of 'speak.js' by N.Landsteiner (2011-2020), www.masswerk.at
	official project page: https://www.masswerk.at/mespeak
*/
var meSpeak=(function(){"use strict";var coreName='mespeak-core.js',eSpeakDir='/espeak',unloading=false,speakQueue=[],deferredLoaders=[],voicesLoaded={},workerCallbacks={},defaultVoice='',AudioAPI=null,canPlay=false,playbackVolume=1,audioPool={},webSoundPool={},audioContext=null,masterOutput=null,masterGain=null,audioAnalyser=null,wsUseTimeout=false,wsStartFromCallback=false,isMobile=(typeof navigator!=='undefined'&&navigator.userAgent&&(/(Mobile|iPhone|iPad|iPod|Android|iOS)/i).test(navigator.userAgent)),isSafari=(typeof navigator!=='undefined'&&navigator.userAgent&&(/Safari/).test(navigator.userAgent)),hasWorker=(!isMobile&&typeof window!=='undefined'&&typeof window.Worker!=='undefined'),audioUnlocked=false,coreReady=false,baseUrl,worker;if(typeof navigator!=='undefined'&&navigator.userAgent){if(navigator.userAgent.indexOf('Chrome')!==-1){if(parseInt(navigator.userAgent.replace(/^.*?\bChrome\/([0-9]+).*$/,'$1'),10)>=32){wsUseTimeout=wsStartFromCallback=true;}}
else if(navigator.userAgent.match(/\bVersion\/[0-9]+\.[0-9\.]+ (Mobile\/\w+ )?Safari\//)){if(parseInt(navigator.userAgent.replace(/^.*?\bVersion\/([0-9]+).*$/,'$1'),10)>=9){wsStartFromCallback=true;}}}
function loadCore(){if(!baseUrl){if(document.currentScript){baseUrl=document.currentScript.src.replace(/[^\/]+$/,'');}
else{var scripts=document.getElementsByTagName('script');baseUrl=scripts[scripts.length-1].src.replace(/[^\/]+$/,'');}}
if(baseUrl){if(hasWorker){worker=new Worker(baseUrl+coreName);worker.onmessage=coreReceiver;}
else{var nodes=document.getElementsByTagName('head');if(!nodes||!nodes.length)nodes=document.getElementsByTagName('head');if(nodes&&nodes.length){var script=document.createElement('script');script.src=baseUrl+coreName;script.onload=coreLoaded;nodes[0].appendChild(script);}}
return true;}
else{if(self.console)console.error('MeSpeak: Failed to determine current script path.');return false;}}
function coreReceiver(event){var msgType=event.data.rsp,jobId=event.data.jobId;switch(msgType){case'ready':try{var t=new ArrayBuffer(1);worker.postMessage({'job':'test','jobId':0,'test':t},[t]);if(!t.byteLength)worker.postMessage({'job':'useTransferables','jobId':0,'args':true});}
catch(e){}
coreLoaded();break;case'configLoaded':if(workerCallbacks[jobId])workerCallbacks[jobId](event.data.success,event.data.message);break;case'voiceLoaded':if(workerCallbacks[jobId])workerCallbacks[jobId](event.data.success,event.data.message);break;case'wav':if(workerCallbacks[jobId])workerCallbacks[jobId](event.data.audiodata);break;}
if(workerCallbacks[jobId])delete workerCallbacks[jobId];}
function sendWorkerJob(obj,jobId,callback){if(typeof callback==='function'){if(!jobId)jobId=getJobId();workerCallbacks[String(jobId)]=callback;}
else{jobId=0;}
if(typeof obj.jobId==='undefined')obj.jobId=String(jobId);worker.postMessage(obj);}
function coreLoaded(){coreReady=true;for(var i=0,l=deferredLoaders.length;i<l;i++){var loader=deferredLoaders[i];loader.job.apply(null,loader.args);}
deferredLoaders.length=0;}
function executeQueuedCalls(){if(defaultVoice){for(var i=0,l=speakQueue.length;i<l;i++){var args=speakQueue[i];if(args[4]){speakMultipart(args[0],args[1],args[2],args[3]);}
else{speak(args[0],args[1],args[2],args[3]);}}
speakQueue.length=0;}}
function resetQueue(){speakQueue.length=0;}
function speak(text,args,callback,id){if(typeof args!=='object'||!args)args={};if(!canPlay&&!args.rawdata){if(self.console)console.warn('meSpeak: Can\'t play; No audio support.');return 0;}
if(!id)id=getJobId();if(!coreReady||!defaultVoice){if(self.console)console.log('No voice module loaded, deferring call.');if(args.rawdata){return id;}
else{speakQueue.push([text,args,callback,id,false]);return id;}}
if(args&&args.voice&&!voicesLoaded[args.voice]){if(self.console)console.log('Voice '+args.voice+' not available. Using default voice: '+defaultVoice);args.voice=defaultVoice;}
var varg=(args.voice)?String(args.voice):(args.v)?String(args.v):defaultVoice;if(varg.indexOf('mb/mb-')==0)varg=varg.substring(3);if(args.variant)varg+='+'+String(args.variant).replace(/\+/g,'');var argstack=['-w','wav.wav','-a',(typeof args.amplitude!=='undefined')?String(args.amplitude):(typeof args.a!=='undefined')?String(args.a):'100','-g',(typeof args.wordgap!=='undefined')?String(args.wordgap):(typeof args.g!=='undefined')?String(args.g):'0','-p',(typeof args.pitch!=='undefined')?String(args.pitch):(typeof args.p!=='undefined')?String(args.p):'50','-s',(typeof args.speed!=='undefined')?String(args.speed):(typeof args.s!=='undefined')?String(args.s):'175','-b',args.utf16?'4':(typeof args.b!=='undefined')?String(args.b):'1','-v',varg];var a=args.linebreak||args.l;if(a)argstack.push('-l',String(a));a=args.capitals||args.k;if(a)argstack.push('-k',String(a));a=args.nostop||args.z;if(a)argstack.push('-z');if(typeof args.punct!=='undefined'){if(typeof args.punct==='string'){if(args.punct.length){argstack.push('--punct="'+String(args.punct).replace(/([\\"'])/g,'\\$1')+'"');}
else{argstack.push('--punct');}}
else if(args.punct){argstack.push('--punct');}}
a=args.ssml||args.m||args.markup;if(a)argstack.push('-m');argstack.push('--path='+eSpeakDir,String(text));if(args.log&&self.console)console.log('executing espeak '+argstack.join(' '));if(typeof callback!=='function')callback=null;if(!callback&&typeof args.callback=='function')callback=args.callback;if(!args.rawdata&&AudioAPI){if(!audioContext)audioContext=new AudioAPI();if(audioContext.state==='suspended')audioContext.resume();}
if(hasWorker){sendWorkerJob({'job':'speak','args':argstack},id,function(stream){resolveUtterance(stream,id,args.rawdata,args.volume,args.pan||0,callback);});}
else{resolveUtterance(meSpeakCore.speak(argstack),id,args.rawdata,args.volume,args.pan||0,callback);}
return id;}
function resolveUtterance(stream,id,rawdata,volume,pan,callback){if(stream){if(rawdata){if(callback)callback(true,id,exportStream(stream,rawdata));}
else{playSound(stream,volume,callback,id,pan);}}
else if(callback){callback(false,id);}}
function exportStream(stream,format){switch(String(format).toLowerCase()){case'array':return Array.from?Array.from(new Uint8Array(stream)):Array.prototype.slice.call(new Uint8Array(stream));case'base64':return encode64(stream);case'data-url':case'data-uri':case'dataurl':case'datauri':case'mime':return'data:audio/x-wav;base64,'+encode64(new Uint8Array(stream));default:return stream;}}
function encode64(data){var BASE='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',PAD='=',ret='',leftchar=0,leftbits=0,l=Object.prototype.toString.call(data)==='[object Array]'?data.length:data.byteLength;for(var i=0;i<l;i++){leftchar=(leftchar<<8)|data[i];leftbits+=8;while(leftbits>=6){var curr=(leftchar>>(leftbits-6))&0x3f;leftbits-=6;ret+=BASE[curr];}}
if(leftbits==2){ret+=BASE[(leftchar&3)<<4];ret+=PAD+PAD;}else if(leftbits==4){ret+=BASE[(leftchar&0xf)<<2];ret+=PAD;}
return ret;}
function speakMultipart(parts,args,callback,id){if(typeof args!=='object'||!args)args={};if(!canPlay&&!args.rawdata){if(self.console)console.warn('meSpeak: Can\'t play; No audio support.');return 0;}
var failed=false;if(typeof callback!=='function')callback=null;if(!callback&&typeof args.callback=='function')callback=args.callback;if(Object.prototype.toString.call(parts)!='[object Array]'||!parts.length){if(self.console)console.warn('meSpeak.speakMultipart: First argument must be an array of objects.');failed=true;}
if(!failed){for(var i=0,l=parts.length;i<l;i++){if(typeof parts[i]!='object'){if(self.console)console.warn('meSpeak.speakMultipart: First argument must be an array of objects (part #'+i+').');failed=true;break;}}}
if(failed){if(callback)callback(false,id||0);return 0;}
if(!id)id=getJobId();if(!coreReady||!defaultVoice){if(self.console)console.log('No voice module loaded, deferring call.');if(args.rawdata){return null;}
else{speakQueue.push([parts,args,callback,id,true]);return id;}}
var stackLength=parts.length,streams={},jobIds=[];for(var i=0;i<stackLength;i++)jobIds.push(getJobId());for(var i=0;i<parts.length;i++){var n,part=parts[i]||{},opts={};for(n in args)opts[n]=args[n];for(n in part)opts[n]=part[n];opts.rawdata='array';opts.callback=null;speak(part.text,opts,function(success,jobId,stream){if(success)streams[jobId]=stream;if(--stackLength===0){var wav,sampleLength=0,first=true;for(var i=0;i<jobIds.length;i++){var buffer=streams[jobIds[i]];if(buffer){sampleLength+=readBytes(buffer,40,4);if(first){wav=buffer;first=false;}
else{wav=wav.concat(buffer.slice(44));}}}
streams=buffer=null;writeBytes(wav,4,4,sampleLength);writeBytes(wav,40,4,sampleLength);var outStream=new ArrayBuffer(wav.length);new Uint8Array(outStream).set(wav);resolveUtterance(outStream,id,args.rawdata,args.volume,args.pan||0,callback);}},jobIds[i]);}
return id;}
function writeBytes(f,p,n,value){while(n){f[p++]=value&0xff;value=value>>8;n--;}}
function readBytes(f,p,n){var value=0,shft=0;while(n){value|=f[p++]<<shft;shft+=8;n--;}
return value;}
function getJobId(){var n,s;while(!n||audioPool[s]||webSoundPool[s]||workerCallbacks[s]){n=Math.floor(Math.random()*Math.pow(2,32));s=n.toString();}
return n;}
function playSound(stream,relVolume,callback,_id,pan){if(callback&&(typeof callback!=='function'))callback=null;if(!_id)_id=getJobId();var streamType=Object.prototype.toString.call(stream);if(!(streamType=='[object Array]'||streamType=='[object ArrayBuffer]'||streamType=='[object String]')){if(self.console)console.log('meSpeak: Can\'t play, not an Array, or ArrayBuffer, or base64-String: '+streamType);if(callback)callback(false,_id||0);return 0;}
if(typeof relVolume!=='undefined'){relVolume=parseFloat(relVolume);if(isNaN(relVolume)||relVolume<0||relVolume>1)relVolume=undefined;}
if(AudioAPI){if(streamType=='[object String]'){if(stream.indexOf('data:audio/x-wav;base64,',0)==0)stream=stream.substring(24);stream=stream.replace(/=+$/,'');if(stream.match(/[^A-Za-z0-9\+\/]/)){if(self.console)console.log('meSpeak: Can\'t play, not a proper base64-String.');if(callback)callback(false,_id||0);return 0;}
stream=decodeBase64ToArray(stream);if(!stream.length){if(self.console)console.log('meSpeak: Can\'t play, empty sound data.');if(callback)callback(false,_id||0);return 0;}
streamType='[object Array]';}
var buffer;if(streamType=='[object Array]'){var buffer=new ArrayBuffer(stream.length);new Uint8Array(buffer).set(stream);}
else{buffer=stream;}
return playWebSound(buffer,relVolume,callback,_id,pan);}
else if(canPlay){var isDataUrl=false;if(streamType=='[object String]'){if(stream.indexOf('data:audio/x-wav;base64,',0)<0){if(stream.match(/[^A-Za-z0-9\+\/]/)){if(self.console)console.log('meSpeak: Can\'t play, not a proper base64-String.');if(callback)callback(false,_id||0);return 0;}
stream='data:audio/x-wav;base64,'+stream;}
isDataUrl=true;}
else if(streamType=='[object ArrayBuffer]'){stream=new Uint8Array(stream);}
return(new AudioPlayback(stream,relVolume,isDataUrl,callback,_id).started)?_id:0;}
else{if(self.console)console.log('meSpeak: Can\'t play; No audio support.');if(callback)callback(false,_id||0);return 0;}}
function stopSound(){var id,i,k,kl,l,item,n,stopped=0;if(arguments.length>0){for(i=0,l=arguments.length;i<l;i++){n=parseInt(arguments[i]);if(n&&!isNaN(n)){id=n.toString();if(audioPool[id]){audioPool[id].stop();stopped++;}
else if(webSoundPool[id]){stopWebSound(webSoundPool[id]);stopped++;}
else{for(k=0,kl=speakQueue.length;k<kl;k++){item=speakQueue[i];if(item[3].string===id){if(!unloading&&typeof item[2]=='function')item[2](false);speakQueue.splice(k,1);stopped++;break;}}}}}}
else{for(id in audioPool){audioPool[id].stop();stopped++;}
for(id in webSoundPool){stopWebSound(webSoundPool[id]);stopped++;}
for(i=0,l=speakQueue.length;i<l;i++){item=speakQueue[i];if(!unloading&&typeof item[2]=='function')item[2](false);stopped++;}
speakQueue.length=0;}
return stopped;}
function setVolume(vol){var id,i,l,n,v;v=parseFloat(vol);if(!isNaN(v)&&v>=0&&v<=1&&v!=playbackVolume){if(arguments.length==1)playbackVolume=v;if(AudioAPI){if(arguments.length>1){for(i=0,l=arguments.length;i<l;i++){n=parseInt(arguments[i]);if(n&&!isNaN(n)){id=n.toString();if(webSoundPool[id])setWebSoundVolume(webSoundPool[id],v);}}}
else if(masterGain){masterGain.gain.value=playbackVolume;}}
else if(canPlay){if(arguments.length>1){for(i=0,l=arguments.length;i<l;i++){n=parseInt(arguments[i]);if(n&&!isNaN(n)){id=n.toString();if(audioPool[id])audioPool[id].setVolume(v);}}}
else{for(id in audioPool)audioPool[id].adjustVolume();}}}
return vol;}
function getVolume(){if(arguments.length){var n=parseInt(arguments[0]);if(n&&!isNaN(n)){var id=n.toString();if(webSoundPool[id])return webSoundPool[id].relVolume;if(audioPool[id])return audioPool[id].relVolume;}
return undefined;}
else{return playbackVolume;}}
function resolveAudioApi(){if(self.AudioContext){AudioAPI=self.AudioContext;canPlay=true;return;}
else{var vendors=['webkit','moz','o','ms'];for(var i=0;i<vendors.length;i++){var api=self[vendors[i]+'AudioContext'];if(api){AudioAPI=api;canPlay=true;return;}}}
if(!AudioAPI){var audioElement=document.createElement('audio');if(audioElement&&audioElement.canPlayType&&(audioElement.canPlayType('audio/wav')||audioElement.canPlayType('audio/x-wav'))){canPlay=true;}
else{canPlay=false;if(self.console)console.log('meSpeak: Muted. No support for HTMLAudioElement with MIME "audio/x-wav" dected.');}}}
function canPlaybackWav(){return canPlay;}
function AudioPlayback(stream,relVolume,isDataUrl,callback,id){this.relVolume=relVolume;this.audio=null;this.id=String(id);this.callback=(typeof callback=='function')?callback:null;this.playing=false;this.started=false;this.play(stream,isDataUrl);}
AudioPlayback.prototype={play:function(stream,isDataUrl){try{audioPool[this.id]=this;this.audio=document.createElement('audio');this.adjustVolume();var that=this;this.audio.addEventListener('ended',function(){that.remove();},false);this.audio.addEventListener('canplaythrough',function(){that.audio.play();that.playing=true;},false);if(isDataUrl){this.audio.src=stream;}
else{this.audio.src='data:audio/x-wav;base64,'+encode64(stream);}
this.audio.load();this.started=true;}
catch(e){if(self.console)console.log('meSpeak: HTMLAudioElement Exception: '+e.message);this.started=false;this.remove();}},adjustVolume:function(){this.audio.volume=(typeof this.relVolume!=='undefined')?this.relVolume*playbackVolume:playbackVolume;},setVolume:function(v){this.relVolume=v;this.adjustVolume();},remove:function(stopped){if(this.id)delete audioPool[this.id];if(this.callback){var f=this.callback;this.callback=null;var id=this.id||0;if(!unloading)f(!stopped,id);}},stop:function(){try{if(this.playing)this.audio.pause();}
catch(e){}
this.remove(true);}};function playWebSound(stream,volume,callback,id,pan){try{var source,gainNode,timer,relVolume,sid=String(id);if(!audioContext){audioContext=new AudioAPI();}
else if(audioContext.closed){audioContext=new AudioAPI();audioAnalyser=masterOutput=masterGain=null;}
if(!masterGain){masterGain=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode();masterGain.connect(audioContext.destination);masterGain.gain.value=playbackVolume;if(!masterOutput)masterOutput=masterGain;}
source=audioContext.createBufferSource();relVolume=parseFloat(volume);if(typeof relVolume==='undefined'||isNaN(relVolume)||relVolume<0||relVolume>1)relVolume=1;gainNode=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode();gainNode.gain.value=relVolume;if(pan&&!isNaN(pan)){try{var splitter=audioContext.createChannelSplitter(2),merger=audioContext.createChannelMerger(2),left=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode(),right=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode(),ratio=Math.max(-1,Math.min(1,parseFloat(pan))),mixer=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode();mixer.channelCount=2;mixer.channelCountMode='explicit';mixer.channelInterpretation='speakers';left.gain.value=ratio<0?1:1-ratio;right.gain.value=ratio>0?1:1+ratio;mixer.connect(splitter);splitter.connect(left,0);splitter.connect(right,1);left.connect(merger,0,0);right.connect(merger,0,1);merger.connect(gainNode);source.connect(mixer);}
catch(e){source.connect(gainNode);}}
else{source.connect(gainNode);}
if(audioAnalyser)gainNode.connect(audioAnalyser);gainNode.connect(masterOutput);audioContext.decodeAudioData(stream,function(audioData){var f=function(){webSoundEndHandler(source,gainNode,callback,true,id);};if(wsUseTimeout||typeof source.onended==='undefined'){var duration=audioData.duration;timer=setTimeout(f,duration?Math.ceil(duration*1000):10);}
else{source.onended=f;}
source.buffer=audioData;if(wsStartFromCallback){if(source.start){source.start(0);}
else{source.noteOn(0);}}},function(err){console.log('meSpeak: Web Audio Decoding Error: '+((typeof err=='object')?err.message:err));if(timer)clearTimeout(timer);if(source)source.disconnect();if(gainNode)gainNode.disconnect();if(webSoundPool[sid])delete webSoundPool[sid];if(!unloading&&typeof callback=='function')callback(false,id);return 0;});webSoundPool[sid]={'source':source,'gainNode':gainNode,'callback':callback,'id':id,'relVolume':relVolume,'timer':timer};if(!wsStartFromCallback){if(source.start){source.start(0);}
else{source.noteOn(0);}}
return id;}
catch(e){if(self.console)console.log('meSpeak: Web Audio Exception: '+e.message);if(timer){clearTimeout(timer);timer=0;}
webSoundEndHandler(source,gainNode,callback,false,id);return 0;}}
function webSoundEndHandler(source,gainNode,callback,success,id){var sid=String(id);if(sid&&webSoundPool[sid]&&webSoundPool[sid].timer)clearTimeout(webSoundPool[sid].timer);if(!unloading&&typeof callback=='function')callback(success,id);var f=function(){if(source){if(typeof source.onended!=='undefined')source.onended=null;source.disconnect();}
if(gainNode)gainNode.disconnect();if(sid&&webSoundPool[sid])delete webSoundPool[sid];};if(!success){f();}
else{setTimeout(f,500);}}
function stopWebSound(obj){try{if(obj.source.stop){obj.source.stop(0);}
else{obj.sourcesource.noteOff(0);}}
catch(e){}
webSoundEndHandler(obj.source,obj.gainNode,obj.callback,false,obj.id);}
function setFilter(){var biquadProps=['frequency','Q','gain','detune'],compressorProps=['threshold','knee','ratio','reduction','attack','release'];if(!AudioAPI)return;if(!audioContext){audioContext=new AudioAPI();}
else if(audioContext.closed){audioContext=new AudioAPI();audioAnalyser=masterOutput=masterGain=null;}
var inputNode,outputNode;for(var i=0;i<arguments.length;i++){var data=arguments[i];if(Object.prototype.toString.call(data)!=='[object Object]'){if(self.console)console.warn('meSpeak.setFilter(): argument must be an object, ignoring argument '+i+'.');continue;}
var filter,type=String(data.type).toLowerCase();switch(type){case'lowpass':case'highpass':case'bandpass':case'lowshelf':case'highshelf':case'peaking':case'notch':case'allpass':try{filter=audioContext.createBiquadFilter();filter.type=type;for(var j=0;j<biquadProps.length;j++){var p=biquadProps[j];try{if(!isNaN(data[p]))filter[p].value=data[p];}
catch(e2){if(self.console)console.warn('meSpeak.setFilter(), filter-type: "'+type+'", parameter: "'+p+'": '+e2.message);};}}
catch(e1){if(self.console)console.warn('meSpeak.setFilter(): Failed to create filter "'+type+'", '+e1.message);};break;case'dynamicscompressor':case'compressor':try{filter=audioContext.createDynamicsCompressor();for(var j=0;j<compressorProps.length;j++){var p=compressorProps[j];try{if(!isNaN(data[p]))filter[p].value=data[p];}
catch(e2){if(self.console)console.warn('meSpeak.setFilter(), filter-type: "'+type+'", parameter: "'+p+'": '+e2.message);};}
break;}
catch(e1){if(self.console)console.warn('meSpeak.setFilter(): Failed to create filter "'+type+'", '+e1.message);};default:if(self.console)console.warn('meSpeak.setFilter(): unknown filter type "'+type+'".');filter=null;break;}
if(filter){if(!inputNode){inputNode=filter;}
else{inputNode.connect(filter);}
outputNode=filter;}}
if(outputNode){if(!masterGain){masterGain=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode();masterGain.connect(audioContext.destination);masterGain.gain.value=playbackVolume;}
outputNode.connect(masterGain);masterOutput=inputNode;}
else{masterOutput=masterGain;}}
function getAudioAnalyser(){if(!AudioAPI)return;if(!audioContext){audioContext=new AudioAPI();}
else if(audioContext.closed){audioContext=new AudioAPI();audioAnalyser=masterOutput=masterGain=null;}
audioAnalyser=audioContext.createAnalyser();return audioAnalyser;}
function setWebSoundVolume(obj,v){obj.gainNode.gain.value=v;obj.relVolume=v;}
function setDefaultVoice(voice){if(voice){if(!coreReady){deferredLoaders.push({'job':setDefaultVoice,'args':[voice]});}
else if(voicesLoaded[voice]){defaultVoice=voice;}}}
function getDefaultVoice(){return defaultVoice;}
function getRelFileUrl(url){if((/^(\/|https?:|ftps?:|file:)/i).test(url))return url;else{var baseParts=(/^(https?|ftps?|file)(\:\/\/)([^\/]*\/)(.*)$/i).exec(baseUrl),basePath=baseParts[4].split('/'),filePath=url.split('/');for(var i=0;i<filePath.length;i++){var p=filePath[i];if(p==='.')continue;if(p==='..'){basePath.pop();}
else{basePath.push(p);}}
return baseParts[1]+baseParts[2]+baseParts[3]+basePath.join('/');}}
function loadVoice(url,callback){if(url&&typeof url==='string'){if(coreReady){var handler=function(success,msg){if(success)onVoiceLoaded(msg);if(typeof callback==='function')callback(success,msg);};if((/^[\w\-]+(\/[\w\-]+)?$/).test(url)){url='voices/'+url+'.json';}
url=getRelFileUrl(url);if(hasWorker){sendWorkerJob({'job':'loadVoice','args':[url]},0,handler);}
else{meSpeakCore.loadVoice(url,handler);}}
else{deferredLoaders.push({'job':loadVoice,'args':[url,callback]});}}}
function loadConfig(url){}
function loadCustomConfig(url,callback){if(url&&typeof url==='string'){if(coreReady){var handler=function(success,msg){if(success)onConfigLoaded(msg);if(typeof callback==='function')callback(success,msg);};url=getRelFileUrl(url);if(hasWorker){sendWorkerJob({'job':'loadConfig','args':[url]},0,handler);}
else{meSpeakCore.loadConfig(url,handler);}}
else{deferredLoaders.push({'job':loadCustomConfig,'args':[url,callback]});}}}
function onConfigLoaded(voiceId){if(voiceId){voicesLoaded[voiceId]=true;setDefaultVoice(voiceId);}}
function onVoiceLoaded(voiceId){if(voiceId){voicesLoaded[voiceId]=true;setDefaultVoice(voiceId);executeQueuedCalls();}}
function isVoiceLoaded(voice){return voicesLoaded[voice]?true:false;}
function isConfigLoaded(){return true;}
function getRunMode(){return hasWorker?'worker':'instance';}
function restartWithInstance(){speakQueue.length=deferredLoaders.length=0;voicesLoaded={};workerCallbacks={};defaultVoice='';stopSound();audioPool={};webSoundPool={};playbackVolume=1;if(hasWorker){if(worker)worker.terminate();worker=null;hasWorker=coreReady=false;loadCore();}}
function unloadHandler(event){unloading=true;stopSound();audioPool={};webSoundPool={};workerCallbacks={};if(worker)worker.terminate();}
function unlockAudio(event){event.returnValue=true;if(audioUnlocked)return;if(AudioAPI){try{if(!audioContext)audioContext=new AudioAPI();if(audioContext.state==='suspended')audioContext.resume();var gain=(audioContext.createGain)?audioContext.createGain():audioContext.createGainNode();}
catch(e){}}
audioUnlocked=true;self.removeEventListener('touchstart',unlockAudio);self.removeEventListener('mousedown',unlockAudio);}
loadCore();resolveAudioApi();window.addEventListener('unload',unloadHandler,false);if(isMobile&&typeof self.ontouchstart!==undefined)self.addEventListener('touchstart',unlockAudio,{'passive':true,'capture':true});else if(isSafari)self.addEventListener('mousedown',unlockAudio,true);return{'speak':speak,'speakMultipart':speakMultipart,'loadConfig':loadConfig,'loadVoice':loadVoice,'loadCustomConfig':loadCustomConfig,'setDefaultVoice':setDefaultVoice,'getDefaultVoice':getDefaultVoice,'setVolume':setVolume,'getVolume':getVolume,'play':playSound,'isConfigLoaded':isConfigLoaded,'isVoiceLoaded':isVoiceLoaded,'resetQueue':resetQueue,'canPlay':canPlaybackWav,'stop':stopSound,'setFilter':setFilter,'getRunMode':getRunMode,'restartWithInstance':restartWithInstance,'getAudioAnalyser':getAudioAnalyser,'unlockAudio':unlockAudio};})();