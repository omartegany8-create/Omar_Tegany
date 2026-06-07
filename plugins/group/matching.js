const handler = async (m, { conn, args }) => {
const res = await (await import("meowsab")).Scrapy.Matching();
const { data } = JSON.parse(res);


 await conn.sendButtonNormal(m.chat, {
  media: { url: data.boy },
  mediaType: 'image', 
  caption: `# Boy 🚹`,
  buttons: [
        { name: "cta_url", params: { display_text: "📎╎ قــنــاتــي ", url: "https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y" } },
  ], 
  mentions: [m.sender],
  newsletter: {
      name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
      jid: '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter'
    },
}, global.reply_status)



return await conn.sendButtonNormal(m.chat, {
  media: { url: data.girl },
  mediaType: 'image', 
  caption: `# girl 🚺`,
  buttons: [
        { name: "quick_reply", params: { display_text: "▶️ ╎ الـتـالـي ", id: ".تطقيم" } },
  ], 
  mentions: [m.sender],
  newsletter: {
      name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
      jid: '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter'
    },
}, global.reply_status)

};
handler.usage =  ["تطقيم"];
handler.category = "group";
handler.command = ["ماتشينج", "تطقيم"];

export default handler;
