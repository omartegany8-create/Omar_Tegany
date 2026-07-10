import gis from 'g-i-s';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async function before(m, { conn, bot }) {
  // الكلمة المفتاحية المطلوبة لتفعيل الرد (الأمر)
  const prefix = "."; // ضع الـ prefix بتاع بوتك هنا لو مختلف
  const command = `${prefix}ملصق`;

  // التحقق إذا كانت الرسالة تبدأ بالأمر
  if (m.text?.startsWith(command)) {
    try {
      // استخراج النص المرسل بعد الأمر (اسم الشخصية)
      const text = m.text.slice(command.length).trim();

      if (!text) {
        return await conn.sendMessage(m.chat, { text: '❌ الرجاء كتابة اسم الشخصية بعد الأمر.' }, { quoted: m });
      }

      const query = `${text} anime`;

      // عمل ريأكت
      try { await conn.sendMessage(m.chat, { react: { text: '👤', key: m.key } }); } catch (e) {}

      // رسالة التحميل بالزخرفة الخاصة بك
      let progressMsg = await conn.sendMessage(m.chat, { 
        text: `*⋄┄┄┄┄┄┄┄〘جاري الصنع〙┄┄┄┄┄┄┄⋄*\n\n\`انتظر لحظة\` *◈◇◇*` 
      }, { quoted: m });

      // خطوات شريط التحميل بالزخرفة الخاصة بك
      const steps = ['*◈◇◇*', '*◈◈◇*', '*◈◈◈*', '*◆◈◈*', '*◆◆◈*', '*◆◆◆*'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 700));
        await conn.sendMessage(m.chat, { 
          text: `*⋄┄┄┄┄┄┄┄〘جاري الصنع〙┄┄┄┄┄┄┄⋄*\n\n${steps[i]}`,
          edit: progressMsg.key
        });
      }

      // البحث عن الصورة
      gis(query, async (err, results) => {
        if (err || !results || results.length === 0) {
          return conn.sendMessage(m.chat, { text: '❌ لم يتم العثور على أي صور أنمي.' }, { quoted: m });
        }

        const imageUrl = results[0].url;
        const inputPath = path.join(process.cwd(), `temp-input-${Date.now()}.jpg`);
        const outputPath = path.join(process.cwd(), `temp-output-${Date.now()}.webp`);

        try {
          // تحميل الصورة باستخدام دالة جلب الملفات المدمجة في البوت لضمان الاستقرار
          const download = await conn.getFile(imageUrl);
          if (!download || !download.data) throw new Error("فشل تحميل الصورة");

          fs.writeFileSync(inputPath, download.data);

          // تحويل الصورة إلى ملصق احترافي باستخدام ffmpeg مع الحفاظ على الأبعاد بدون مطّها
          exec(`ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -c:v libwebp -preset default -quality 100 -compression_level 6 -qscale 50 "${outputPath}"`, async (error) => {
            if (error) {
              console.error('FFmpeg error:', error);
              cleanup();
              return conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء تحويل الصورة إلى ملصق.' }, { quoted: m });
            }

            try {
              const webpBuffer = fs.readFileSync(outputPath);
              await conn.sendMessage(m.chat, { sticker: webpBuffer }, { quoted: m });
            } catch (sendError) {
              console.error('Send error:', sendError);
              await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء إرسال الملصق.' }, { quoted: m });
            }

            cleanup();
          });

        } catch (downloadError) {
          console.error('Download error:', downloadError);
          await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء تحميل الصورة من السيرفر.' }, { quoted: m });
          cleanup();
        }

        function cleanup() {
          try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (e) {}
          try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch (e) {}
        }
      });

      return true;
    } catch (error) {
      console.error('❌ خطأ في أمر شخصية:', error);
      await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: m });
      return true;
    }
  }

  return false;
      }
