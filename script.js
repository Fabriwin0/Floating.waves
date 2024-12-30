const canvas = document.getElementById('audioCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

let audioContext;
let analyser;
let dataArray;
let bufferLength;
let source;

startButton.addEventListener('click', startMicrophone);
stopButton.addEventListener('click', stopMicrophone);

function startMicrophone() {
  if (audioContext) {
    console.warn('Microphone already started');
    return;
  }

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      startButton.disabled = true;
      stopButton.disabled = false;
      draw();
    })
    .catch(err => {
      console.error('Error accessing microphone:', err);
      alert('Error accessing microphone: ' + err.message);
    });
}

function stopMicrophone() {
  if (!audioContext) {
    console.warn('Microphone not started');
    return;
  }

  source.disconnect();
  audioContext.close();
  audioContext = null;
  analyser = null;
  dataArray = null;
  bufferLength = null;
  source = null;

  startButton.disabled = false;
  stopButton.disabled = true;
}

function draw() {
  if (!audioContext) return;

  requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 1.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    const r = barHeight + (25 * (i / bufferLength));
    const g = 250 * (i / bufferLength);
    const b = 50;

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 2);

    x += barWidth + 1;
  }

  // Handle touch events
  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
}

function handleTouch(event) {
  event.preventDefault();
  const touches = event.touches;
  for (let i = 0; i < touches.length; i++) {
    const touch = touches[i];
    createParticles(touch.clientX, touch.clientY);
  }
}

function createParticles(x, y) {
  const numParticles = 50;
  for (let i = 0; i < numParticles; i++) {
    const particle = {
      x: x,
      y: y,
      size: Math.random() * 5 + 1,
      speedX: (Math.random() - 0.5) * 5,
      speedY: (Math.random() - 0.5) * 5,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    };
    particles.push(particle);
  }
}

let particles = [];

function animateParticles() {
  requestAnimationFrame(animateParticles);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();

    particle.x += particle.speedX;
    particle.y += particle.speedY;

    if (particle.size > 0.1) {
      particle.size -= 0.05;
    } else {
      particles.splice(i, 1);
      i--;
    }
  }
}

animateParticles();
