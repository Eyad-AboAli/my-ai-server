module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { message } = req.body || {};
        const apiKey = process.env.GEMINI_API_KEY;

        // 1. فحص وجود المفتاح
        if (!apiKey) {
            return res.status(200).json({ reply: "السبب: GEMINI_API_KEY غير موجود في إعدادات Vercel!" });
        }

        // 2. إرسال الطلب لجوجل
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message || "مرحبا" }] }]
            })
        });

        const data = await response.json();

        // 3. لو فيه خطأ جاي من جوجل اعرضه فوراً
        if (data.error) {
            return res.status(200).json({ reply: `خطأ من جوجل: ${data.error.message}` });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
            return res.status(200).json({ reply });
        } else {
            return res.status(200).json({ reply: "وصل رد فارغ من جوجل، تأكد من المفتاح." });
        }

    } catch (err) {
        return res.status(200).json({ reply: `حدث خطأ في السيرفر: ${err.message}` });
    }
};
