/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: تحميل مقاطع الريلز والفيديوهات من انستغرام عبر API Siputzx
 */

import axios from 'axios';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        // 1. التحقق من وجود الرابط
        if (!args[0]) {
            return m.reply(`*⚠️ عذراً، يرجى إدخال رابط فيديو أو ريلز انستغرام!*\n\n*💡 مثال الاستخدام:*\n\`${usedPrefix + command} https://www.instagram.com/reel/DZwKgQVBQtv/\``);
        }

        const targetUrl = args[0];
        
        // التحقق الأولي هل الرابط خاص بـ انستغرام فعلاً
        if (!targetUrl.includes('instagram.com')) {
            return m.reply('*❌ عذراً، هذا الرابط ليس رابط انستغرام صحيح!*');
        }

        // تفاعل بالانتظار
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // 2. الاتصال بـ الـ API مع عمل Encode للرابط لحمايته من الرموز الخاصة
        const apiUrl = `https://api.siputzx.my.id/api/d/igram?url=${encodeURIComponent(targetUrl)}`;
        const response = await axios.get(apiUrl);
        const result = response.data;

        // 3. فحص البيانات المستلمة بناءً على استجابة الـ API
        if (!result.status || !result.data || !result.data.url || result.data.url.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply('*❌ فشل في جلب بيانات الفيديو من الـ API، قد يكون الحساب خاص أو الرابط غير صالح حالياً.*');
        }

        // استخراج الرابط والعنوان والـ Thumbnail
        const videoData = result.data.url[0];
        const videoUrl = videoData.url;
        const videoTitle = result.data.meta?.title || 'Instagram Video';
        
        // إشعار المستخدم ببدء الرفع (Recording/Uploading status)
        await conn.sendPresenceUpdate('recording', m.chat);

        // 4. إرسال الفيديو مباشرة للمستخدم مع النص المرافق له
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `*🎬 ───〔 𝖲𝖮𝖭𝖨𝖢 𝖨𝖭𝖲𝖳𝖠𝖦𝖱𝖠𝖬 〕─── 🎬*\n\n📌 *العنوان:* ${videoTitle.substring(0, 300)}${videoTitle.length > 300 ? '...' : ''}\n\n*✨ بواسطة: SonicBot-MD*`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        // تفاعل بالنجاح
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error(e);
        // تفاعل بالفشل في حالة الكراش أو انقطاع السيرفر
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('*❌ واجه النظام مشكلة:*\\n\`' + e.message + '\`');
    }
}

handler.help = ['انستا', 'ig'];
handler.tags = ['التحميل 📥'];
handler.command = ['انستا', 'ig', 'instagram', 'igdl'];

export default handler;