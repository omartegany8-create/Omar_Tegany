// ذاكرة مؤقتة لحفظ الفيديوهات في الرام
const videoCache = {
  e1: { url: "https://files.catbox.moe/32lk04.mp4", buffer: null },
  e2: { url: "https://files.catbox.moe/a2m77u.mp4", buffer: null },
  e3: { url: "https://files.catbox.moe/eterfm.mp4", buffer: null },
  e4: { url: "https://files.catbox.moe/uy8nbz.mp4", buffer: null }
};

export default async function before(m, { conn }) {
  const command = m.text?.trim().toLowerCase();

  if (!command || !videoCache[command]) return false;

  const currentVideo = videoCache[command];

  // ريأكت أول ما الأمر يتعرف (يثبت إن الكود شغال)
  try {
    await conn.sendMessage(m.chat, { react: { text: '🎬', key: m.key } });
  } catch (e) {
    console.error("فشل الريأكت:", e);
  }

  try {
    // تحميل الفيديو في الذاكرة أول مرة بس
    if (!currentVideo.buffer) {
      const download = await conn.getFile(currentVideo.url);
      if (download && download.data) {
        currentVideo.buffer = download.data;
      }
    }

    // إرسال الفيديو عادي (من غير ptv)
    await conn.sendMessage(m.chat, {
      video: currentVideo.buffer || { url: currentVideo.url },
      mimetype: 'video/mp4'
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
  } catch (error) {
    console.error(`خطأ في إرسال فيديو الأمر ${command}:`, error);

    // محاولة أخيرة بالرابط المباشر
    try {
      await conn.sendMessage(m.chat, {
        video: { url: currentVideo.url },
        mimetype: 'video/mp4'
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
      console.error("فشل الإرسال الاحتياطي أيضاً:", e);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }
  }

  return true;
}
