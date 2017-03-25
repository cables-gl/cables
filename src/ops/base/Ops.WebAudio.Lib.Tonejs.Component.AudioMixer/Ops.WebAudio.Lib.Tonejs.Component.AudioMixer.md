# AudioMixer

*Ops.WebAudio.Lib.Tonejs.Component.AudioMixer*  

AudioMixer can be used to bring different audio signals together and change their volumes individually. Similar to a mixer found in recording studios you can `mute` individual channels or only play one by ticking `solo`. 

## Input

### Channel Name X [String]

The channel name, this does not have any logic internally, it’s just there for you to insert a name for each channel to have a better overview.

### Channel X Audio [Audio]

The audio input of the channel

### Channel X Volume [Number]

The volume of the channel

### Channel X Mute [Bool]

If set the channel will be muted, so you won’t hear it

### Channel X Solo [Bool]

If set only this channel will be heard and all others will be silent. There can only be one channel set to `solo` at a time, so if you select another channel to be soloed, the former one gets un soloed. When you uncheck a former soloed channel all channel volumes / mute states will be set according to the current state of the ports.

## Output

### Audio Out [Audio]

The mixed audio signal