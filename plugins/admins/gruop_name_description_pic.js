/*
code: premium group manager & pinning tool (التحكم الكامل وتثبيت الرسائل)
by: 𝐓𝐨جي & Gemini
*/

const handler = async (m, { conn, text, command }) => {
    if (!m.isGroup) return m.reply('❌ الأمر ده للجروبات بس يسطا!');

    const actions = {
        // ربط الكوماند بالـ Key الصحيح عشان يشتغل فوراً
        'جروب_اسم': async () => {
            if (!text) return m.reply('✏️ ~ اكتب الاسم الجديد اللي عايزه للجروب');
            await conn.groupUpdateSubject(m.chat, text);
            m.reply('✅ ~ أبشر! تم تغيير اسم الجروب بنجاح.');
        },

        'جروب_وصف': async () => {
            if (!text) return m.reply('📝 ~ اكتب الوصف الجديد اللي عايزه للجروب');
            await conn.groupUpdateDescription(m.chat, text);
            m.reply('✅ ~ أبشر! تم تحديث وصف الجروب بنجاح.');
        },

        'جروب_صوره': async () => {
            const q = m.quoted ? m.quoted : m;
            const mime = (q.msg || q).mimetype || '';

            if (!/image/.test(mime)) {
                return m.reply('🖼️ ~ رد على صورة فخمة عشان أحطها للجروب!');
            }

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            const media = await q.download();
            
            // استخدام الميثود الأضمن والأحدث لتغيير صورة المجموعة
            await conn.updateProfilePicture(m.chat, media);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            m.reply('✅ ~ تم تغيير صورة الجروب بنجاح يا فنان.');
        },

        'تثبيت': async () => {
            // التحقق من أن الأدمن رد على الرسالة المراد تثبيتها
            if (!m.quoted) return m.reply('📌 ~ رد على الرسالة اللي عايز تثبتها في الجروب فوراً!');

            await conn.sendMessage(m.chat, { react: { text: "📌", key: m.key } });

            // ميثود التثبيت الرسمية والذكية في تحديثات الواتساب (Baileys)
            await conn.sendMessage(m.chat, {
                pin: m.quoted.fakeObj.key,
                type: 1, // النوع 1 يعني تثبيت الرسالة (Pin)
                time: 2592000 // مدة التثبيت التلقائي بالثواني (هنا حد أقصى 30 يوم)
            });
            
            m.reply('✅ ~ تم تثبيت الرسالة بنجاح في أعلى الشات للأهمية.');
        }
    };

    const action = actions[command];
    if (!action) return;

    try {
        await action();
    } catch (e) {
        console.error(e);
        m.reply(`❌ حصلت مشكلة يسطا: ${e.message}`);
    }
};

// تجميع كل الأوامر والـ Shortcuts المروقة
handler.command = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره', 'تثبيت', 'بن', 'pin'];
handler.usage = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره', 'تثبيت'];
handler.category = "admin";
handler.group = true;
handler.admin = true;    // الأمر للأدمن فقط
handler.botAdmin = true; // يتطلب أن يكون البوت أدمن لتنفيذ التغييرات والتثبيت

export default handler;
