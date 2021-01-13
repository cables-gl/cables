# Working with audio

In this section of the documentation, we are going to dive into how to use audio files within cables. Please keep in mind that the operators are subject to change in the future. We will try to keep the documentation as up to date as possible but if you find outdated parts or explanations that don't hold true anymore, do not hesitate to [contact us on Discord](https://discord.gg/AGTarWv).

## Basic Audio Setup

To get an audio stream into cables, there are multiple options. First off, to play back any file, you need to use the [Audio Buffer](https://cables.gl/op/Ops.WebAudio.AudioBuffer_v2) op. With this op, you create an audio buffer that you can connect to one of our audio players mentioned in the next section.

### A note on file formats

Depending on your target platform, you need to keep in mind that not all file formats work consistently on all browsers & operating systems. To counteract this, we provide the [BrowserSpecificFile op](https://cables.gl/op/Ops.Html.BrowserSpecificFile_v2) that lets you switch files depending on which browser/OS is detected. Have a look at the [example patch](https://cables.gl/edit/5f88465bab82411d4f75112e) for usage.

As a little example:
To be able to loop a file in Firefox, the file format needs to be **.ogg**, where as in Chrome, you need an **.mp3**. In Safari, you need an **.m4a** file.

## AudioBufferPlayer vs. SamplePlayer

After you successfully loaded a file into the AudioBuffer op, you need a player to play back the buffer. You have two choices here, depending on what you want to do:

1. If you want to play back a sound as a loop, such as a background ambience or a longer audio file, such as a musical piece, you should use the [AudioBufferPlayer](https://cables.gl/op/Ops.WebAudio.AudioBufferPlayer_v2) op.

2. If you want to play a shorter sound (called one-shot), such as a notification sound, a drum sample or want to play a file based on a trigger, use the [SamplePlayer](https://cables.gl/op/Ops.WebAudio.SamplePlayer) op.  A little side note: keep in mind that when triggering multiple times and using longer files, the audio file will play back twice. Make sure you time your triggers correctly to avoid overlapping the sound multiple times. This can lead to distortion, because the sounds add up in volume.

## Other audio inputs

You can also use the [MicrophoneIn](https://cables.gl/op/Ops.WebAudio.MicrophoneIn_v2) op to access your device's microphone. Have a look at the [example patch](https://cables.gl/edit/5c7ff0857f347b350b96a150).

To stream music from soundcloud, you can connect the [SoundCloud](https://cables.gl/op/Ops.Api.SoundCloud.SoundCloud_v2) operator to an AudioBuffer. Have a look at the [example patch](https://cables.gl/edit/5b962516158577da42e022f4).

## Getting sound to your speakers

Now that you connected an AudioBuffer to a player, it is time to get sound to your speakers. To do that, you need to connect the audio output of your player to the [Output](https://cables.gl/op/Ops.WebAudio.Output_v2) op. Please refer to the Output op's [example patch](https://cables.gl/edit/5fd8a5d71d3e0022a8736ea5) to see how to set it up.

### A note on using multiple audio players

If you plan on using multiple audio players, make sure to use the [Mixer](https://cables.gl/op/Ops.WebAudio.Mixer) op and connect the individual outputs of the players to it. You can then connect the Mixer op's output to the Output op. Refer to the Mixer's [example patch](https://cables.gl/edit/5fd8a1ba1d3e0022a8736e3d) to see it in use. If you cannot multiple inputs to one Output op, you might experience unexpected behaviour of the audio files (e.g.: audio files still being played back even though they were disconnected). After everything is connected, play back your audio file. You should hear sound from your speakers.

## Working with Effects

Now that we have a basic input-output chain going and hear sound being played, it is time to add effects. Cables offers a multitude of WebAudio effects. To add an effect to your audio, simply put one of the audio effect operators between your player and the output.

### Audio effects in cables

#### Gain and Panning

You can raise and lower the volume of a sound by adding a [Gain](https://cables.gl/op/Ops.WebAudio.Gain) op.

If you want to pan your signal (moving it left or right in the stereo space), have a look at the [AudioPanner](https://cables.gl/op/Ops.WebAudio.AudioPanner) op. Check its [example patch](https://cables.gl/edit/5f7c7953babf3079c124974a) to see how you can automate left-to-right movement.

#### Filters

If you want to filter your signal, attenuate or exagerate certain frequencies, there are multiple ops at your disposal. For simple equalizing tasks, the [ThreeBandEqualizer](https://cables.gl/op/Ops.WebAudio.ThreeBandEqualizer) op is recommended. It features 3 bands with different filter types. Have a look at the [example](https://cables.gl/edit/5fd7862f7c7e326dfef723e5) for a more detailed explanation.

In addition to the ThreeBandEqualizer, we have a more "DJ-Style" filter operator, the [CutFilter](https://cables.gl/op/Ops.WebAudio.CutFilter) op. It features a low- and a highpass filter with different slope characteristics, similiar to a DJ mixer. Have a look at the [example patch](https://cables.gl/edit/5fd78ab37c7e326dfef723ee).

The last filter is the [BiquadFilter](https://cables.gl/op/Ops.WebAudio.BiquadFilter_v2). This filter is a single filter that features all availible filter types in the WebAudio standard. If you are looking for more advanced filters, then this is the op to go. Have a look at it's [example patch](https://cables.gl/edit/5fd8b8de1d3e0022a8736fef).

**IMPORTANT NOTE ON FILTER Q VALUES!!!: WATCH OUT FOR HIGH Q VALUES, THEY CAN CREATE LOUD AND UNPLEASANT FEEDBACK. ESPECIALLY WHEN WORKING WITH HEADPHONES ON LOUD VOLUMES THERE IS A POTENTIAL FOR EAR DAMAGE!!**

#### Reverb

If you want to add a reverb to your sound and you are familiar with [Convolution Reverb](https://en.wikipedia.org/wiki/Convolution_reverb), you can use the [Convolver op](https://cables.gl/op/Ops.WebAudio.Convolver_v2). Have a look at the [example patch](https://cables.gl/edit/5fd732eed2245c43bad1b762) for more details.

## Real-Time Audio Analyzation & Audio Visualization

To be able to generate visuals driven by sound, you need to extract either the current amplitude or the amplitude of a certain frequency region (say you want to trigger a visual when a kick drum is played; you would only want to consider the bass frequencies of your sound to interact with the visuals).

We offer you three operators to analyze sound and extract various information from them.

The first operator is the [AudioAnalyzer](https://cables.gl/op/Ops.WebAudio.AudioAnalyzer_v2). This op provides you with amplitude outputs and FFT transformed array outputs. Have a look at this [example patch](https://cables.gl/edit/Vm37yp) for a simple overview of the controls. If you want a showcase of its abilities, refer to [this patch](https://cables.gl/edit/55f8367f42eae93b29bf87b9) to see it in action. It's output is also used for the following two operators.

The second op to analyze audio with is the [FFTAreaAverage](https://cables.gl/op/Ops.WebAudio.FFTAreaAverage_v2) op. It needs the FFT Array output of the AudioAnalyzer as an input to work.
This op lets you specify a rectangle in the frequency spectrum of your file. The op will only analyze the corresponding frequency and amplitude range. The width of the rectangle is the frequency range and the height of the rectangle is the amplitude range. Have a look at the [example patch](https://cables.gl/edit/5fd79f607c7e326dfef72449) to get further insights.

The third op is the [AnalyzerTexture](https://cables.gl/op/Ops.WebAudio.AnalyzerTexture_v2) op. It also takes the FFT Array output of the AudioAnalyzer and creates a black and white texture from it. This op is useful for texture masks in postprocessing or sound-dependingly altering visual aspects of objects using materials. Please refer to the [example patch](https://cables.gl/edit/5fd8b4391d3e0022a8736fd7). You could for instance use the texture output as an input to the opacity texture of a [BasicMaterial](https://cables.gl/op/Ops.Gl.Shader.BasicMaterial_v3).

With these 3 ops, you are able to drive anything responding to sound. If you use audio effects before your analyzation (so that they are not heard), you can manipulate the audio signal in parallel while the original sound is played back. A whole world of new visualization possibilities opens up.

## Offline Audio Visualization & Analyzation

Cables offers two operators to extract visual data from an [AudioBuffer](https://cables.gl/op/Ops.WebAudio.AudioBuffer_v2).

If you want to work with geometries, then you should consider the [WaveformMesh](https://cables.gl/op/Ops.WebAudio.WaveformMesh) operator. This op renders the waveform as a mesh, but you can also disable rendering and use its' geometry output for further geometry manipulation. Have a look at the [example patch](https://cables.gl/edit/5fd8a8911d3e0022a8736f19).

If you want to work with splines or array data points, consider the [AudioBufferToSplineArray](https://cables.gl/op/Ops.WebAudio.AudioBufferToSplineArray) operator. This generates an array of spline points to be used with Spline ops, such as the [SplineMesh](https://cables.gl/op/Ops.Gl.Meshes.SplineMesh_v2) and the [SplineMeshMaterial](https://cables.gl/op/Ops.Gl.Meshes.SplineMeshMaterial_v2) operator. Have a look at the [example patch](https://cables.gl/edit/5fd88d171d3e0022a8736c3a).

__TOC__
