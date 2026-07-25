const eyadInfo = `
أنت المساعد الذكي للمهندس إياد محمد أبو علي.
- المهن والمهارات: طالب، مهندس برمجيات، مطور ويب (Frontend)، مصمم جرافيك، ومبتكر روبوتات.
- السكن: مقيم بالإسكندرية.
- للتواصل: Eyadaboali1111@gmail.com | +20 1111780060
`;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(200).send('Server is running successfully!');
    }

    try {
        const { message } = req.body || {};
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ reply: "خطأ: لم يتم العثور على GEMINI_API_KEY في إعدادات Vercel!" });
        }

        // الاتصال بموديل gemini-2.5-flash المحدث
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${eyadInfo}\n\nسؤال المستخدم: ${message}` }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            // إظهار سبب الخطأ الصريح القادم من جوجل في الشات
            return res.status(200).json({ reply: `خطأ من جوجل API: ${data.error.message}` });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
            return res.status(200).json({ reply });
        } else {
            return res.status(200).json({ reply: "لم أستطع معالجة الإجابة، يرجى المحاولة مرة أخرى." });
        }

    } catch (err) {
        return res.status(500).json({ error: "حدث خطأ في الاتصال بالسيرفر: " + err.message });
    }
};
