// -------- CONFIGURAÇÃO DO PORTFÓLIO --------
// Edite aqui os dados pessoais do portfólio.
const portfolioConfig = {
  github: {
    username: 'p3dr0c4s',
    enabled: true,
    limit: 5,
    excludedRepos: ['birthday-magic', 'FishingCat', 'Portif-lio-v.2']
  },
  contactLinks: [
    { label: 'GitHub', value: '@p3dr0c4s', url: 'https://github.com/p3dr0c4s' },
    { label: 'E-mail', value: 'luitgardspedro@gmail.com', url: 'mailto:luitgardspedro@gmail.com' },
    { label: 'WhatsApp', value: 'Falar comigo', url: 'https://wa.me/5561992404314?text=Ol%C3%A1%20Pedro!%20Vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.' }
  ],
  fallbackProjects: [
    { title: 'Sonora', type: 'GitHub', description: 'Projeto publicado no GitHub.', tags: ['JavaScript'], icon: '♫', year: '2026', url: 'https://github.com/p3dr0c4s/Sonora' },
    { title: 'Ping-Pong', type: 'GitHub', description: 'Projeto publicado no GitHub.', tags: ['JavaScript'], icon: '↔', year: '2026', url: 'https://github.com/p3dr0c4s/Ping-Pong' },
    { title: 'SpendWise', type: 'GitHub', description: 'Projeto publicado no GitHub.', tags: ['JavaScript'], icon: '◈', year: '2026', url: 'https://github.com/p3dr0c4s/SpendWise' }
  ]
};

// -------- ESTADO DO SITE --------
let projects = [...portfolioConfig.fallbackProjects];
let activeProjectFilter = 'Todos';
const projectsGrid = document.querySelector('#projects-grid');
const contactLinks = document.querySelector('#contact-links');
const filterButtons = document.querySelectorAll('.filter-button');
const themeToggle = document.querySelector('#theme-toggle');
const canvas = document.querySelector('#particle-canvas');
const context = canvas ? canvas.getContext('2d') : null;
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let particles = [];
let particleColor = '';
let particleFrameId = 0;
let particlePixelRatio = 1;

// -------- FUNÇÕES DE DADOS --------
function normalizeProject(repo) {
  const projectName = typeof repo.name === 'string' && repo.name.trim() ? repo.name : 'Projeto sem nome';
  const updatedAt = new Date(repo.updated_at || Date.now());
  const knownProject = portfolioConfig.fallbackProjects.find(
    (project) => project.title.toLowerCase() === projectName.toLowerCase()
  );
  const repositoryUrl = typeof repo.html_url === 'string' && isGitHubUrl(repo.html_url) ? repo.html_url : '';
  const description = typeof repo.description === 'string' && repo.description.trim()
    ? repo.description
    : knownProject ? knownProject.description : 'Projeto publicado no GitHub.';
  const tags = knownProject
    ? knownProject.tags
    : typeof repo.language === 'string' && repo.language.trim() ? [repo.language] : ['GitHub'];

  return {
    title: projectName,
    type: 'GitHub',
    description,
    tags,
    icon: knownProject ? knownProject.icon : '↗',
    year: Number.isNaN(updatedAt.getTime()) ? '' : String(updatedAt.getFullYear()),
    url: repositoryUrl
  };
}

function isGitHubUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com';
  } catch {
    return false;
  }
}

async function loadProjectsFromGitHub() {
  const { github } = portfolioConfig;

  if (!github.enabled || !github.username) {
    return;
  }

  try {
    const perPage = Math.min(100, github.limit + github.excludedRepos.length);
    const response = await fetch(`https://api.github.com/users/${github.username}/repos?sort=updated&per_page=${perPage}`);
    if (!response.ok) {
      throw new Error('GitHub API indisponível');
    }

    const repos = await response.json();
    const excludedNames = new Set(github.excludedRepos.map((name) => name.toLowerCase()));
    projects = (Array.isArray(repos) ? repos : [])
      .filter((repo) => repo && typeof repo.name === 'string' && !repo.fork)
      .filter((repo) => !excludedNames.has(repo.name.toLowerCase()))
      .slice(0, github.limit)
      .map(normalizeProject);

    if (projects.length === 0) {
      projects = [...portfolioConfig.fallbackProjects];
    }
    renderProjects(activeProjectFilter);
  } catch (error) {
    console.warn('Falha ao carregar projetos do GitHub, usando os dados locais:', error);
    projects = [...portfolioConfig.fallbackProjects];
    renderProjects(activeProjectFilter);
  }
}

function renderProjects(filter = 'Todos') {
  const filteredProjects = filter === 'Todos' ? projects : projects.filter((project) => project.type === filter);
  projectsGrid.replaceChildren();
  projectsGrid.classList.toggle('projects-grid--odd', filteredProjects.length > 1 && filteredProjects.length % 2 === 1);

  if (filteredProjects.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'projects-empty';
    emptyState.setAttribute('role', 'status');
    emptyState.textContent = 'Nenhum projeto encontrado por aqui.';
    projectsGrid.append(emptyState);
    return;
  }

  filteredProjects.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = 'project-card';

    const top = document.createElement('div');
    top.className = 'project-top';
    const meta = document.createElement('span');
    meta.className = 'project-meta';
    meta.textContent = [project.type, project.year].filter(Boolean).join(' · ');
    const projectIndex = document.createElement('span');
    projectIndex.className = 'project-index';
    projectIndex.textContent = String(index + 1).padStart(2, '0');
    top.append(meta, projectIndex);

    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = project.title;
    const description = document.createElement('p');
    description.className = 'project-description';
    description.textContent = project.description;
    details.append(title, description);

    const bottom = document.createElement('div');
    bottom.className = 'project-bottom';
    const tags = document.createElement('div');
    tags.className = 'project-tags';
    (Array.isArray(project.tags) ? project.tags : []).forEach((tag) => {
      const tagElement = document.createElement('span');
      tagElement.className = 'project-tag';
      tagElement.textContent = tag;
      tags.append(tagElement);
    });
    bottom.append(tags);

    if (isGitHubUrl(project.url)) {
      const link = document.createElement('a');
      link.className = 'project-link';
      link.href = project.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'ver projeto ↗';
      bottom.append(link);
    }

    const art = document.createElement('span');
    art.className = 'project-art';
    art.setAttribute('aria-hidden', 'true');
    art.textContent = project.icon;
    card.append(top, details, bottom, art);
    projectsGrid.append(card);
  });
}

function renderContacts() {
  contactLinks.replaceChildren();
  portfolioConfig.contactLinks.forEach((contact) => {
    const isExternal = contact.url.startsWith('https://');
    const link = document.createElement('a');
    link.className = 'contact-link';
    link.href = contact.url;
    if (isExternal) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const label = document.createElement('span');
    label.textContent = contact.label;
    const value = document.createTextNode(contact.value);
    const indicator = document.createElement('span');
    indicator.textContent = isExternal ? '↗' : '→';
    link.append(label, value, indicator);
    contactLinks.append(link);
  });
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  const normalizedTheme = isDark ? 'dark' : 'light';
  document.body.dataset.theme = normalizedTheme;
  particleColor = getComputedStyle(document.body).getPropertyValue('--accent').trim();

  try {
    localStorage.setItem('portfolio-theme', normalizedTheme);
  } catch (error) {
    console.warn('Não foi possível salvar a preferência de tema:', error);
  }

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (themeIcon) {
      themeIcon.textContent = isDark ? '☀' : '☾';
    }
    themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }
}

// -------- EVENTOS --------
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeProjectFilter = button.dataset.filter || 'Todos';
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    renderProjects(activeProjectFilter);
  });
});

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
}

// -------- THEME --------
let savedTheme = null;
try {
  const storedTheme = localStorage.getItem('portfolio-theme');
  savedTheme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null;
} catch (error) {
  console.warn('Não foi possível ler a preferência de tema:', error);
}
const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(preferredTheme);

// -------- PARTÍCULAS --------
function resizeCanvas() {
  if (!canvas || !context) {
    return;
  }

  particlePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * particlePixelRatio);
  canvas.height = Math.round(window.innerHeight * particlePixelRatio);
  context.setTransform(particlePixelRatio, 0, 0, particlePixelRatio, 0, 0);
  particles = Array.from({ length: Math.min(55, Math.floor(window.innerWidth / 24)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.7 + .4,
    velocity: Math.random() * .25 + .08
  }));
}

function handleCanvasResize() {
  resizeCanvas();
  if (motionPreference.matches) {
    drawParticles();
  }
}

function drawParticles() {
  if (!canvas || !context) {
    return;
  }

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = particleColor;
  context.globalAlpha = 0.4;
  particles.forEach((particle) => {
    particle.y -= particle.velocity;
    if (particle.y < -5) particle.y = window.innerHeight + 5;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  });
  if (!motionPreference.matches) {
    particleFrameId = window.requestAnimationFrame(drawParticles);
  }
}

// -------- INICIALIZAÇÃO --------
renderProjects();
renderContacts();
resizeCanvas();
drawParticles();
if (canvas && context) {
  window.addEventListener('resize', handleCanvasResize);
  const handleMotionPreferenceChange = (event) => {
    if (event.matches && particleFrameId) {
      window.cancelAnimationFrame(particleFrameId);
      particleFrameId = 0;
      drawParticles();
    } else if (!event.matches && !particleFrameId) {
      particleFrameId = window.requestAnimationFrame(drawParticles);
    }
  };
  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', handleMotionPreferenceChange);
  } else {
    motionPreference.addListener(handleMotionPreferenceChange);
  }
} else {
  console.warn('O canvas de partículas não está disponível neste navegador.');
}
loadProjectsFromGitHub();

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// -------- VITROLA DE BORDO --------
const melodies = [
  { title: 'Brisa tranquila', mood: 'Brisa tranquila', bpm: 76, root: 60, scale: [0, 2, 4, 7, 9], notes: [0, 2, 4, 2, 0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 4, 2], wave: 'sine' },
  { title: 'Mapa das estrelas', mood: 'Noite estrelada', bpm: 88, root: 62, scale: [0, 2, 3, 7, 9], notes: [0, 3, 4, 3, 1, 3, 4, 7, 4, 3, 1, 0, 1, 3, 4, 3], wave: 'triangle' },
  { title: 'Porto ao amanhecer', mood: 'Sol nascendo', bpm: 96, root: 65, scale: [0, 2, 4, 5, 7, 9], notes: [0, 2, 4, 5, 4, 2, 1, 2, 4, 5, 7, 5, 4, 2, 1, 0], wave: 'sine' },
  { title: 'Dança dos marujos', mood: 'Passos ligeiros', bpm: 118, root: 60, scale: [0, 2, 4, 7, 9], notes: [0, 4, 2, 4, 7, 4, 2, 0, 0, 4, 2, 4, 9, 7, 4, 2], wave: 'square' },
  { title: 'Segredo da ilha', mood: 'Mistério no horizonte', bpm: 72, root: 57, scale: [0, 3, 5, 7, 10], notes: [0, 3, 5, 3, 0, 2, 5, 7, 5, 3, 2, 0, 3, 5, 7, 10], wave: 'triangle' },
  { title: 'Chuva no convés', mood: 'Chuva mansa', bpm: 82, root: 62, scale: [0, 2, 5, 7, 9], notes: [0, 2, 4, 2, 1, 2, 4, 7, 4, 2, 1, 0, 1, 2, 4, 2], wave: 'sine' },
  { title: 'Corrente favorável', mood: 'Aventura adiante', bpm: 108, root: 64, scale: [0, 2, 4, 7, 9], notes: [0, 2, 4, 7, 4, 2, 4, 9, 7, 4, 2, 4, 7, 9, 7, 4], wave: 'triangle' },
  { title: 'Baú de ouro', mood: 'Pequena celebração', bpm: 100, root: 67, scale: [0, 2, 4, 7, 11], notes: [0, 4, 7, 4, 2, 4, 7, 11, 7, 4, 2, 0, 2, 4, 7, 4], wave: 'sine' },
  { title: 'Lua sobre o mar', mood: 'Maré serena', bpm: 68, root: 60, scale: [0, 2, 5, 7, 9], notes: [0, 2, 4, 2, 0, 2, 5, 7, 5, 2, 0, 2, 4, 5, 7, 5], wave: 'sine' },
  { title: 'Última ilha', mood: 'Despedida doce', bpm: 92, root: 65, scale: [0, 2, 3, 7, 10], notes: [0, 2, 3, 5, 3, 2, 0, 3, 5, 7, 5, 3, 2, 0, 2, 0], wave: 'triangle' }
];

const trackSelect = document.querySelector('#track-select');
const playToggle = document.querySelector('#play-toggle');
const nextTrack = document.querySelector('#next-track');
const playerStatus = document.querySelector('#player-status');
const trackMood = document.querySelector('#track-mood');
const volumeControl = document.querySelector('#volume-control');
const recordPlayer = document.querySelector('#record-player');
let audioContext;
let masterVolume;
let playbackTimer;
let isPlaying = false;
let isStartingPlayback = false;
let currentStep = 0;
let nextNoteTime = 0;

function updateTrackDetails() {
  const track = melodies[Number(trackSelect.value)] || melodies[0];
  trackMood.textContent = `${track.mood} · ${track.bpm} BPM`;
}

function playTone(midiNote, startTime, duration, waveform, volume) {
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = waveform;
  oscillator.frequency.value = 440 * 2 ** ((midiNote - 69) / 12);
  envelope.gain.setValueAtTime(0.0001, startTime);
  envelope.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
  envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(envelope);
  envelope.connect(masterVolume);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

function scheduleMelodyStep() {
  const track = melodies[Number(trackSelect.value)] || melodies[0];
  const stepDuration = 60 / track.bpm / 2;
  const note = track.notes[currentStep % track.notes.length];

  if (note !== null && note !== undefined) {
    playTone(track.root + track.scale[note % track.scale.length] + 12, nextNoteTime, stepDuration * 0.82, track.wave, 0.16);
  }
  if (currentStep % 4 === 0) {
    const bassDegree = currentStep % 8 === 0 ? 0 : 2;
    playTone(track.root - 12 + track.scale[bassDegree % track.scale.length], nextNoteTime, stepDuration * 1.65, 'sine', 0.13);
  }

  nextNoteTime += stepDuration;
  currentStep += 1;
}

function updatePlaybackState(playing) {
  isPlaying = playing;
  playToggle.textContent = playing ? 'Ⅱ' : '▶';
  playToggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Tocar música');
  playToggle.setAttribute('aria-pressed', String(playing));
  playerStatus.textContent = playing ? 'TOCANDO' : 'EM SILÊNCIO';
  recordPlayer.classList.toggle('is-playing', playing);
}

function stopMelody() {
  window.clearInterval(playbackTimer);
  playbackTimer = null;
  updatePlaybackState(false);
}

async function startMelody() {
  if (isPlaying || isStartingPlayback) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    playerStatus.textContent = 'ÁUDIO INDISPONÍVEL';
    console.warn('Este navegador não oferece suporte à reprodução de áudio.');
    return;
  }

  isStartingPlayback = true;
  try {
    if (!audioContext) {
      audioContext = new AudioContextClass();
      masterVolume = audioContext.createGain();
      masterVolume.gain.value = Number(volumeControl.value) / 100 * 0.35;
      masterVolume.connect(audioContext.destination);
    }
    await audioContext.resume();
    currentStep = 0;
    nextNoteTime = audioContext.currentTime + 0.05;
    updatePlaybackState(true);
    playbackTimer = window.setInterval(() => {
      const track = melodies[Number(trackSelect.value)] || melodies[0];
      const stepDuration = 60 / track.bpm / 2;
      if (nextNoteTime < audioContext.currentTime - stepDuration) {
        const missedSteps = Math.ceil((audioContext.currentTime - nextNoteTime) / stepDuration);
        currentStep += missedSteps;
        nextNoteTime += missedSteps * stepDuration;
      }
      while (nextNoteTime < audioContext.currentTime + 0.12) {
        scheduleMelodyStep();
      }
    }, 40);
  } catch (error) {
    stopMelody();
    playerStatus.textContent = 'ERRO AO REPRODUZIR';
    console.error('Não foi possível iniciar a vitrola:', error);
  } finally {
    isStartingPlayback = false;
  }
}

melodies.forEach((track, index) => {
  const option = document.createElement('option');
  option.value = String(index);
  option.textContent = track.title;
  trackSelect.append(option);
});
updateTrackDetails();

playToggle.addEventListener('click', () => {
  if (isPlaying) {
    stopMelody();
  } else {
    startMelody();
  }
});

trackSelect.addEventListener('change', () => {
  updateTrackDetails();
  if (isPlaying) {
    stopMelody();
    startMelody();
  }
});

nextTrack.addEventListener('click', () => {
  trackSelect.selectedIndex = (trackSelect.selectedIndex + 1) % melodies.length;
  trackSelect.dispatchEvent(new Event('change'));
});

volumeControl.addEventListener('input', () => {
  if (masterVolume && audioContext) {
    masterVolume.gain.setTargetAtTime(Number(volumeControl.value) / 100 * 0.35, audioContext.currentTime, 0.04);
  }
});
