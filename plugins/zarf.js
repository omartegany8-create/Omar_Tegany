const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
    // حماية للأمر: عشان ما حدش يزرف الجروب بتاعك غيرك أنت شخصياً كـ Owner للبوت
    if (!isOwner) return m.reply("❌ | هذا الأمر خارق وخاص بمطور البوت فقط!");
    
    // التأكد إن البوت نفسه أدمن في الجروب عشان يقدر يطرد
    const botNumber = conn.user.jid || conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const groupMetadata = await conn.groupMetadata(m.chat);
    const botAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;
    
    if (!botAdmin) return m.reply("❌ | البوت مش أدمن في المجموعه، ارفعني أدمن الأول عشان أقدر أزرفها!");

    m.reply("🚀 | جاري بدء عملية الزرف الشاملة... وداعاً!");

    // تصفية الأعضاء: هنشيل البوت ونشيل المطور ونحاول نطرد الباقي
    for (let participant of participants) {
        const jid = participant.id;
        
        // البوت مش هيطرد نفسه ولا هيطردك أنت كـ مطور
        if (jid !== botNumber && jid !== m.sender) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
                // تأخير بسيط جداً (نصف ثانية) بين كل طرد عشان الواتساب ما يعملش بلوك سريع للبوت
                await new Promise(resolve => setTimeout(resolve, 500)); 
            } catch (err) {
                // تخطي لو العضو طلع هو مؤسس الجروب لأن السيستم هيرفض طرده
                continue;
            }
        }
    }

    // رسالة الزرف النهائية بعد تصفية الجروب
    const textZarf = `𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️\n\nتـم زرف الـمـجـمـوعـة بـنـجـاح بـواسـطـة الـقـائـد مـيـرو! 🔥💀\n\nتـم تـصـفـيـة الـجـمـيـع وتـطـهـيـر الـمـكـان. 🕸️`;
    
    await conn.sendMessage(m.chat, { 
        text: textZarf,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363225356834044@newsletter',
                newsletterName: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
                serverMessageId: 0
            }
        }
    });
};

handler.command = ["زرف", "تصفيه", "تصفية"];
handler.group = true; // الأمر يشتغل في الجروبات بس
handler.botAdmin = true; // يتطلب إن البوت يكون أدمن
handler.owner = true; // حماية إضافية من ملف الـ handler الرئيسي

export default handler;
