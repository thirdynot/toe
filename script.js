"use strict";


const lyrics = [
  { time: 0,   text: "♪ ♪ ♪" },
  { time: 21,   text: "When I was younger, I saw" },
  { time: 25,   text: "My daddy cry and curse at the wind" },
  { time: 32,   text: "He broke his own heart and I watched" },
  { time: 36,   text: "As he tried to reassemble it" },
  { time: 42,   text: "And my mama swore that she would" },
  { time: 46,   text: "Never let herself forget" },
  { time: 52,  text: "And that was the day that I promised" },
  { time: 56,  text: "I'd never sing of love if it does not exist" },
  { time: 62,  text: "But, darling, you are the only exception" },
  { time: 69,  text: "You are the only exception" },
  { time: 74,  text: "You are the only exception" },
  { time: 79,  text: "You are the only exception" },
  { time: 90,  text: "Maybe I know somewhere" },
  { time: 93,  text: "Deep in my soul that love never lasts" },
  { time: 100,  text: "And we've got to find other ways" },
  { time: 104,  text: "To make it alone or keep a straight face" },
  { time: 110,  text: "And I've always lived like this" },
  { time: 114,  text: "Keeping a comfortable distance" },
  { time: 121,  text: "And up until now, I had sworn" },
  { time: 125,  text: "To myself that I'm content with" },
  { time: 128,  text: "loneliness" },
  { time: 132,  text: "Because none of it was ever worth the risk" },
  { time: 135,  text: "Well, you are the only exception" },
  { time: 140,  text: "You are the only exception" },
  { time: 145,  text: "You are the only exception" },
  { time: 150,  text: "You are the only exception" },
  { time: 157,   text: "♪ ♪ ♪" },
  { time: 176,  text: "I've got a tight grip on reality,but I can't" },
  { time: 181,  text: "Let go of what's in front of me here" },
  { time: 186,  text: "I know you're leaving in the" },
  { time: 188,  text: "morning when you wake up" },
  { time: 192,  text: "Leave me with some kind of" },
  { time: 194,  text: "proof it's not a dream, oh" },
  { time: 203,  text: "You are the only exception" },
  { time: 208,  text: "You are the only exception" },
  { time: 213,  text: "You are the only exception" },
  { time: 218,  text: "You are the only exception" },
  { time: 224,  text: "You are the only exception" },
  { time: 228,  text: "You are the only exception" },
  { time: 234,  text: "You are the only exception" },
  { time: 239,  text: "You are the only exception" },
  { time: 244,  text: "And I'm on my way to believing" },
  { time: 254,  text: "Oh, and I'm on my way to" },
  { time: 259,  text: "believing" }

];


const STAGES = [
  { number: 1, startPercent: 0  },  
  { number: 2, startPercent: 20 },  
  { number: 3, startPercent: 40 },  
  { number: 4, startPercent: 60 },  
  { number: 5, startPercent: 80 }   
];

// How many stars exist in each stage
const STAR_COUNT = { 1: 5, 2: 10, 3: 18, 4: 40, 5: 70 };
const WINDOW_STAR_LIMIT = 18;


const DEMO_LENGTH = 240;
const DEMO_SPEED = 4;

const TEDDY_MESSAGES = [
  "You're doing great! ♥",
  "Hug break? ʕ•ᴥ•ʔ",
  "I'll keep the bed warm.",
  "Stay cozy tonight ☆",
  "Look, the stars are out!"
  
];

const PARTICLE_COLORS = ["#ffd166", "#ffb3c6", "#c8b6ff", "#a8dadc", "#fff3d6"];

const SCENE_WIDTH = 480;
const SCENE_HEIGHT = 300;


const audio          = document.getElementById("song");
const stageWrap      = document.getElementById("stageWrap");
const scene          = document.getElementById("scene");
const room           = document.getElementById("room");
const bigSky         = document.getElementById("bigSky");
const character      = document.getElementById("character");
const windowStars    = document.getElementById("windowStars");
const skyStars       = document.getElementById("skyStars");
const particles      = document.getElementById("particles");

const startButton    = document.getElementById("startButton");
const playPauseBtn   = document.getElementById("playPauseBtn");
const replayBtn      = document.getElementById("replayBtn");
const finalReplayBtn = document.getElementById("finalReplayBtn");
const progressBar    = document.getElementById("progressBar");
const volumeBar      = document.getElementById("volumeBar");
const currentTimeText = document.getElementById("currentTime");
const totalTimeText  = document.getElementById("totalTime");

const lyricPrev      = document.getElementById("lyricPrev");
const lyricCurrent   = document.getElementById("lyricCurrent");
const lyricNext      = document.getElementById("lyricNext");

const messageBox     = document.getElementById("messageBox");
const teddyBubble    = document.getElementById("teddyBubble");
const finalScene     = document.getElementById("finalScene");

const lampBtn        = document.getElementById("lampBtn");
const windowBtn      = document.getElementById("windowBtn");
const teddyBtn       = document.getElementById("teddyBtn");
const radioBtn       = document.getElementById("radioBtn");



let isPlaying = false;
let songFinished = false;
let demoMode = false;
let demoTime = 0;
let demoTimer = null;
let currentStage = 0;
let currentLyricIndex = -1;
let walkTimer = null;
let messageTimer = null;
let bubbleTimer = null;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;




function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return minutes + ":" + String(secs).padStart(2, "0");
}

function getCurrentTime() {
  return demoMode ? demoTime : audio.currentTime;
}

function getDuration() {
  if (demoMode) return DEMO_LENGTH;
  return isFinite(audio.duration) ? audio.duration : 0;
}

function getPercent() {
  const duration = getDuration();
  return duration > 0 ? (getCurrentTime() / duration) * 100 : 0;
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sceneCoords(element) {
  const sceneRect = scene.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  const scale = sceneRect.width / SCENE_WIDTH;
  return {
    x: (rect.left + rect.width / 2 - sceneRect.left) / scale,
    y: (rect.top + rect.height / 2 - sceneRect.top) / scale
  };
}

function fitScene() {
  const scale = stageWrap.clientWidth / SCENE_WIDTH;
  scene.style.transform = "scale(" + scale + ")";
  stageWrap.style.height = SCENE_HEIGHT * scale + "px";
}




function playSong() {
  if (songFinished) resetExperience();

  startButton.hidden = true;

  if (demoMode) {
    startDemo();
    return;
  }

  audio.play()
    .then(function () {
      setPlayingState(true);
    })
    .catch(function (error) {
      if (audio.error || error.name === "NotSupportedError") {
        enableDemoMode();
        startDemo();
      } else {
        startButton.hidden = false;
        showMessage("Press play again to start");
      }
    });
}

function pauseSong() {
  if (demoMode) {
    stopDemo();
  } else {
    audio.pause();
  }
  setPlayingState(false);
}

function togglePlay() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

function setPlayingState(playing) {
  isPlaying = playing;
  playPauseBtn.textContent = playing ? "❚❚ Pause" : "► Play";
  playPauseBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
  scene.classList.toggle("is-playing", playing);
}

function finishSong() {
  if (songFinished) return;
  songFinished = true;
  pauseSong();
  setStage(STAGES[STAGES.length - 1].number);
  burstParticles(240, 120, 30);

  setTimeout(function () {
    if (!songFinished) return;   
    finalScene.hidden = false;
    finalReplayBtn.focus();
  }, 1500);
}



function enableDemoMode() {
  if (demoMode) return;
  demoMode = true;
  showMessage("No audio/song.mp3 found. Playing a silent demo.");
  updateProgress();
}

function startDemo() {
  if (demoTimer) return;
  setPlayingState(true);
  demoTimer = setInterval(function () {
    demoTime += 0.25 * DEMO_SPEED;
    if (demoTime >= DEMO_LENGTH) {
      demoTime = DEMO_LENGTH;
      tick();
      finishSong();
      return;
    }
    tick();
  }, 250);
}

function stopDemo() {
  clearInterval(demoTimer);
  demoTimer = null;
}



function tick() {
  updateProgress();
  updateLyrics();
  updateEnvironment();
}

function updateProgress() {
  const time = getCurrentTime();
  const duration = getDuration();
  const percent = getPercent();

  progressBar.value = percent;
  progressBar.style.setProperty("--fill", percent + "%");
  progressBar.setAttribute("aria-valuetext", formatTime(time) + " of " + formatTime(duration));

  currentTimeText.textContent = formatTime(time);
  totalTimeText.textContent = formatTime(duration);
}

function seekTo(percent) {
  const duration = getDuration();
  if (duration === 0) return;

  const newTime = (percent / 100) * duration;
  if (demoMode) {
    demoTime = newTime;
  } else {
    audio.currentTime = newTime;
  }

  if (newTime < duration) {
    songFinished = false;
    finalScene.hidden = true;
  }
  tick();
}




function updateLyrics() {
  const time = getCurrentTime();

  let index = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (time >= lyrics[i].time) {
      index = i;
    } else {
      break;
    }
  }

  if (index === currentLyricIndex) return;   
  currentLyricIndex = index;

  lyricPrev.textContent = index > 0 ? lyrics[index - 1].text : "";
  lyricCurrent.textContent = index >= 0 ? lyrics[index].text : "Press play to begin ♪";
  lyricNext.textContent = lyrics[index + 1] ? lyrics[index + 1].text : "";

  lyricCurrent.classList.toggle("is-final", index === lyrics.length - 1);

  lyricCurrent.classList.remove("lyric-pop");
  void lyricCurrent.offsetWidth;
  lyricCurrent.classList.add("lyric-pop");
}




function updateEnvironment() {
  const percent = getPercent();

  let newStage = STAGES[0].number;
  STAGES.forEach(function (stage) {
    if (percent >= stage.startPercent) newStage = stage.number;
  });

  if (songFinished) newStage = STAGES[STAGES.length - 1].number;

  if (newStage !== currentStage) setStage(newStage);
}

function setStage(stage) {
  const previous = currentStage;
  currentStage = stage;

  scene.dataset.stage = stage;
  document.body.dataset.stage = stage;

  character.classList.toggle("sitting", stage === 1);
  if (previous !== 0) walkCharacter();

  if (stage >= 2) setLamp(true);
  if (stage >= 3) openWindow();

  fillStars(stage);

  room.inert = stage >= 4;
  bigSky.inert = stage < 4;

  if (previous !== 0 && stage > previous) burstParticles(240, 120, 16);
}

function walkCharacter() {
  character.classList.add("walking");
  clearTimeout(walkTimer);
  walkTimer = setTimeout(function () {
    character.classList.remove("walking");
  }, 3000);
}

function fillStars(stage) {
  const target = STAR_COUNT[stage] || 0;
  const windowTarget = Math.min(target, WINDOW_STAR_LIMIT);

  while (windowStars.children.length < windowTarget) createStar(windowStars);
  while (skyStars.children.length < target) createStar(skyStars);
}




function createStar(container) {
  const clickable = Math.random() < 0.4;
  const star = document.createElement(clickable ? "button" : "span");

  star.className = "star";
  if (Math.random() < 0.3) star.classList.add("star-big");

  const maxTop = container === skyStars ? 70 : 90;
  star.style.left = (Math.random() * 94 + 3) + "%";
  star.style.top = (Math.random() * maxTop + 3) + "%";
  star.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";

  if (clickable) {
    star.type = "button";
    star.classList.add("star-clickable");
    star.setAttribute("aria-label", "Twinkling star");
    star.addEventListener("click", function () {
      handleStarClick(star);
    });
  } else {
    star.setAttribute("aria-hidden", "true");
  }

  container.appendChild(star);
  return star;
}

function handleStarClick(star) {
  star.classList.remove("star-glow");
  void star.offsetWidth;
  star.classList.add("star-glow");

  const point = sceneCoords(star);
  burstParticles(point.x, point.y, 10);
}

function burstParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    if (particles.children.length > 150) return;  

    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 12 + Math.random() * 30;

    particle.className = "particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.background = randomItem(PARTICLE_COLORS);
    particle.style.setProperty("--dx", Math.round(Math.cos(angle) * distance) + "px");
    particle.style.setProperty("--dy", Math.round(Math.sin(angle) * distance) + "px");
    particle.addEventListener("animationend", function () {
      particle.remove();
    });

    particles.appendChild(particle);
  }
}

function spawnFloatingParticle() {
  if (!isPlaying || currentStage < 3 || reduceMotion) return;
  if (particles.children.length > 150) return;

  const particle = document.createElement("span");
  particle.className = "particle-float";
  particle.style.left = Math.round(Math.random() * SCENE_WIDTH) + "px";
  particle.style.top = (SCENE_HEIGHT - 20) + "px";
  particle.style.background = randomItem(PARTICLE_COLORS);
  particle.style.setProperty("--dx", Math.round(Math.random() * 40 - 20) + "px");
  particle.addEventListener("animationend", function () {
    particle.remove();
  });

  particles.appendChild(particle);
}



function setLamp(on) {
  scene.classList.toggle("lamp-on", on);
  lampBtn.setAttribute("aria-pressed", String(on));
}

function toggleLamp() {
  const turnOn = !scene.classList.contains("lamp-on");
  setLamp(turnOn);
  showMessage(turnOn ? "Lamp on ☀" : "Lamp off ☾");
}

function openWindow() {
  if (scene.classList.contains("window-open")) return;
  scene.classList.add("window-open");
  windowBtn.setAttribute("aria-pressed", "true");

  for (let i = 0; i < 4 && windowStars.children.length < WINDOW_STAR_LIMIT + 6; i++) {
    createStar(windowStars);
  }
}

function toggleWindow() {
  if (scene.classList.contains("window-open")) {
    scene.classList.remove("window-open");
    windowBtn.setAttribute("aria-pressed", "false");
    showMessage("Window closed");
  } else {
    openWindow();
    showMessage("The night air feels nice ☆");
    burstParticles(100, 86, 12);
  }
}

function showTeddyBubble() {
  teddyBubble.textContent = randomItem(TEDDY_MESSAGES);
  teddyBubble.hidden = false;

  teddyBtn.classList.remove("bounce");
  void teddyBtn.offsetWidth;
  teddyBtn.classList.add("bounce");

  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(function () {
    teddyBubble.hidden = true;
  }, 2500);
}

function clickRadio() {
  showMessage("Now playing: The Only Exception");
  burstParticles(232, 90, 10);
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.add("show");

  clearTimeout(messageTimer);
  messageTimer = setTimeout(function () {
    messageBox.classList.remove("show");
  }, 2500);
}




function resetExperience() {
  pauseSong();

  demoTime = 0;
  if (!demoMode) {
    try { audio.currentTime = 0; } catch (error) { /* audio not ready yet */ }
  }

  songFinished = false;
  currentStage = 0;
  currentLyricIndex = -1;

  setLamp(false);
  scene.classList.remove("window-open");
  windowBtn.setAttribute("aria-pressed", "false");
  windowStars.innerHTML = "";
  skyStars.innerHTML = "";
  particles.innerHTML = "";

  character.classList.add("sitting");
  character.classList.remove("walking");

  finalScene.hidden = true;
  teddyBubble.hidden = true;
  startButton.hidden = false;

  tick();   
}

function replay() {
  resetExperience();
  playSong();
}




function setupEvents() {
  startButton.addEventListener("click", playSong);
  playPauseBtn.addEventListener("click", togglePlay);
  replayBtn.addEventListener("click", replay);
  finalReplayBtn.addEventListener("click", replay);

  progressBar.addEventListener("input", function () {
    seekTo(Number(progressBar.value));
  });

  volumeBar.addEventListener("input", function () {
    audio.volume = Number(volumeBar.value);
    volumeBar.style.setProperty("--fill", volumeBar.value * 100 + "%");
  });

  lampBtn.addEventListener("click", toggleLamp);
  windowBtn.addEventListener("click", toggleWindow);
  teddyBtn.addEventListener("click", showTeddyBubble);
  radioBtn.addEventListener("click", clickRadio);

  audio.addEventListener("timeupdate", tick);
  audio.addEventListener("loadedmetadata", updateProgress);
  audio.addEventListener("ended", finishSong);
  audio.addEventListener("error", enableDemoMode);
  audio.addEventListener("pause", function () {
    if (!demoMode) setPlayingState(false);
  });

  document.addEventListener("keydown", function (event) {
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "BUTTON" || tag === "TEXTAREA") return;
    if (event.code === "Space" || event.key.toLowerCase() === "k") {
      event.preventDefault();
      togglePlay();
    }
  });

  window.addEventListener("resize", fitScene);

  setInterval(spawnFloatingParticle, 600);
}




function init() {
  audio.volume = Number(volumeBar.value);
  volumeBar.style.setProperty("--fill", volumeBar.value * 100 + "%");

  fitScene();
  setupEvents();
  resetExperience();
}

init();
