import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const handler = async (m, { conn }) => {
    // التأكد أن المستخدم عامل رد على رسالة
    if (!m.quoted) return m.reply("❌ يسطا لازم تعمل رد (Reply) على الصورة أو الفيديو اللي مبعوت مشاهدة مرة واحدة!");

    // لقط نوع الرسالة المقتبسة
    const q = m.quoted;
    const isViewOnce = q.mtype === 'viewOnceMessageV2' || q.mtype === 'viewOnceMessage';
    
    // استخراج الرسالة الحقيقية المستخبية جوه الـ viewOnce
    const realMessage = q.message?.imageMessage || q.message?.videoMessage || q.imageMessage || q.videoMessage;

    if (!isViewOnce || !realMessage) {
        return m.reply("❌ الرسالة دي مش ميديا مشاهدة مرة واحدة أصلاً! منشن صورة أو فيديو مقفولين.");
    }

    // ريأكت التحميل
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });

    try {
        // تحديد نوع الميديا (صورة أو فيديو) لفك التشفير
        const mediaType = q.message?.imageMessage || q.imageMessage ? 'image' : 'video';
        
        // تحميل البافار (Stream Buffer) المباشر للميديا المشفرة من سيرفرات الواتساب
        const stream = await downloadContentFromMessage(realMessage, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // إرسال الميديا بعد فك قفلها بنجاح في الشات
        if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `🔓 *تم فك تشفير الصورة بنجاح بواسطة البوت!*` 
            }, { quoted: m });
        } else if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { 
                video: buffer, 
                caption: `🔓 *تم فك تشفير الفيديو بنجاح بواسطة البوت!*` 
            }, { quoted: m });
        }

        // ريأكت النجاح
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
handler.group = false; // تعمل في الخاص والجروبات عادي

export default handler;
  
