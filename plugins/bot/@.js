let handler = async (m, { conn, text, participants }) => {
  if (!m.isGroup) return m.reply("❌ ده أمر جروبات بس يا حبي.");

  let caption = text ? text : "𝐵𝑌 𝚂𝙾𝙽𝙸𝙲 𝘽𝙊𝙏";
  let members = participants.map(v => v.id);

  await conn.sendMessage(m.chat, {
    text: `@${m.chat}`, 
    contextInfo: {
      mentionedJid: members,
      groupMentions: [
        {
          groupSubject: caption,
          groupJid: m.chat
        }
      ]
    }
  });
};

handler.help = ['@'];
handler.tags = ['group'];
handler.command = /^@$/i;
handler.group = true;


export default handler;