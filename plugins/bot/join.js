import { jidNormalizedUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, command, usedPrefix, args, isOwner }) => {
    try {
        if (!isOwner) {
            return conn.sendMessage(m.chat, { text: 'هذا الأمر مخصص فقط للمالك.' }, { quoted: m });
        }

        if (!text) {
            return conn.sendMessage(m.chat, { text: `الرجاء إدخال رابط المجموعة. مثال:\n*${usedPrefix + command}* https://chat.whatsapp.com/abcdefghijk` }, { quoted: m });
        }

        let inviteLink = text.split(' ')[0];
        // تعبيرات منتظمة محسّنة لاستخراج رمز الدعوة المكون من 22 حرفًا، سواء كان رابطًا كاملاً أو مجرد الرمز.
        const regex = /(?:https?:\/\/chat\.whatsapp\.com\/)?([0-9A-Za-z]{22})(?:[\/?].*)?$/;
        const match = inviteLink.match(regex);

        if (!match) {
            return conn.sendMessage(m.chat, { text: '❌ الرابط غير صالح. يرجى إدخال رابط دعوة واتساب صحيح.' }, { quoted: m });
        }

        let code = match[1]; // الرمز هو المجموعة الملتقطة الأولى

        try {
            const res = await conn.groupAcceptInvite(code);
            if (res) {
                // حاول جلب بيانات تعريف المجموعة لعرض الاسم بدلاً من JID
                let groupName = res; // افتراضيًا، استخدم JID
                try {
                    const metadata = await conn.groupMetadata(res);
                    if (metadata && metadata.subject) {
                        groupName = metadata.subject;
                    }
                } catch (metaError) {
                    console.error('Failed to fetch group metadata:', metaError);
                    // لا تفعل شيئًا، سيبقى groupName هو JID
                }
                await conn.sendMessage(m.chat, { text: `✅ انضممت بنجاح إلى المجموعة: *${groupName}*` }, { quoted: m });
                // اختياري: إرسال رسالة ترحيب إلى المجموعة الجديدة
                // await conn.sendMessage(res, { text: 'مرحباً، أنا بوت Sonic AI Ultimate Developer! شكرًا على دعوتي.' });
            } else {
                // هذا الجزء قد لا يتم الوصول إليه أبدًا إذا كان groupAcceptInvite يرمي خطأ عند الفشل
                return conn.sendMessage(m.chat, { text: '❌ فشلت في الانضمام إلى المجموعة.' }, { quoted: m });
            }
        } catch (e) {
            console.error('Error joining group:', e); // تسجيل الخطأ كاملاً للمراجعة
            let errorMessage = '❌ حدث خطأ أثناء محاولة الانضمام إلى المجموعة.';
            if (e.message.includes('group doesn\'t exist')) {
                errorMessage = '❌ يبدو أن رابط المجموعة غير صالح أو المجموعة غير موجودة.';
            } else if (e.message.includes('join request is pending')) {
                errorMessage = '❌ تم إرسال طلب الانضمام، ولكن يجب على مشرف المجموعة الموافقة عليه.';
            } else if (e.message.includes('This group is full')) {
                errorMessage = '❌ المجموعة ممتلئة ولا يمكنني الانضمام إليها.';
            } else if (e.message.includes('invalid invite link')) {
                errorMessage = '❌ رابط الدعوة غير صالح.';
            } else if (e.message.includes('account_reachout_restricted')) {
                errorMessage = '❌ لا يمكن للبوت الانضمام إلى المجموعة بسبب قيود على حسابه.';
            } else {
                // إضافة تفاصيل الخطأ الأصلي للتشخيص إذا لم تتطابق أي من الحالات المعروفة
                errorMessage += `\nالتفاصيل: ${e.message}`;
            }
            return conn.sendMessage(m.chat, { text: errorMessage }, { quoted: m });
        }
    } catch (e) {
        console.error(e)
        return conn.sendMessage(m.chat, { text: "❌ " + e.message }, { quoted: m })
    }
}

handler.help = ['join <رابط المجموعة>', 'انضم <رابط المجموعة>']
handler.tags = ['owner']
handler.command = ['join', 'انضم']

export default handler