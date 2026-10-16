const handler = async (m, { conn }) => {
const start = process.hrtime.bigint();

await conn.sendMessage(m.chat, { text: "🕷️ جاري قياس سرعة الاستجابة..." });

const end = process.hrtime.bigint();
const ping = Number(end - start) / 1e6;

const message = "╭━━━〔 🕷️ 𝐌𝐄𝐑𝐎 𝐀𝐈 〕━━━╮ ┃ ┃  ⚡ *سرعة الاستجابة* ┃  ╭──────────────── ┃  ┃ 🚀 *السرعة:* ${ping.toFixed(2)} ms ┃  ┃ 💠 *الحالة:* متصل بنجاح ┃  ┃ 👑 *النظام:* MERO AI ┃  ╰──────────────── ┃ ╰━━━〔 𝐒𝐏𝐄𝐄𝐃 𝐓𝐄𝐒𝐓 〕━━━╯".trim();

await conn.msgUrl(
m.chat,
message,
{
img: "https://omar-dev-pro.vercel.app/",
title: "🕷️ 𝐌𝐄𝐑𝐎 𝐀𝐈 | 𝐏𝐈𝐍𝐆",
body: "⚡ نظام قياس سرعة البوت",
big: false
},
global.reply_status
);
};

handler.command = ["بنج", "ping"];
handler.category = "info";
handler.usage = ["بنج"];

export default handler;
