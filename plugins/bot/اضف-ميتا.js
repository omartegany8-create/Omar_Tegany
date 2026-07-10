// ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|
// كود لإضافة 𝒎𝒆𝒕𝒂 𝒂𝒊 للمجموعات
// https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z

let handler = async (m, { conn, text }) => {
  try {
    const groupJid = m.chat;

    if (!groupJid.endsWith("@g.us")) {
      return m.reply("🔮 *هذا الأمر مخصص للمجموعات فقط يا رفيقي!* \n\n*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*");
    }

    const res = await conn.groupParticipantsUpdate(
      groupJid,
      ["867051314767696@bot"],
      "add",
    );

    m.reply(
      "⚡ ⃟꙰⃢  *تمت إضافة ذكاء مـيـتـا الاصطناعي في المجموعة بنجاح!* ✅\n\n*╰━━━━━━━ 〔 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ 〕 ━━━━━━━╯*"
    );
  } catch (e) {
    console.error(e);
    m.reply(String(e?.stack || e));
  }
};

handler.command = /^(اضف-ميتا)$/i;
export default handler;