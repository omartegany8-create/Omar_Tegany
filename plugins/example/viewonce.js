import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply("❌ يسطا لازم تعمل رد (Reply) على الصورة أو الفيديو اللي مبعوت مشاهدة مرة واحدة!");

    // لقط كائن الرسالة المقتبسة كاملة
    const q = m.quoted;
    
    // فحص شامل وعميق لكل أشكال الـ View Once الممكنة في تحديثات الواتساب الجديدة
    const msgContext = q.message?.viewOnceMessageV2?.message || 
                       q.message?.viewOnceMessage?.message || 
                       q.message?.ephemeralMessage?.message?.viewOnceMessageV2?.message ||
                       q.message?.ephemeralMessage?.message?.viewOnceMessage?.message ||
                       q.message;

    // استخراج الرسالة الحقيقية للصورة أو الفيديو
    const realMessage = msgContext?.imageMessage || msgContext?.videoMessage;

    // فحص إضافي: هل الرسالة متعلمة كـ viewOnce داخلية؟
    const isViewOnceFlag = msgContext?.imageMessage?.viewOnce || msgContext?.videoMessage?.viewOnce || 
                            q.message?.viewOnceMessageV2 || q.message?.viewOnceMessage;

    if (!realMessage || !isViewOnceFlag) {
        return m.reply("❌ الرسالة دي مش ميديا مشاهدة مرة واحدة أصلاً! منشن صورة أو فيديو مقفولين.");
    }

    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    try {
        // تحديد النوع بدقة
        const mediaType = msgContext?.imageMessage ? 'image' : 'video';
        
        // تحميل وفك التشفير
        const stream = await downloadContentFromMessage(realMessage, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `🔓 *تم اختراق وفك قفل الصورة بنجاح!*` 
            }, { quoted: m });
        } else if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { 
                video: buffer, 
                caption: `🔓 *تم اختراق وفك قفل الفيديو بنجاح!*` 
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ عذراً، فشل فك التشفير! ممكن الميديا دي قديمة أو السيرفر مسح الكاش بتاعها.");
    }
};

handler.usage = ["vv"];
handler.category = "tools";
handler.command = ["vv", "viewonce", "تحميل"];
handler.group = false;

export default handler;
