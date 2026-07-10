/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️
 * 🎯 الوظيفة: إرسال جهة اتصال المالك 3 مرات متتالية بشكل مروّس واحترافي
 */

export default async function before(m, { conn, bot }) {
  const prefix = ".";
  const command = `${prefix}طيير1`;

  // التحقق إذا كان ميرو هو اللي كتب الأمر (حماية عشان محدش يستخدمه غيرك)
  if (m.text?.startsWith(command)) {
    // يمكنك تفعيل سطر الحماية القادم لو عايز أنت بس اللي تشغله:
    // if (!m.key.fromMe) return false;

    try {
      // 1. تحديد بيانات رقمك والاسم المزخرف الخاص بك يا ميرو
      let number = '201158601817'; 
      let displayName = '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️';
      let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

      // عمل ريأكت عنكبوت لبدء الأمر
      try { await conn.sendMessage(m.chat, { react: { text: '🕷️', key: m.key } }); } catch (e) {}

      // 2. حلقة تكرار لإرسال كارت جهة اتصالك 3 مرات متتالية مع حقوق الجروب والقناة
      for (let i = 0; i < 3; i++) {
        await conn.sendMessage(m.chat, { 
            contacts: { 
                displayName: displayName, 
                contacts: [{ vcard }] 
            },
            contextInfo: {
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363416870755391@newsletter",
                serverMessageId: 100,
                newsletterName: "𓆩 𝒀𝑨𝑮𝑨𝑴𝑰 𝑳𝑰𝑮𝑯𝑻 𓆪 🕷️"
              },
              externalAdReply: {
                title: "𓆩 𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪",
                body: "اضغط هنا للانضمام لمجتمعنا ⚡",
                mediaType: 1,
                thumbnailUrl: "https://i.pinimg.com/originals/bb/77/0f/bb770fad66a634a6b3bf93e9c00bf4e5.jpg",
                sourceUrl: "https://chat.whatsapp.com/ItDxM47hQciHG4QdxV3aA0?s=cl&p=a&ilr=4&amv=3",
                renderLargerThumbnail: false
              }
            }
        }, { quoted: m });
        
        // مهلة زمنية صغيرة جداً (نصف ثانية) بين الإرسال لضمان عدم تعليق السيرفر
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return true;
    } catch (error) {
      console.error('❌ خطأ في أمر طيير1:', error);
      return true;
    }
  }

  return false;
}
