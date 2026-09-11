/* eslint-env node */
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'sounds');
const androidRawDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'raw');
const legacyAlarm = path.join(__dirname, '..', 'assets', 'alarm.wav');

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

function clampSample(value) {
  return Math.max(-32768, Math.min(32767, Math.floor(value)));
}

function generateClassic(sampleRate, duration = 2.4) {
  const total = Math.floor(sampleRate * duration);
  const samples = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const pulse = Math.sin(Math.PI * ((t * 2.5) % 1));
    const tone = Math.sin(2 * Math.PI * 880 * t) * 0.55 + Math.sin(2 * Math.PI * 1320 * t) * 0.25;
    const amp = pulse > 0.15 ? 1 : 0.05;
    samples[i] = clampSample(tone * amp * 28000);
  }
  return samples;
}

function generateDigital(sampleRate, duration = 2.0) {
  const total = Math.floor(sampleRate * duration);
  const samples = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const beepOn = Math.floor(t * 3) % 2 === 0;
    const freq = 660 + (Math.floor(t * 1.5) % 2) * 220;
    const wave = Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.45;
    samples[i] = clampSample(beepOn ? wave * 26000 : wave * 400);
  }
  return samples;
}

function generateGentle(sampleRate, duration = 3.0) {
  const total = Math.floor(sampleRate * duration);
  const samples = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const env = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.35 * t);
    const tone = Math.sin(2 * Math.PI * 392 * t) * 0.35 + Math.sin(2 * Math.PI * 523 * t) * 0.25;
    samples[i] = clampSample(tone * env * 22000);
  }
  return samples;
}

function generateUrgent(sampleRate, duration = 2.2) {
  const total = Math.floor(sampleRate * duration);
  const samples = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const pulse = Math.sin(Math.PI * ((t * 6) % 1));
    const tone = Math.sin(2 * Math.PI * 1046 * t) * 0.6 + Math.sin(2 * Math.PI * 1568 * t) * 0.35;
    const amp = pulse > 0.1 ? 1 : 0.02;
    samples[i] = clampSample(tone * amp * 30000);
  }
  return samples;
}

function generateChime(sampleRate, duration = 2.8) {
  const notes = [880, 740, 622, 523];
  const total = Math.floor(sampleRate * duration);
  const samples = new Int16Array(total);
  const noteLen = duration / notes.length;
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.min(notes.length - 1, Math.floor(t / noteLen));
    const localT = t - noteIdx * noteLen;
    const decay = Math.exp(-localT * 2.8);
    const freq = notes[noteIdx];
    const tone = Math.sin(2 * Math.PI * freq * localT) * decay;
    samples[i] = clampSample(tone * 26000);
  }
  return samples;
}

const SOUNDS = [
  { id: 'classic', generate: generateClassic },
  { id: 'digital', generate: generateDigital },
  { id: 'gentle', generate: generateGentle },
  { id: 'urgent', generate: generateUrgent },
  { id: 'chime', generate: generateChime },
];

fs.mkdirSync(assetsDir, { recursive: true });
fs.mkdirSync(androidRawDir, { recursive: true });

const sampleRate = 44100;
for (const sound of SOUNDS) {
  const samples = sound.generate(sampleRate);
  const filename = `alarm_${sound.id}.wav`;
  const assetPath = path.join(assetsDir, filename);
  const androidPath = path.join(androidRawDir, filename);
  writeWav(assetPath, samples, sampleRate);
  fs.copyFileSync(assetPath, androidPath);
  console.log(`Wrote ${assetPath} and ${androidPath}`);
}

const classicPath = path.join(assetsDir, 'alarm_classic.wav');
fs.copyFileSync(classicPath, legacyAlarm);
fs.copyFileSync(classicPath, path.join(androidRawDir, 'alarm.wav'));
console.log(`Wrote legacy ${legacyAlarm} and android raw/alarm.wav`);
