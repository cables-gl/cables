# DynamicsCompressor

The DynamicsCompressorNode interface provides a compression effect, which lowers the volume of the loudest parts of the signal in order to help prevent clipping and distortion that can occur when multiple sounds are played and multiplexed together at once. This is often used in musical production and game audio. 

[Resident Advisor: Compression Tutorial](https://www.residentadvisor.net/feature.aspx?1595)

## In-Ports

### audio in

The audio signal you want to compress

### threshold

How loud the signal has to be before compression is applied.

### knee

Sets how the compressor reacts to signals once the threshold is passed.

### ratio

How much compression is applied. For example, if the compression ratio is set for 6:1, the input signal will have to cross the threshold by 6 dB for the output level to increase by 1dB.

### attack

How quickly the compressor starts to work.

### release

How soon after the signal dips below the threshold the compressor stops.

## Out-Ports

Compressed audio signal