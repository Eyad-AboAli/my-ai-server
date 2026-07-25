module.exports = async (req, res) => {
    // إعدادات الـ CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // استقبال نص الرسالة من الموقع
        let userMessage = req.body?.message || "مرحبا";

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(200).json({ reply: "خطأ: لم يتم ضبط GEMINI_API_KEY في Vercel" });
        }

        const systemPrompt = `أنت المساعد الذكي للمهندس إياد محمد أبو علي (Eng. Eyad Mohamed AboAli)، مهندس برمجيات ومصمم جرافيك ومبتكر روبوتات. أجب عن الأسئلة بلباقة وبساطة.`;

        // إرسال الطلب لجوجل API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "\n\nسؤال المستخدم: " + userMessage }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        // لو فيه مشكلة في المفتاح أو الموديل
        if (data.error) {
            return res.status(200).json({ reply: "خطأ من جوجل: " + data.error.message });
        }

        // استخراج الرد
        const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (botReply) {
            return res.status(200).json({ reply: botReply });
        } else {
            return res.status(200).json({ reply: "عذراً، لم يتوفر رد في الوقت الحالي." });
        }

    } catch (error) {
        return res.status(200).json({ reply: "حدث خطأ في الاتصال: " + error.message });
    }
};
