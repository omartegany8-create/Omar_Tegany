const gis = require('g-i-s');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return conn.reply(m.chat, `❌ الرجاء كتابة اسم الشخصية بعد الأمر.\nمثال: ${usedPrefix + command} لوفي`, m);
    }

    const query = `${text} anime`;

    // عمل ريأكت
    try { await conn.sendMessage(m.chat, { react: { text: '👤', key: m.key } }); } catch {}

    // رسالة التحميل
    let progressMsg = await conn.sendMessage(m.chat, { 
      text: `*⋄┄┄┄┄┄┄┄〘جاري الصنع〙┄┄┄┄┄┄┄⋄*\n\n\`انتظر لحظة\` *◈◇◇*` 
    }, { quoted: m });

    // خطوات شريط التحميل
    const steps = ['*◈◇◇*', '*◈◈◇*', '*◈◈◈*', '*◆◈◈*', '*◆◆◈*', '*◆◆◆*'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 400)); // سرّعنا الوقت شوية لـ 400ms عشان ميبقاش بطيء
      await conn.sendMessage(m.chat, { 
        text: `*⋄┄┄┄┄┄┄┄〘جاري الصنع〙┄┄┄┄┄┄┄⋄*\n\n${steps[i]}`,
        edit: progressMsg.key
      });
    }

    // البحث عن الصورة
    gis(query, async (err, results) => {
      if (err || !results || results.length === 0) {
        return conn.reply(m.chat, '❌ لم يتم العثور على أي صور أنمي لهذه الشخصية.', m);
      }

      const imageUrl = results[0].url;
      const inputPath = path.join(process.cwd(), `temp-${Date.now()}.jpg`);
      const outputPath = path.join(process.cwd(), `temp-${Date.now()}.webp`);

      try {
        // تحميل الصورة باستخدام دالة جلب الملفات المدمجة في البوت لضمان الاستقرار
        const download = await conn.getFile(imageUrl);
        if (!download || !download.data) throw new Error("فشل تحميل الصورة");
        
        fs.writeFileSync(inputPath, download.data);

        // تحويل الصورة إلى ملصق باستخدام ffmpeg
        exec(`ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -c:v libwebp -preset default -quality 100 -compression_level 6 -qscale 50 "${outputPath}"`, async (error) => {
          if (error) {
            console.error('FFmpeg error:', error);
            cleanup();
            return conn.reply(m.chat, '❌ حدث خطأ أثناء تحويل الصورة إلى ملصق باستخدام FFmpeg.', m);
          }

          try {
            const webpBuffer = fs.readFileSync(outputPath);
            await conn.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
          } catch (sendError) {
            console.error('Send error:', sendError);
            conn.reply(m.chat, '❌ حدث خطأ أثناء إرسال الملصق الشات.', m);
          }

          cleanup();
        });

      } catch (e) {
        console.error(e);
        conn.reply(m.chat, '❌ حدث خطأ في تحميل الصورة من موقع جوجل.', m);
        cleanup();
      }

      function cleanup() {
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
        try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
      }
    });

  } catch (error) {
    console.error('❌ خطأ في أمر شخصية:', error);
    conn.reply(m.chat, '❌ حدث خطأ غير متوقع أثناء تنفيذ الأمر.', m);
  }
};

handler.help = ['ملصق'];
handler.tags = ['الأدوات'];
handler.command = /^(ملصق|شخصية)$/i;

module.exports = handler;
