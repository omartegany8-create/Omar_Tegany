/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 الوظيفة: إرسال جهة اتصال محددة 3 مرات متتالية فقط بشكل صامت
 */

let handler = async (m, { conn }) => {
    // 1. تحديد بيانات الرقم المستهدف الجديد والاسم المزخرف
    let number = '201158601817';
    let displayName = 'mero 🕷️';
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${displayName}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;

    // 2. حلقة تكرار لإرسال بطاقة جهة الاتصال 3 مرات متتالية فقط
    for (let i = 0; i < 3; i++) {
        await conn.sendMessage(m.chat, { 
            contacts: { 
                displayName: displayName, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: m });
        
        // مهلة زمنية صغيرة جداً (نصف ثانية) بين الإرسال لضمان عدم تعليق السيرفر
        await new Promise(resolve => setTimeout(resolve, 500));
    }
};

handler.help = ['طيير1'];
handler.tags = ['owner'];
handler.command = /^طيير1$/i;
handler.owner = true; // للأمان، الأمر خاص بك أنت فقط

export default handler;
