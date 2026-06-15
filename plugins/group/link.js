let handler = async (m, {
    conn
}) => {
    try {
        m.reply(`*┄────────── °❀° ┄──────────*
🌷┊ *رابـــط الـــمـــجـــمـــوعـــة:*
🌷┊ *${(await conn.groupMetadata(m.chat)).subject}*
🌷┊ *https://chat.whatsapp.com/` + await conn.groupInviteCode(m.chat) + `*
🌷┊ *رابـــط الاستقبال:*
🌷┊ ${conn.user.name || "https://chat.whatsapp.com/LUFdrmHVmlKEbkO26rOFfG
"}
*──────────┄ °❀° ┄──────────*`)
    } catch {
        const mentionedUser = conn.user.id.split(":")[0] + "@s.whatsapp.net";
        conn.sendMessage(m.chat, { 
            text: `*──────────┄ °❀° ┄──────────*
🌷┊ @${mentionedUser.split('@')[0]} غير مسموح لك باستخدام هذا الامر!
*──────────┄ °❀° ┄──────────*`, 
            mentions: [mentionedUser]
        })
    }
}
handler.usage = ["رابط"];
handler.category = "group";
handler.command = ["رابط", "link"];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
