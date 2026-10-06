// فيديو نوت (دائري) - الأوامر: e1 / e2 / e3 / e4 (من غير بريفكس)
const videos = {
  e1: "https://files.catbox.moe/32lk04.mp4",
  e2: "https://files.catbox.moe/a2m77u.mp4",
  e3: "https://files.catbox.moe/eterfm.mp4",
  e4: "https://files.catbox.moe/uy8nbz.mp4"
};

let handler = async (m, { conn, command }) => {
  const key = (command || m.text || "").trim().toLowerCase();
  const url = videos[key];
  if (!url) return;

  try {
    await m.react("🎬"); // الأمر اتعرف
    await conn.circular(m.chat, { vid: url, sec: 200 }, m);
    await m.react("✅"); // اتبعت
  } catch (e) {
    console.error(`خطأ في فيديو نوت ${key}:`, e);
    try { await m.react("❌"); } catch {}
  }
};

handler.command = ["e1", "e2", "e3", "e4"];
handler.usePrefix = false; // من غير نقطة

export default handler;
