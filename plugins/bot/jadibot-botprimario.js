/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
هذا الملف تم تعريبه وتحديث حقوقه بالكامل ليناسب:
- ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
*/

let handler = async (m, { conn, text, participants, usedPrefix, command }) => {
    if (!m.isGroup) throw '⚠️ *هذا الأمر يمكن استخدامه فقط داخل المجموعات.*';

    let who;
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else if (text) {
        who = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    } else {
        return m.reply(`⚠️ *يرجى الإشارة (منشن)، الرد على رسالة، أو كتابة رقم البوت الذي تريد تعيينه كـ بوت أساسي للمجموعة.*`);
    }

    let botJid = who;
    if (who.endsWith('@lid')) {
        const pInfo = participants.find(p => p.lid === who);
        if (pInfo && pInfo.id) botJid = pInfo.id;
    }

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};

    if (global.db.data.chats[m.chat].primaryBot === botJid) {
        return conn.reply(m.chat, `✨ @${botJid.split`@`[0]} *هو بالفعل البوت الأساسي المعين لهذه المجموعة حالياً.*`, m, { mentions: [botJid] });
    }

    global.db.data.chats[m.chat].primaryBot = botJid;

    const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';
    let response = `
『 🤖 』⋮⋮ *تـم تـعـيـيـن الـبـوت الأسـاسـي:*
> *@${botJid.split('@')[0]}*

『 ℹ️ 』⋮⋮ *الـتـأثـيـر:*
> من الآن فصاعداً، هذا البوت فقط هو من سيقوم بالاستجابة وتنفيذ الأوامر داخل المجموعة.

『 ⚠️ 』⋮⋮ *مـلاحـظـة:*
> إذا كنت تريد إلغاء التقييد وجعل جميع البوتات تستجيب مجدداً، استخدم أمر *resetbot* (بدون بادئة).

${sonicFooter}
`.trim();

    await conn.sendMessage(m.chat, { 
        text: response, 
        mentions: [botJid] 
    }, { quoted: m });
}

handler.help = ['setprimary <الرقم/المنشن>'];
handler.tags = ['owner', 'group'];
handler.command = ['setprimary', 'setbot'];
handler.admin = true;
handler.group = true;

export default handler;
