/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
هذا الملف تم تعريبه وتحديث حقوقه بالكامل ليناسب:
- ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
*/

let handler = async (m, { conn }) => {
    let chat = global.db.data.chats[m.chat];

    if (!chat || !chat.primaryBot) {
        return m.reply('《✧》 *لا يوجد أي بوت أساسي معين في هذه المجموعة حالياً.*');
    }

    console.log(`[إعادة تعيين البوت] جاري مسح الإعدادات للدردشة: ${m.chat}`);
    chat.primaryBot = null;

    const sonicFooter = '*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*';
    await m.reply(`✐ *تم الأمر بنجاح! تم إعادة ضبط الإعدادات.*\n\n> من الآن فصاعداً، ستعود جميع البوتات الصالحة للاستجابة وتنفيذ الأوامر مجدداً داخل المجموعة.\n\n${sonicFooter}`);
}

handler.customPrefix = /^(resetbot|resetprimario|botreset)$/i;
handler.command = new RegExp;

handler.group = true;
handler.admin = true;

export default handler;
