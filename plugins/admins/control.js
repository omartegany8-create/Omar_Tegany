/*
code: advanced group control & ironclad security system
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        // رقمك الخاص كمطور أساسي وصاحب البوت لتأمين مطلق
        const DEV_NUMBER = '201158601817@s.whatsapp.net';

        // دالة للتحقق هل المستخدم هو المطور (سواء بالرقم المثبت أو من الإعدادات)
        const isBotOwner = (userId) => {
            if (userId === DEV_NUMBER) return true;
            if (!bot.config || !bot.config.owners) return false;
            return bot.config.owners.some(owner => 
                owner.jid === userId || owner.lid === userId
            );
        };

        // دالة لجلب الجيد (JID) الخاص بالعضو المستهدف
        const getUser = () => {
            if (m.quoted) return m.quoted.sender;
            if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
            if (text) {
                // تنظيف النص من أي علامات أو مسافات لاستخراج الرقم النظيف
                let cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned) return cleaned + "@s.whatsapp.net";
            }
            return null;
        };

        // فحص صلاحيات الجروب والمشرفين
        const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isSenderAdmin = groupAdmins.includes(m.sender);
        const isSenderOwner = isBotOwner(m.sender);

        // ═════════════════ [ أمر ضيف ] ═════════════════
        if (command === "ضيف") {
            // لو كتب .ضيف من غير أي حاجة (رقم أو رد)
            if (!text && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
                await conn.sendMessage(m.chat, { react: { text: "⁉️", key: m.key } });
                return m.reply("فين الرقم؟");
            }

            let userToAdd = getUser();
            if (!userToAdd) return m.reply("❌ الرقم غير صحيح أو غير مفهوم يسطا!");

            await conn.sendMessage(m.chat, { react: { text: "👤", key: m.key } });
            await conn.groupParticipantsUpdate(m.chat, [userToAdd], 'add');
            
            return conn.sendMessage(m.chat, {
                text: `تمت إضافة @${userToAdd.split('@')[0]} بنجاح 👤✅`,
                mentions: [userToAdd]
            }, { quoted: m });
        }
        
        // ═════════════════ [ أمر طرد ] ═════════════════
        if (command === "طرد") {
            let user = getUser();
            if (!user) return m.reply("*🕷️ منشن أو رد على العضو اللي عايز تطرده*");

            // 1. لو حد حب يطردك إنت (المطور) -> يتطرد هو فوراً حتى لو مشرف
            if (isBotOwner(user)) {
                await m.reply("بتهزر معي ؟");
                return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }

            // 2. لو عضو عادي (مش أدمن) حب يطرد مشرف في الجروب
            const isTargetAdmin = groupAdmins.includes(user);
            if (!isSenderAdmin && !isSenderOwner && isTargetAdmin) {
                await m.reply("يجدع؟ 😂 طب بص تحت كدا 👇🏻");
                // طرد العضو قليل الأدب اللي جرب يطرد الأدمن
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                return conn.sendMessage(m.chat, {
                    text: `صاحبنا دمو خفيف كان عايز يطرد الادمن 🥰`
                });
            }

            // 3. الطرد العادي (المشرفين بيطردوا الأعضاء أو بعض، والمطور بيطرد الكل)
            // بما إن الكود متثبت له control.admin = true، العضو العادي مش هيقدر يطرد عضو عادي أصلاً
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            return m.reply("*🕷️ تم الطرد بنجاح*");
        }
        
        // ═════════════════ [ أمر رفع ] ═════════════════
        if (command === "رفع") {
            // لو عضو عادي (مش أدمن ومش مطور) كتب .رفع
            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("يجدع ؟ \nالمره الجاية انا الي هرفعك...*");
            }

            let user = getUser();
            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أرفعه*");

            // لو مشرف حب يرفعك إنت (وأنت أصلاً الأدمن والمطور)
            if (isBotOwner(user)) {
                return m.reply("بترفع مين يسطا منا ادمن اصلا 🙂");
            }

            // الرفع العادي للمشرفين والمطور
            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            return m.reply("*🕷️ تم الرفع لأدمن بنجاح*");
        }
        
        // ═════════════════ [ أمر خفض ] ═════════════════
        if (command === "خفض") {
            let user = getUser();
            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أخفضه*");

            // لو حد حب يعملك خفض إنت كـ مطور البوت
            if (isBotOwner(user)) {
                // لو اللي عمل الأمر (مشرف) -> يرد عليه بالرسالة دي بس بدون طرد
                if (isSenderAdmin && !isSenderOwner) {
                    return m.reply("هتهزر معي ؟\n(متخفش يعم مش هطردك انت حبيبي 🤍)");
                } 
                // لو عضو عادي أو أي حالة تانية تخطت الفلاتر وحبت تعمل خفض للمطور -> يعامل معاملة الطرد الفوري
                else {
                    await m.reply("بتهزر معي ؟");
                    return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
            }

            // الخفض العادي بين المشرفين وللمطور
            await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
            return m.reply("*🕷️ تم الخفض بنجاح*");
        }
        
    } catch (error) {
        await m.reply("❌ " + error.message);
    }
};

control.usage = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.command = ['ضيف', 'طرد', 'رفع', 'خفض'];
// عطلنا الـ admin الإجباري هنا عشان نقدر نلقط العضو العادي لما يكتب ".رفع" أو لما يحاول يطرد أدمن ونديه الجزاء بتاعه
control.admin = false; 
control.botAdmin = true;
control.category = "admin";
export default control;
