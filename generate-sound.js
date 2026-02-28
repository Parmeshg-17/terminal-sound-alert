// Script to generate a simple error beep WAV file
// Run with: node generate-sound.js

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 0.3; // seconds
const FREQUENCY = 800; // Hz
const VOLUME = 0.6;

const numSamples = Math.floor(SAMPLE_RATE * DURATION);
const dataSize = numSamples * 2; // 16-bit mono = 2 bytes per sample
const fileSize = 44 + dataSize; // WAV header = 44 bytes

const buffer = Buffer.alloc(fileSize);
let offset = 0;

// ── WAV Header ──
buffer.write('RIFF', offset); offset += 4;
buffer.writeUInt32LE(fileSize - 8, offset); offset += 4;
buffer.write('WAVE', offset); offset += 4;

// fmt sub-chunk
buffer.write('fmt ', offset); offset += 4;
buffer.writeUInt32LE(16, offset); offset += 4;       // sub-chunk size
buffer.writeUInt16LE(1, offset); offset += 2;        // PCM format
buffer.writeUInt16LE(1, offset); offset += 2;        // mono
buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
buffer.writeUInt32LE(SAMPLE_RATE * 2, offset); offset += 4; // byte rate
buffer.writeUInt16LE(2, offset); offset += 2;        // block align
buffer.writeUInt16LE(16, offset); offset += 2;       // bits per sample

// data sub-chunk
buffer.write('data', offset); offset += 4;
buffer.writeUInt32LE(dataSize, offset); offset += 4;

// ── Generate sine wave with fade in/out ──
const fadeLen = Math.floor(numSamples * 0.1);

for (let i = 0; i < numSamples; i++) {
    let amplitude = VOLUME;

    // Fade in
    if (i < fadeLen) {
        amplitude *= i / fadeLen;
    }
    // Fade out
    if (i > numSamples - fadeLen) {
        amplitude *= (numSamples - i) / fadeLen;
    }

    const sample = Math.sin(2 * Math.PI * FREQUENCY * i / SAMPLE_RATE) * amplitude;
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    buffer.writeInt16LE(intSample, offset);
    offset += 2;
}

// Write file
const outDir = path.join(__dirname, 'sounds');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'error.wav');
fs.writeFileSync(outPath, buffer);
console.log(`Generated: ${outPath} (${buffer.length} bytes, ${DURATION}s @ ${FREQUENCY}Hz)`);
