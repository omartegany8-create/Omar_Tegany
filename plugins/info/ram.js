import os from 'os';

const handler = async (m, { conn }) => {
  const txt = `
  ⊱⋅ ────────────────── ⋅⊰
🪾╎ الـمسـتـخـدم: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB
🌳╎ الـمتـبــقـي: ${(os.freemem() / 1024 / 1024).toFixed(1)}MB
  ⊱⋅ ────────────────── ⋅⊰
`;

  await conn.msgUrl(m.chat, txt, {
    img: "https://i.pinimg.com/736x/73/56/32/735632c6fa8e665c249abbc8a340b77d.jpg" ,
    caption: txt,
    title: "𝐒𝐩𝐞𝐞𝐝 / 𝐓𝐞𝐬𝐭",
    body: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️",
    newsletter: {
      name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
      jid: '120363225356834044@newsletter'
    },
    big: false,
    mentions: [m.sender]
  }, global.reply_status);
};

handler.command = ["الرام", "ram"];
handler.category = "info";
handler.usage = ["الرام", "ram"];
export default handler;
