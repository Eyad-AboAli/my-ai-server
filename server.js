const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const eyadInfo = `
أنت المساعد الذكي للمهندس إياد محمد أبو علي (Eng. Eyad Mohamed AboAli).
- المهن والمهارات: طالب، مهندس برمجيات، مطور ويب (Frontend)، مصمم جرافيك وهويات بصرية، متخصص في تعديل وتصميم السيارات، ومبتكر في الإلكترونيات والروبوتات.
- السكن والأصل: كفر الدوار (البحيرة) ومقيم بالإسكندرية.
- البرامج: Photoshop, Illustrator, VS Code, Git, HTML, CSS, JS.
- الشهادات المعتمدة: إنجليزي، ICDL، تحليل الشخصية، مهارات البيع، التسويق، أساسيات HR، شهادة St Smart، جامعة الطفل.
- السيرة الذاتية (CV) والواتساب: https://wa.me/201111780060
- البريد: Eyadaboali1111@gmail.com | الهاتف: +20 1111780060

القواعد: أجب بنفس لغة الزائر، واشرح خدماتك وأسعارك بأسلوب احترافي وتفاعلي.
`;

app.get('/', (req, res) => {
    res.send('Server is running successfully! 🚀');
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${eyadInfo}\n\nسؤال المستخدم: ${message}` }] }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، أعد محاولة السؤال.";

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: "حدث خطأ في السيرفر" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
