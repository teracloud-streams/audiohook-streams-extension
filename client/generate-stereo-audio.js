const fs = require('fs');

function createStereoWavFile(filename, durationSeconds = 5) {
    const sampleRate = 8000;
    const bytesPerSample = 2; // 16-bit
    const numChannels = 2; // STEREO
    const dataSize = sampleRate * durationSeconds * bytesPerSample * numChannels;
    
    const buffer = Buffer.alloc(44 + dataSize);
    
    // WAV header for stereo
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(numChannels, 22); // STEREO - 2 channels
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * bytesPerSample * numChannels, 28); // Byte rate adjusted for stereo
    buffer.writeUInt16LE(bytesPerSample * numChannels, 32); // Block align
    buffer.writeUInt16LE(16, 34); // bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Generate stereo audio: 
    // Channel 0 (Left/Caller): 440Hz sine wave
    // Channel 1 (Right/Agent): 660Hz sine wave
    for (let i = 0; i < sampleRate * durationSeconds; i++) {
        // Left channel (caller) - 440Hz
        const sampleLeft = Math.sin(2 * Math.PI * 440 * i / sampleRate);
        const intSampleLeft = Math.floor(sampleLeft * 32767);
        
        // Right channel (agent) - 660Hz  
        const sampleRight = Math.sin(2 * Math.PI * 660 * i / sampleRate);
        const intSampleRight = Math.floor(sampleRight * 32767);
        
        // Interleave stereo samples: [L, R, L, R, ...]
        const offset = 44 + (i * bytesPerSample * numChannels);
        buffer.writeInt16LE(intSampleLeft, offset); // Left channel
        buffer.writeInt16LE(intSampleRight, offset + 2); // Right channel
    }
    
    fs.writeFileSync(filename, buffer);
    console.log(`Created ${filename} (${durationSeconds}s, 8000Hz, STEREO)`);
    console.log('  - Left channel (Caller): 440Hz tone');
    console.log('  - Right channel (Agent): 660Hz tone');
}

createStereoWavFile('stereo-caller-agent.wav', 10);
