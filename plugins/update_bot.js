import { exec } from 'child_process';

const handler = async (m, { conn, isROwner }) => {
    // 1. فحص الهوية الصارم للمطور الأساسي
    if (!isROwner) return m.reply('❌ للمطور فقط يا حب');

    // ريأكت البدء والتحميل
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    await m.reply('📥 *جاري الاتصال بـ GitHub وسحب التحديثات الجديدة...*');

    // 2. تنفيذ أمر git pull داخلياً في السيرفر/الثرمكس
    exec('git pull', async (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
            return m.reply(`❌ *حصلت مشكلة أثناء السحب:* \n\`\`\`${err.message}\`\`\``);
        }

        // لو السورس محدث بالفعل ومش محتاج سحب
        if (stdout.includes('Already up to date.') || stdout.includes('محدث بالفعل')) {
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return m.reply('✨ *البوت محدث بالفعل يسطا على آخر نسخة في GitHub!*');
        }

        // 3. لو فيه ملفات جديدة نزلت بنجاح
        let updateReport = `✅ *تم سحب التحديثات بنجاح!*\n\n*📋 تقرير الـ Git:*\n\`\`\`${stdout}\`\`\`\n\n🔄 *جاري إعادة تشغيل البوت لتطبيق التغييرات تلقائياً...*`;
        await m.reply(updateReport);

        // ريأكت الهيبة والاستعداد للقفل
        await conn.sendMessage(m.chat, { react: { text: "💀", key: m.key } });

        // انتظار ثانيتين للتأكد من وصول الرسائل ثم القفل لعمل ريستارت تلقائي
        await new Promise(r => setTimeout(r, 2000));
        process.exit(0);
    });
};

handler.help    = ['re'];
handler.tags    = ['owner'];
handler.command = /^(re|تحديث_تلقائي)$/i;
handler.rowner  = true; // قفل للأونر الأساسي فقط لحماية السورس

export default handler;
