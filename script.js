// -------- CONFIGURAÇÃO DO PORTFÓLIO --------
// Edite aqui os dados pessoais do portfólio.
const portfolioConfig = {
  github: {
    username: 'p3dr0c4s',
    enabled: true,
    limit: 5,
    excludedRepos: ['fishingcat', 'fishing-cat']
  },
  profile: {
    name: 'Pedro Henrique',
    fullName: 'Pedro Henrique Moreira Luitgards',
    role: 'Front-end Developer'
  },
  contactLinks: [
    { label: 'GitHub', value: '@p3dr0c4s', url: 'https://github.com/p3dr0c4s' },
    { label: 'E-mail', value: 'luitgardspedro@gmail.com', url: 'mailto:luitgardspedro@gmail.com' },
    { label: 'WhatsApp', value: 'Falar comigo', url: 'https://wa.me/5561992404314?text=Ol%C3%A1%20Pedro!%20Vi%20seu%20portf%C3%B3lio%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto.' }
  ],
  fallbackProjects: [
    { title: 'birthday-magic', type: 'GitHub', description: 'Pequena experiência de aniversário com balões, personagem animado, vela, confetes, mensagem final e uma surpresa escondida.', tags: ['UI', 'Aniversário'], icon: '◌', year: '2025', url: 'https://github.com/p3dr0c4s/birthday-magic' },
    { title: 'HOTEL.EXE', type: 'GitHub', description: 'Sistema fictício de gerenciamento hoteleiro em front-end puro, com quartos, hóspedes, reservas, ocorrências e visual corporativo.', tags: ['Dashboard', 'UI', 'JavaScript'], icon: '↗', year: '2025', url: 'https://github.com/p3dr0c4s/HOTEL.EXE' },
    { title: 'METRO.OS', type: 'GitHub', description: 'Central de operações metroviárias fictícia com dashboard de linhas, estações, trens, ocorrências e interface inspirada em sistemas reais.', tags: ['Dashboard', 'UX', 'Interface'], icon: '⌁', year: '2025', url: 'https://github.com/p3dr0c4s/METRO.OS' },
    { title: 'LAB-404', type: 'GitHub', description: 'Laboratório experimental fictício com experimentos aleatórios, terminal de logs, radiação, caos, emergência e easter egg escondido.', tags: ['Experimento', 'JavaScript'], icon: '◇', year: '2025', url: 'https://github.com/p3dr0c4s/LAB-404' }
  ]
};

// -------- ESTADO DO SITE --------
let projects = [...portfolioConfig.fallbackProjects];
const projectsGrid = document.querySelector('#projects-grid');
const contactLinks = document.querySelector('#contact-links');
const filterButtons = document.querySelectorAll('.filter-button');
const themeToggle = document.querySelector('#theme-toggle');

// -------- FUNÇÕES DE DADOS --------
function normalizeProject(repo) {
  return {
    title: repo.name || 'Projeto sem nome',
    type: 'GitHub',
    description: repo.description || 'Projeto publicado no GitHub.',
    tags: repo.language ? [repo.language] : ['GitHub'],
    icon: '↗',
    year: new Date(repo.updated_at || Date.now()).getFullYear().toString(),
    url: repo.html_url || '#'
  };
}

async function loadProjectsFromGitHub() {
  const { github } = portfolioConfig;

  if (!github.enabled || !github.username) {
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/users/${github.username}/repos?sort=updated&per_page=${github.limit}`);
    if (!response.ok) {
      throw new Error('GitHub API indisponível');
    }

    const repos = await response.json();
    if (!Array.isArray(repos) || repos.length === 0) {
      return;
    }

    projects = repos
      .filter((repo) => !repo.fork)
      .filter((repo) => !github.excludedRepos.includes(repo.name.toLowerCase()))
      .slice(0, github.limit)
      .map(normalizeProject);

    renderProjects();
  } catch (error) {
    console.warn('Falha ao carregar projetos do GitHub, usando os dados locais:', error);
    projects = [...portfolioConfig.fallbackProjects];
    renderProjects();
  }
}

function renderProjects(filter = 'Todos') {
  const filteredProjects = filter === 'Todos' ? projects : projects.filter((project) => project.type === filter);

  projectsGrid.innerHTML = filteredProjects.map((project, index) => `
    <article class="project-card">
      <div class="project-top"><span class="project-meta">${project.type} · ${project.year}</span><span class="project-index">0${index + 1}</span></div>
      <div><h3>${project.title}</h3><p class="project-description">${project.description}</p></div>
      <div class="project-bottom">
        <div class="project-tags">${project.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join('')}</div>
        <a class="project-link" href="${project.url}" target="_blank" rel="noreferrer">ver projeto ↗</a>
      </div>
      <span class="project-art" aria-hidden="true">${project.icon}</span>
    </article>
  `).join('');
}

function renderContacts() {
  contactLinks.innerHTML = portfolioConfig.contactLinks.map((contact) => {
    const isExternal = contact.url.startsWith('http');
    return `
      <a class="contact-link" href="${contact.url}" ${isExternal ? 'target="_blank" rel="noreferrer"' : ''}>
        <span>${contact.label}</span>${contact.value}<span>${isExternal ? '↗' : '→'}</span>
      </a>
    `;
  }).join('');
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = theme;
  localStorage.setItem('portfolio-theme', theme);

  if (themeToggle) {
    themeToggle.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }
}

// -------- EVENTOS --------
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    renderProjects(button.dataset.filter);
  });
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

// -------- THEME --------
const savedTheme = localStorage.getItem('portfolio-theme');
const preferredTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(preferredTheme);

// -------- PARTÍCULAS --------
const canvas = document.querySelector('#particle-canvas');
const context = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  particles = Array.from({ length: Math.min(55, Math.floor(window.innerWidth / 24)) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.7 + .4,
    velocity: Math.random() * .25 + .08
  }));
}

function drawParticles() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const color = getComputedStyle(document.body).getPropertyValue('--accent').trim();
  context.fillStyle = color;
  particles.forEach((particle) => {
    particle.y -= particle.velocity;
    if (particle.y < -5) particle.y = canvas.height + 5;
    context.globalAlpha = .4;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fill();
  });
  requestAnimationFrame(drawParticles);
}

// -------- INICIALIZAÇÃO --------
renderProjects();
renderContacts();
resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);
loadProjectsFromGitHub();
