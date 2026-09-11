const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const JWT_SECRET = 'nexus-academy-secret-key-2024';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'src')));

if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(DB_PATH)) {
    const initialData = {
        users: [],
        courses: [
            { id: 1, title: 'Python для начинающих', students: 847, price: 9900, isAiGenerated: false },
            { id: 2, title: 'JavaScript Modern', students: 456, price: 8900, isAiGenerated: true }
        ],
        feed: [
            { id: 1, author: 'Елена Смирнова', avatar: 'ЕС', text: '🎉 Только что завершила курс "UX/UI Дизайн"!', likes: 45, time: '2 часа назад' },
            { id: 2, author: 'Михаил Петров', avatar: 'МП', text: 'Кто хочет вместе пройти курс "AI & ML"?', likes: 23, time: '5 часов назад' }
        ],
        shop: [
            { id: 1, name: 'Кастомный аватар', desc: 'Уникальный дизайн профиля', price: 500, icon: '🎨' },
            { id: 2, name: 'Premium курс', desc: 'Доступ к эксклюзивному контенту', price: 2000, icon: '🎓' },
            { id: 3, name: 'Редкий бейдж "Легенда"', desc: 'Коллекционный achievement', price: 1500, icon: '🏆' }
        ],
        certificates: [],
        calendar: [
            { id: 1, title: 'Вебинар: Запуск онлайн-школы', date: '2024-09-15', time: '19:00', type: 'webinar', color: '#d4af37' },
            { id: 2, title: 'Дедлайн: Домашнее задание #3', date: '2024-09-18', time: '23:59', type: 'deadline', color: '#f44336' },
            { id: 3, title: 'Выплата партнёрских комиссий', date: '2024-09-20', time: '12:00', type: 'payment', color: '#4caf50' }
        ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    console.log('📦 База данных создана!');
}

function readDB() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDB(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8'); }

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'Не авторизован' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(401).json({ success: false, error: 'Неверный токен' });
    }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'src', 'index.html')));

app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Все поля обязательны' });
    const db = readDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ success: false, error: 'Пользователь уже существует' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now(), name, email, password: hashedPassword,
        level: 1, xp: 0, maxXp: 1000, coins: 100,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        enrolledCourses: [], completedCourses: []
    };
    db.users.push(newUser);
    writeDB(db);
    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(400).json({ success: false, error: 'Пользователь не найден' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Неверный пароль' });
    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/profile', authMiddleware, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    res.json({ success: true, data: { ...user, password: undefined } });
});

app.get('/api/courses', (req, res) => { const db = readDB(); res.json({ success: true, data: db.courses }); });

app.post('/api/courses/enroll', authMiddleware, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const courseId = req.body.courseId;
    if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        writeDB(db);
    }
    res.json({ success: true, message: 'Вы записались на курс!' });
});

app.post('/api/courses/complete', authMiddleware, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const courseId = req.body.courseId;
    if (!user.completedCourses.includes(courseId)) {
        user.completedCourses.push(courseId);
        user.xp += 500;
        user.coins += 200;
        if (user.xp >= user.maxXp) {
            user.level += 1;
            user.xp = 0;
            user.maxXp = Math.floor(user.maxXp * 1.5);
        }
        const course = db.courses.find(c => c.id === courseId);
        db.certificates.push({
            id: Date.now(), userId: user.id, userName: user.name,
            courseName: course?.title || 'Курс',
            date: new Date().toISOString(),
            certificateNumber: 'NEX-' + Date.now()
        });
        writeDB(db);
    }
    res.json({ success: true, message: 'Курс завершён! +500 XP, +200 Coins' });
});

app.get('/api/certificates', authMiddleware, (req, res) => {
    const db = readDB();
    const certs = db.certificates.filter(c => c.userId === req.user.id);
    res.json({ success: true, data: certs });
});

app.get('/api/certificates/:id/pdf', authMiddleware, (req, res) => {
    const PDFDocument = require('pdfkit');
    const db = readDB();
    const cert = db.certificates.find(c => c.id === parseInt(req.params.id) && c.userId === req.user.id);
    if (!cert) return res.status(404).json({ success: false, error: 'Сертификат не найден' });
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificate-' + cert.id + '.pdf');
    doc.pipe(res);
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0a');
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).lineWidth(3).stroke('#d4af37');
    doc.fillColor('#d4af37').fontSize(40).font('Helvetica-Bold').text('NEXUS ACADEMY', 0, 80, { align: 'center' });
    doc.fillColor('#f4e5c2').fontSize(20).font('Helvetica').text('СЕРТИФИКАТ О ПРОХОЖДЕНИИ КУРСА', 0, 140, { align: 'center' });
    doc.fillColor('#d4af37').fontSize(35).font('Helvetica-Bold').text(cert.userName, 0, 220, { align: 'center' });
    doc.fillColor('#f4e5c2').fontSize(18).font('Helvetica').text('успешно завершил(а) курс', 0, 280, { align: 'center' });
    doc.fillColor('#d4af37').fontSize(25).font('Helvetica-Bold').text(cert.courseName, 0, 320, { align: 'center' });
    const date = new Date(cert.date).toLocaleDateString('ru-RU');
    doc.fillColor('#c0c0c0').fontSize(14).font('Helvetica').text('Дата: ' + date, 0, 420, { align: 'center' });
    doc.text('Номер сертификата: ' + cert.certificateNumber, 0, 450, { align: 'center' });
    doc.end();
});

app.get('/api/feed', (req, res) => { const db = readDB(); res.json({ success: true, data: db.feed }); });
app.post('/api/feed', authMiddleware, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const newPost = { id: Date.now(), author: user.name, avatar: user.avatar, text: req.body.text, likes: 0, time: 'Только что' };
    db.feed.unshift(newPost);
    writeDB(db);
    res.json({ success: true, data: newPost });
});
app.post('/api/feed/:id/like', (req, res) => {
    const db = readDB();
    const post = db.feed.find(p => p.id === parseInt(req.params.id));
    if (post) { post.likes += 1; writeDB(db); res.json({ success: true, data: post }); }
    else res.status(404).json({ success: false, error: 'Пост не найден' });
});

app.get('/api/shop', (req, res) => { const db = readDB(); res.json({ success: true, data: db.shop }); });
app.post('/api/shop/buy', authMiddleware, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    const item = db.shop.find(i => i.id === parseInt(req.body.itemId));
    if (item && user.coins >= item.price) {
        user.coins -= item.price;
        writeDB(db);
        res.json({ success: true, message: 'Вы купили "' + item.name + '"!', coins: user.coins });
    } else {
        res.status(400).json({ success: false, error: 'Недостаточно NEXUS Coins' });
    }
});

app.get('/api/calendar', (req, res) => { const db = readDB(); res.json({ success: true, data: db.calendar }); });
app.post('/api/calendar', authMiddleware, (req, res) => {
    const db = readDB();
    const { title, date, time, type, color } = req.body;
    const newEvent = { id: Date.now(), title, date, time, type, color: color || '#d4af37' };
    db.calendar.push(newEvent);
    writeDB(db);
    res.json({ success: true, data: newEvent });
});

app.post('/api/ai/generate', (req, res) => {
    const db = readDB();
    const newCourse = { id: Date.now(), title: req.body.topic || 'Новый курс', students: 0, price: 9900, isAiGenerated: true };
    db.courses.push(newCourse);
    writeDB(db);
    res.json({ success: true, data: newCourse });
});

app.listen(PORT, '0.0.0.0', () => console.log(' NEXUS запущен: http://localhost:' + PORT));

// Запуск курса
app.post('/api/courses/launch', authMiddleware, (req, res) => {
    const db = readDB();
    const courseId = req.body.courseId;
    const course = db.courses.find(c => c.id === courseId);
    
    if (!course) return res.status(404).json({ success: false, error: 'Курс не найден' });
    
    course.isLaunched = true;
    course.launchDate = new Date().toISOString();
    writeDB(db);
    
    res.json({ success: true, message: 'Курс "' + course.title + '" запущен!', course });
});

// Запуск школы
app.post('/api/school/launch', authMiddleware, (req, res) => {
    const db = readDB();
    const schoolData = req.body;
    
    const school = {
        id: Date.now(),
        name: schoolData.name || 'Моя школа',
        niche: schoolData.niche || 'Образование',
        launchedAt: new Date().toISOString(),
        status: 'active',
        courses: schoolData.courses || [],
        students: 0,
        revenue: 0
    };
    
    if (!db.schools) db.schools = [];
    db.schools.push(school);
    writeDB(db);
    
    res.json({ success: true, message: 'Школа "' + school.name + '" запущена!', school });
});

// Запуск воронки
app.post('/api/funnels/launch', authMiddleware, (req, res) => {
    const db = readDB();
    const funnelData = req.body;
    
    const funnel = {
        id: Date.now(),
        name: funnelData.name || 'Новая воронка',
        steps: funnelData.steps || [
            { name: 'Лендинг', conversion: 100 },
            { name: 'Email', conversion: 80 },
            { name: 'Вебинар', conversion: 50 },
            { name: 'Продажа', conversion: 20 }
        ],
        launchedAt: new Date().toISOString(),
        status: 'active',
        totalConversions: 0,
        revenue: 0
    };
    
    if (!db.funnels) db.funnels = [];
    db.funnels.push(funnel);
    writeDB(db);
    
    res.json({ success: true, message: 'Воронка "' + funnel.name + '" запущена!', funnel });
});

// Получить список запущенных школ
app.get('/api/schools', (req, res) => {
    const db = readDB();
    res.json({ success: true, data: db.schools || [] });
});

// Получить список запущенных воронок
app.get('/api/funnels', (req, res) => {
    const db = readDB();
    res.json({ success: true, data: db.funnels || [] });
});

// Создание нового курса
app.post('/api/courses', (req, res) => {
    const db = readDB();
    const newCourse = {
        id: Date.now(),
        title: req.body.title || 'Новый курс',
        description: req.body.description || '',
        price: req.body.price || 9900,
        students: 0,
        isAiGenerated: false,
        isLaunched: false
    };
    db.courses.push(newCourse);
    writeDB(db);
    res.json({ success: true, data: newCourse });
});

// Запуск существующего курса
app.post('/api/courses/:id/launch', (req, res) => {
    const db = readDB();
    const course = db.courses.find(c => c.id === parseInt(req.params.id));
    if (!course) return res.status(404).json({ success: false, error: 'Курс не найден' });
    course.isLaunched = true;
    course.launchDate = new Date().toISOString();
    writeDB(db);
    res.json({ success: true, message: 'Курс "' + course.title + '" запущен!', course });
});
