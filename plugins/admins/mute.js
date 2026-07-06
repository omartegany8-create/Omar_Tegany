const isOwner = (userId, bot) => {
    if (!userId) return false;
    return bot.config?.owners?.some(o => o.jid === userId || o.lid === userId || o.jid?.split('@')[0] === userId.split('@')[0]);
};

const handler = async (m, { conn, command, bot }) => {
    let target = m.mentionedJid?.[0];
    
    if (target && typeof m.lid2jid === 'function') {
        target = await m.lid2jid(target);
    }
    
    if (!target && m.quoted) {
        if (typeof m.lid2jid === 'function') {
            target = await m.lid2jid(m.quoted.sender);
        } else {
            target = m.quoted.sender;
        }
    }
    
    if (!target) return m.reply(`*🔇 كتم/فك_كتم @user*\nاو رد على رسالته`);
    if (typeof target !== 'string') return m.reply(`*❌ حدث خطأ في تحديد المستخدم*`);
    
    // تنظيف المعرف لضمان المقارنة الصحيحة
    const targetId = target.split('@')[0];
    if (isOwner(target, bot)) return m.reply(`*❌ لا يمكن كتم المطور*`);
    
    const group = global.db.groups[m.chat] ||= {};
    const muteList = group.mute ||= [];
    
    let isMuted = false;
    for (let i = 0; i < muteList.length; i++) {
        if (muteList[i].split('@')[0] === targetId) {
            isMuted = true;
            break;
        }
    }
    
    if (command === "كتم") {
        if (isMuted) {
            await conn.sendMessage(m.chat, { text: `*❌ @${targetId} مكتوم بالفعل*`, mentions: [target] });
            return;
        }
        muteList.push(target);
        await conn.sendMessage(m.chat, { text: `*✅ تم كتم @${targetId}*\n🔒 لن يتمكن من الكلام`, mentions: [target] });
    } else if (command === "فك_كتم") {
        if (!isMuted) {
            await conn.sendMessage(m.chat, { text: `*❌ @${targetId} ليس مكتوماً*`, mentions: [target] });
            return;
        }
        group.mute = muteList.filter(id => id.split('@')[0] !== targetId);
        await conn.sendMessage(m.chat, { text: `*✅ تم فك كتم @${targetId}*\n🔓 يمكنه الكلام الآن`, mentions: [target] });
    }
};

handler.before = async (m, { conn, bot }) => {
    if (!m.isGroup) return;
    if (!m.sender) return;

    // فحص ذكي للمطور والآدمن يتخطى مشاكل نسخة الكمبيوتر (LID)
    const senderId = m.sender.split('@')[0];
    if (m.isOwner || m.isAdmin || isOwner(m.sender, bot)) return;
    
    const muteList = global.db?.groups[m.chat]?.mute;
    if (!muteList || muteList.length === 0) return;
    
    let isMuted = false;
    for (let i = 0; i < muteList.length; i++) {
        if (muteList[i].split('@')[0] === senderId) {
            isMuted = true;
            break;
        }
    }
    
    if (isMuted) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (err) {
            console.error("❌ فشل حذف رسالة المكتوم:", err.message);
        }
        return true;
    }
};

handler.command = ["كتم", "فك_كتم"];
handler.admin = true;

export default handler;
                                   
