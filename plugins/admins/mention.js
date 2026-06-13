/*
code: smart contextual group mention (منشن ذكي مدمج)
by: 𝐓𝐨جي & Gemini
*/

const handler = async (m, { conn, text, command }) => {
    const metadata = await conn.groupMetadata(m.chat);
    const participants = metadata.participants;
    
    // تصفية المشرفين والأعضاء العاديين
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
    const groupMembers = participants.filter(p => !p.admin).map(p => p.id);

    // ترتيب عشوائي لإضافة حماس ومنع الملل
    const shuffledAdmins = [...groupAdmins].sort(() => Math.random() - 0.5);
    const shuffledMembers = [...groupMembers].sort(() => Math.random() - 0.5);

    let messageText = "";
    let targetMentions = [];

    // هيدر الرسالة الثابت الفخم
    messageText += `🗃️│ الـاســم: ${metadata.subject}\n`;
    messageText += `📯│ تـاريـخ: ${new Date().toLocaleDateString('ar-EG')}\n`;
    if (text) messageText += `💬│ الـرسـالـة: ${text}\n`;
    messageText += `\n`;

    // الفحص الذكي بناءً على الأمر المستخدم
    if (command === 'منشن_مشرفين' || command === 'admins') {
        // 1. منشن المشرفين فقط
        messageText += `↓👑 *الـمـشـرفـيـن (${shuffledAdmins.length})* 👑↓\n`;
        messageText += "```───────────────────\n";
        shuffledAdmins.forEach((admin, index) => {
            messageText += `🇩🇪│ ${index + 1}. @${admin.split('@')[0]}\n`;
        });
        messageText += "───────────────────```\n\n";
        messageText += `> *تم استدعاء الإدارة!* ⚡`;
        targetMentions = groupAdmins;

    } else if (command === 'منشن_اعضاء' || command === 'members') {
        // 2. منشن الأعضاء فقط
        messageText += `↓👥 *الاعـضـاء (${shuffledMembers.length})* 👥↓\n`;
        messageText += "```───────────────────\n";
        shuffledMembers.forEach((member, index) => {
            messageText += `│ ${index + 1}. @${member.split('@')[0]}\n`;
        });
        messageText += "───────────────────```\n\n";
        messageText += `> *تم استدعاء اعضاء الجروب!* 👥🔥`;
        targetMentions = groupMembers;

    } else {
        // 3. المنشن الشامل المعتاد (الكل)
        messageText += `↓👑 *الـمـشـرفـيـن (${shuffledAdmins.length})* 👑↓\n`;
        messageText += "```───────────────────\n";
        shuffledAdmins.forEach((admin, index) => {
            messageText += `🇩🇪│ ${index + 1}. @${admin.split('@')[0]}\n`;
        });
        messageText += "───────────────────```\n\n";

        messageText += `↓👥 *الاعـضـاء (${shuffledMembers.length})* 👥↓\n`;
        messageText += "```───────────────────\n";
        shuffledMembers.forEach((member, index) => {
            messageText += `│ ${index + 1}. @${member.split('@')[0]}\n`;
        });
        messageText += "───────────────────```\n\n";

        messageText += `> *إجمالي المشاركين — ${participants.length}* 🌐`;
        targetMentions = participants.map(p => p.id);
    }

    // إرسال الرسالة النهائية بالمنشن المستهدف الصحيح
    return conn.sendMessage(m.chat, { 
        text: messageText, 
        mentions: targetMentions
    }, { quoted: m });
};

handler.usage = ["منشن", "منشن_مشرفين", "منشن_اعضاء"];
handler.category = "admin";
// ربط كل الأوامر البديلة بنفس الملف الذكي
handler.command = ["منشن", "منشنز", "mention", "منشن_مشرفين", "admins", "منشن_اعضاء", "members"];
handler.admin = true;
handler.group = true; // التأكد أن الأمر يعمل داخل المجموعات فقط

export default handler;
