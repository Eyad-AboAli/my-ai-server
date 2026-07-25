module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(200).send('Server is running successfully! 🚀');

    try {
        const { message } = req.body || {};
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ reply: "المفتاح GEMINI_API_KEY غير موجود في Vercel" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message || "أهلاً" }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(200).json({ reply: `خطأ من جوجل: ${data.error.message}` });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: text || "رد فارغ" });

    } catch (err) {
        return res.status(200).json({ reply: `خطأ سيرفر: ${err.message}` });
    }
};
