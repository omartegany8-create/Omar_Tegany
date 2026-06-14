/*
code: premium group manager & pinning tool (التحكم الكامل وتثبيت الرسائل)
by: 𝐓𝐨جي & Gemini
*/

const handler = async (m, { conn, text, command }) => {
    if (!m.isGroup) return m.reply('❌ الأمر ده للجروبات بس يسطا!');

    // تحويل الأوامر البديلة للاسم الأساسي عشان الـ actions تشتغل صح
    let actCommand = command;
    if (command === 'pin' || command === 'بن') actCommand = 'تثبيت';

    const actions = {
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
            const mime = q.mimetype || (q.msg && q.msg.mimetype) || '';

            if (!/image/.test(mime)) {
                return m.reply('🖼️ ~ رد على صورة فخمة عشان أحطها للجروب!');
            }

            await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
            const media = await q.download();
            
            // تحديث الصورة بميثود Baileys المستقرة
            await conn.updateProfilePicture(m.chat, media);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            m.reply('✅ ~ تم تغيير صورة الجروب بنجاح يا فنان.');
        },

        'تثبيت': async () => {
            // التحقق من وجود رسالة مقتبسة
            if (!m.quoted) return m.reply('📌 ~ رد على الرسالة اللي عايز تثبتها في الجروب فوراً!');

            await conn.sendMessage(m.chat, { react: { text: "📌", key: m.key } });

            // بناء مفتاح الرسالة (Key) المضمون بدون الاعتماد على fakeObj
            const targetKey = {
                remoteJid: m.chat,
                id: m.quoted.id,
                fromMe: m.quoted.fromMe,
                participant: m.quoted.sender
            };

            // ميثود التثبيت الرسمية لـ Baileys
            await conn.sendMessage(m.chat, {
                pin: targetKey,
                type: 1, // 1 لتثبيت الرسالة
                time: 2592000 // مدة التثبيت بالثواني (30 يوم)
            });
            
            m.reply('✅ ~ تم تثبيت الرسالة بنجاح في أعلى الشات للأهمية.');
        }
    };

    const action = actions[actCommand];
    if (!action) return;

    try {
        await action();
    } catch (e) {
        console.error(e);
        m.reply(`❌ حصلت مشكلة يسطا: ${e.message}`);
    }
};

handler.command = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره', 'تثبيت', 'بن', 'pin'];
handler.usage = ['جروب_اسم', 'جروب_وصف', 'جروب_صوره', 'تثبيت'];
handler.category = "admin";
handler.group = true;
handler.admin = true;    
handler.botAdmin = true; 

export default handler;
