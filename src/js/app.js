const API_BASE = '/api';

const pages = {
  dashboard: '<div class="page active"><h1>📊 Дашборд</h1><p class="subtitle">Обзор вашей онлайн-школы</p><div class="stats-grid"><div class="stat-card"><div class="stat-label">Активных школ</div><div class="stat-value" id="statSchools">0</div><div class="stat-change">↑ Запущено</div></div><div class="stat-card"><div class="stat-label">Активных воронок</div><div class="stat-value" id="statFunnels">0</div><div class="stat-change">↑ Работает</div></div><div class="stat-card"><div class="stat-label">Запущенных курсов</div><div class="stat-value" id="statCourses">0</div><div class="stat-change">↑ Публикация</div></div><div class="stat-card"><div class="stat-label">Общий доход</div><div class="stat-value">₽0</div><div class="stat-change">↑ Растёт</div></div></div><div class="section"><div class="section-header"><div class="section-title">🚀 Быстрый запуск</div></div><div class="grid-3"><div class="course-card" onclick="showPage(\'launch-course\')" style="cursor:pointer"><div class="course-title">🚀 Запустить курс</div><div class="course-desc">Создайте и опубликуйте курс</div></div><div class="course-card" onclick="showPage(\'launch-school\')" style="cursor:pointer"><div class="course-title">🏫 Запустить школу</div><div class="course-desc">Откройте онлайн-школу</div></div><div class="course-card" onclick="showPage(\'launch-funnel\')" style="cursor:pointer"><div class="course-title">🎯 Запустить воронку</div><div class="course-desc">Создайте воронку продаж</div></div></div></div></div>',

  courses: '<div class="page active"><h1> Курсы</h1><p class="subtitle">Управление образовательными программами</p><div class="grid-3" id="coursesList"><p style="color:var(--text-muted); text-align:center;">Загрузка...</p></div></div>',

  'launch-course': '<div class="page active"><h1>🚀 Запуск курса</h1><p class="subtitle">Создайте и опубликуйте свой курс</p><div class="section"><div class="section-header"><div class="section-title">📝 Информация о курсе</div></div><div class="form-group"><label>Название курса</label><input type="text" id="courseName" placeholder="Например: Python для начинающих"></div><div class="form-group"><label>Описание</label><textarea id="courseDesc" placeholder="Опишите ваш курс..." style="width:100%;padding:15px;background:rgba(0,0,0,0.5);border:2px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:1em;min-height:120px;resize:vertical"></textarea></div><div class="form-group"><label>Цена (₽)</label><input type="number" id="coursePrice" placeholder="9900" value="9900"></div><button class="btn btn-primary" onclick="launchCourse()" style="width:100%;padding:15px;font-size:1.1em">🚀 Запустить курс</button></div></div>',

  'launch-school': '<div class="page active"><h1>🏫 Запуск школы</h1><p class="subtitle">Откройте свою онлайн-школу</p><div class="section"><div class="section-header"><div class="section-title">🏫 Информация о школе</div></div><div class="form-group"><label>Название школы</label><input type="text" id="schoolName" placeholder="Например: NEXUS Academy"></div><div class="form-group"><label>Ниша</label><select id="schoolNiche"><option value="IT">💻 IT и программирование</option><option value="Дизайн">🎨 Дизайн и творчество</option><option value="Маркетинг">📈 Маркетинг и бизнес</option><option value="Здоровье">🧘 Здоровье и саморазвитие</option><option value="Образование">🎓 Образование и языки</option></select></div><div class="form-group"><label>Описание</label><textarea id="schoolDesc" placeholder="Расскажите о вашей школе..." style="width:100%;padding:15px;background:rgba(0,0,0,0.5);border:2px solid var(--border);border-radius:8px;color:var(--text);font-family:inherit;font-size:1em;min-height:120px;resize:vertical"></textarea></div><button class="btn btn-primary" onclick="launchSchool()" style="width:100%;padding:15px;font-size:1.1em">🏫 Запустить школу</button></div></div>',

  'launch-funnel': '<div class="page active"><h1>🎯 Запуск воронки</h1><p class="subtitle">Создайте воронку продаж</p><div class="section"><div class="section-header"><div class="section-title">🎯 Настройка воронки</div></div><div class="form-group"><label>Название воронки</label><input type="text" id="funnelName" placeholder="Например: Прогрев → Продажа"></div><div class="form-group"><label>Количество этапов</label><select id="funnelSteps"><option value="3">3 этапа</option><option value="4" selected>4 этапа</option><option value="5">5 этапов</option></select></div><div id="funnelStepsConfig" style="margin:20px 0"></div><button class="btn btn-primary" onclick="launchFunnel()" style="width:100%;padding:15px;font-size:1.1em">🎯 Запустить воронку</button></div></div>',

  'my-schools': '<div class="page active"><h1> Мои школы</h1><p class="subtitle">Ваши запущенные школы</p><div class="grid-3" id="schoolsList"><p style="color:var(--text-muted); text-align:center;">Загрузка...</p></div></div>',

  'my-funnels': '<div class="page active"><h1>📈 Мои воронки</h1><p class="subtitle">Ваши запущенные воронки</p><div class="grid-3" id="funnelsList"><p style="color:var(--text-muted); text-align:center;">Загрузка...</p></div></div>'
};

function showToast(icon, text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastText').textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showPage(pageName) {
  if (pages[pageName]) {
    document.getElementById('mainContent').innerHTML = pages[pageName];
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.querySelector('[data-page="' + pageName + '"]');
    if (navItem) navItem.classList.add('active');
    
    setTimeout(() => {
      if (pageName === 'dashboard') loadDashboardStats();
      if (pageName === 'courses') loadCourses('coursesList');
      if (pageName === 'launch-funnel') renderFunnelSteps();
      if (pageName === 'my-schools') loadSchools();
      if (pageName === 'my-funnels') loadFunnels();
    }, 100);
  }
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    showPage(item.dataset.page);
  });
});

async function loadDashboardStats() {
  try {
    const schoolsRes = await fetch(API_BASE + '/schools');
    const schoolsData = await schoolsRes.json();
    if (schoolsData.success) {
      document.getElementById('statSchools').textContent = schoolsData.data.length;
    }
    
    const funnelsRes = await fetch(API_BASE + '/funnels');
    const funnelsData = await funnelsRes.json();
    if (funnelsData.success) {
      document.getElementById('statFunnels').textContent = funnelsData.data.length;
    }
    
    const coursesRes = await fetch(API_BASE + '/courses');
    const coursesData = await coursesRes.json();
    if (coursesData.success) {
      const launched = coursesData.data.filter(c => c.isLaunched).length;
      document.getElementById('statCourses').textContent = launched;
    }
  } catch (e) { console.error(e); }
}

async function loadCourses(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Загрузка...</p>';
  try {
    const res = await fetch(API_BASE + '/courses?t=' + Date.now());
    const data = await res.json();
    if (data.success) {
      container.innerHTML = data.data.map(c => '<div class="course-card"><span class="badge ' + (c.isLaunched ? 'badge-success' : 'badge-info') + '">' + (c.isLaunched ? '✅ Запущен' : ' Не запущен') + '</span><div class="course-title">' + c.title + '</div><div class="course-desc">' + (c.description || 'Описание курса') + '</div><div class="course-stats"><span>💰 ₽' + c.price + '</span><span>👥 ' + c.students + ' уч.</span></div>' + (!c.isLaunched ? '<button class="btn btn-primary btn-small" style="margin-top:10px;width:100%" onclick="launchCourseById(' + c.id + ')"> Запустить</button>' : '') + '</div>').join('');
    }
  } catch (err) { container.innerHTML = '<p style="color:var(--danger)">Ошибка загрузки</p>'; }
}

async function launchCourse() {
  const name = document.getElementById('courseName').value.trim();
  const desc = document.getElementById('courseDesc').value.trim();
  const price = parseInt(document.getElementById('coursePrice').value) || 9900;
  
  if (!name) return showToast('️', 'Введите название курса');
  
  try {
    const res = await fetch(API_BASE + '/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name, description: desc, price: price })
    });
    const data = await res.json();
    if (data.success) {
      showToast('', 'Курс "' + name + '" создан! Теперь запустите его.');
      setTimeout(() => showPage('courses'), 1500);
    }
  } catch (e) { showToast('❌', 'Ошибка создания курса'); }
}

async function launchCourseById(courseId) {
  try {
    const res = await fetch(API_BASE + '/courses/' + courseId + '/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🚀', data.message);
      loadCourses('coursesList');
    }
  } catch (e) { showToast('❌', 'Ошибка запуска курса'); }
}

async function launchSchool() {
  const name = document.getElementById('schoolName').value.trim();
  const niche = document.getElementById('schoolNiche').value;
  const desc = document.getElementById('schoolDesc').value.trim();
  
  if (!name) return showToast('⚠️', 'Введите название школы');
  
  try {
    const res = await fetch(API_BASE + '/school/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, niche: niche, description: desc })
    });
    const data = await res.json();
    if (data.success) {
      showToast('🏫', 'Школа "' + name + '" запущена!');
      setTimeout(() => showPage('my-schools'), 1500);
    }
  } catch (e) { showToast('❌', 'Ошибка запуска школы'); }
}

function renderFunnelSteps() {
  const stepsCount = parseInt(document.getElementById('funnelSteps').value) || 4;
  const container = document.getElementById('funnelStepsConfig');
  if (!container) return;
  
  const defaultSteps = ['Лендинг', 'Email', 'Вебинар', 'Продажа', 'Допродажа'];
  let html = '';
  for (let i = 0; i < stepsCount; i++) {
    html += '<div class="form-group"><label>Этап ' + (i + 1) + '</label><input type="text" id="funnelStep' + i + '" value="' + (defaultSteps[i] || 'Этап ' + (i+1)) + '" placeholder="Название этапа"></div>';
  }
  container.innerHTML = html;
}

document.addEventListener('change', function(e) {
  if (e.target && e.target.id === 'funnelSteps') {
    renderFunnelSteps();
  }
});

async function launchFunnel() {
  const name = document.getElementById('funnelName').value.trim();
  const stepsCount = parseInt(document.getElementById('funnelSteps').value) || 4;
  
  if (!name) return showToast('⚠️', 'Введите название воронки');
  
  const steps = [];
  for (let i = 0; i < stepsCount; i++) {
    const stepName = document.getElementById('funnelStep' + i).value.trim();
    if (stepName) {
      steps.push({ name: stepName, conversion: Math.max(10, 100 - (i * 20)) });
    }
  }
  
  try {
    const res = await fetch(API_BASE + '/funnels/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, steps: steps })
    });
    const data = await res.json();
    if (data.success) {
      showToast('', 'Воронка "' + name + '" запущена!');
      setTimeout(() => showPage('my-funnels'), 1500);
    }
  } catch (e) { showToast('❌', 'Ошибка запуска воронки'); }
}

async function loadSchools() {
  const container = document.getElementById('schoolsList');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Загрузка...</p>';
  try {
    const res = await fetch(API_BASE + '/schools');
    const data = await res.json();
    if (data.success) {
      if (data.data.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">У вас пока нет запущенных школ. <a href="#" onclick="showPage(\'launch-school\')" style="color:var(--gold)">Запустить школу</a></p>';
      } else {
        container.innerHTML = data.data.map(s => '<div class="course-card"><span class="badge badge-success">✅ Активна</span><div class="course-title">🏫 ' + s.name + '</div><div class="course-desc">Ниша: ' + s.niche + '</div><div class="course-stats"><span>📅 ' + new Date(s.launchedAt).toLocaleDateString('ru-RU') + '</span><span>👥 ' + s.students + ' уч.</span></div></div>').join('');
      }
    }
  } catch (e) { container.innerHTML = '<p style="color:var(--danger)">Ошибка загрузки</p>'; }
}

async function loadFunnels() {
  const container = document.getElementById('funnelsList');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">Загрузка...</p>';
  try {
    const res = await fetch(API_BASE + '/funnels');
    const data = await res.json();
    if (data.success) {
      if (data.data.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center;">У вас пока нет запущенных воронок. <a href="#" onclick="showPage(\'launch-funnel\')" style="color:var(--gold)">Запустить воронку</a></p>';
      } else {
        container.innerHTML = data.data.map(f => '<div class="course-card"><span class="badge badge-success">✅ Активна</span><div class="course-title">🎯 ' + f.name + '</div><div class="course-desc">Этапов: ' + f.steps.length + '</div><div class="course-stats"><span> ' + new Date(f.launchedAt).toLocaleDateString('ru-RU') + '</span><span>📊 ' + f.totalConversions + ' конверсий</span></div></div>').join('');
      }
    }
  } catch (e) { container.innerHTML = '<p style="color:var(--danger)">Ошибка загрузки</p>'; }
}

document.addEventListener('DOMContentLoaded', function() {
  showPage('dashboard');
  showToast('', 'NEXUS Academy запущена!');
});
