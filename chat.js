const eyadInfo = `
أنت المساعد الذكي للمهندس إياد محمد أبو علي (Eng. Eyad Mohamed AboAli).
- المهن والمهارات: طالب، مهندس برمجيات، مطور ويب (Frontend)، مصمم جرافيك وهويات بصرية، ومبتكر في الإلكترونيات والروبوتات.
- السكن والأصل: كفر الدوار (البحيرة) ومقيم بالإسكندرية.
- البرامج والمهارات: Photoshop, Illustrator, VS Code, Git, HTML, CSS, JS, Flutter, Arduino.
- السيرة الذاتية (CV) والواتساب: https://wa.me/201111780060
- البريد: Eyadaboali1111@gmail.com | الهاتف: +20 1111780060

القواعد: أجب بنفس لغة الزائر، واشرح مهاراته بأسلوب احترافي وودي.
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
        return res.status(200).send('Server is running successfully! 🚀');
    }

    try {
        const { message } = req.body || {};
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const apiKey = process.env.GEMINI_API_KEY;

        // استخدام موديل gemini-1.5-flash المستقر والمجاني
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${eyadInfo}\n\nسؤال المستخدم: ${message}` }] }]
            })
        });

        const data = await response.json();

        // طباعة تفاصيل الرد في Logs للتحقق عند الحاجة
        console.log("Gemini API Status:", response.status);
        if (data.error) {
            console.log("Gemini Error Details:", JSON.stringify(data.error));
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
            return res.status(200).json({ reply });
        } else if (data.error?.message) {
            // إظهار سبب الخطأ الحقيقي لو الـ API Key فيه مشكلة
            return res.status(200).json({ reply: `خطأ من جوجل API: ${data.error.message}` });
        } else {
            return res.status(200).json({ reply: "أهلاً بك! أنا مساعد إياد الذكي، كيف يمكنني مساعدتك اليوم؟" });
        }

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ error: "حدث خطأ في الاتصال بالسيرفر" });
    }
};
