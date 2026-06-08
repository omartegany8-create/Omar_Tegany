const handler = async (m, { conn }) => {
  const start = process.hrtime.bigint();
  await conn.sendMessage(m.chat, { text: "🏓 msg test" });
  const end = process.hrtime.bigint();
  const ping = Number(end - start) / 1e6;
  
  await conn.msgUrl(m.chat, `⚡ سرعة البوت: ${ping.toFixed(2)}ms`, {
    img: "https://i.pinimg.com/736x/73/56/32/735632c6fa8e665c249abbc8a340b77d.jpg",
    title: "𝐒𝐩𝐞𝐞𝐝 / 𝐓𝐞𝐬𝐭",
    body: "𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 | 𝐒𝐇𝐈𝐁𝐔𝐘𝐀 𝐆𝐔𝐈𝐋𝐃",
    newsletter: {
      name: '𝐒𝐇𝐈𝐁𝐔𝐘𝐀 𝐆𝐔𝐈𝐋𝐃 🕷️',
      jid: '120363225356834044@newsletter'
    },
    big: false
  }, global.reply_status);
};

handler.command = ["بنج", "ping"];
handler.category = "info";
handler.usage = ["بنج"];
export default handler;
