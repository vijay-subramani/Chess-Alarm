/* eslint-env node */
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', 'assets', 'alarm.wav');

function writeWav(filePath, samples, sampleRate = 44100) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

const sampleRate = 44100;
const duration = 2.4;
const total = Math.floor(sampleRate * duration);
const samples = new Int16Array(total);

for (let i = 0; i < total; i++) {
  const t = i / sampleRate;
  const pulse = Math.sin(Math.PI * ((t * 2.5) % 1));
  const tone = Math.sin(2 * Math.PI * 880 * t) * 0.55 + Math.sin(2 * Math.PI * 1320 * t) * 0.25;
  const amp = pulse > 0.15 ? 1 : 0.05;
  samples[i] = Math.max(-32768, Math.min(32767, Math.floor(tone * amp * 28000)));
}

writeWav(out, samples, sampleRate);

const androidRaw = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw', 'alarm.wav');
fs.mkdirSync(path.dirname(androidRaw), { recursive: true });
fs.copyFileSync(out, androidRaw);

console.log(`Wrote ${out} and ${androidRaw}`);
