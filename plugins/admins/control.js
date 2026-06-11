/*
code: advanced group control & ironclad security system (FIXED)
by: 𝐓𝐨جي & Gemini
*/

let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        // رقمك الخاص كمطور أساسي وصاحب البوت المثبت في قلب الكود
        const DEV_NUMBER = '201158601817@s.whatsapp.net';

        // دالة صارمة للتحقق هل المستخدم هو المطور (عمر)
        const isBotOwner = (userId) => {
            if (userId === DEV_NUMBER) return true;
            if (!bot.config || !bot.config.owners) return false;
            return bot.config.owners.some(owner => 
                owner.jid === userId || owner.lid === userId
            );
        };

        // دالة دقيقة لجلب الجيد (JID) الخاص بالعضو المستهدف
        const getUser = () => {
            if (m.quoted) return m.quoted.sender;
            if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
            if (text) {
                let cleaned = text.replace(/[^0-9]/g, '');
                if (cleaned) return cleaned + "@s.whatsapp.net";
            }
            return null;
        };

        // فحص الصلاحيات الفعلي داخل الجروب
        const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id);
        const isSenderAdmin = groupAdmins.includes(m.sender);
        const isSenderOwner = isBotOwner(m.sender);

        // الحماية المشددة: منع الأعضاء العاديين من تشغيل الأوامر نهائياً إلا لو داخلين يستهبلوا
        const isTargetAdminCheck = getUser() ? groupAdmins.includes(getUser()) : false;

        // ═════════════════ [ أمر ضيف ] ═════════════════
        if (command === "ضيف") {
            // العضو العادي ممنوع تماماً من الإضافة
            if (!isSenderAdmin && !isSenderOwner) return;

            if (!text && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
                await conn.sendMessage(m.chat, { react: { text: "⁉️", key: m.key } });
                return m.reply("فين الرقم؟");
            }

            let userToAdd = getUser();
            if (!userToAdd) return m.reply("❌ الرقم غير صحيح يسطا!");

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
            if (!user) {
                if (!isSenderAdmin && !isSenderOwner) return; // لو عضو عادي كاتب .طرد هباءً يتجاهله البوت
                return m.reply("*🕷️ منشن أو رد على العضو اللي عايز تطرده*");
            }

            // 1. الأمان الأكبر: لو حد جرب يطردك إنت كـ مطور البوت -> طرد فوري للفاعل
            if (isBotOwner(user)) {
                await m.reply("بتهزر معي ؟");
                return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }

            // 2. فخ الحماية: لو عضو عادي جرب يطرد مشرف
            if (!isSenderAdmin && !isSenderOwner && isTargetAdminCheck) {
                await m.reply("يجدع؟ 😂 طب بص تحت كدا 👇🏻");
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                return conn.sendMessage(m.chat, {
                    text: `صاحبنا دمو خفيف كان عايز يطرد الادمن 🥰`
                });
            }

            // 3. منع الأعضاء العاديين من طرد بعضهم البعض
            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("❌ معندكش صلاحيات طرد يا حب!");
            }

            // الطرد الشرعي للأدمن والمطور
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            return m.reply("*🕷️ تم الطرد بنجاح*");
        }
        
        // ═════════════════ [ أمر رفع ] ═════════════════
        if (command === "رفع") {
            // لو عضو عادي كتب .رفع -> العقاب والتهزيء فوراً
            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("يجدع ؟ \nالمره الجاية انا الي هرفعك...*");
            }

            let user = getUser();
            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أرفعه*");

            // لو مشرف حب يرفعك (البوت ينبهه إنك فوق الكل)
            if (isBotOwner(user)) {
                return m.reply("بترفع مين يسطا منا ادمن اصلا 🙂");
            }

            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            return m.reply("*🕷️ تم الرفع لأدمن بنجاح*");
        }
        
        // ═════════════════ [ أمر خفض ] ═════════════════
        if (command === "خفض") {
            // العضو العادي ممنوع تماماً
            if (!isSenderAdmin && !isSenderOwner) return;

            let user = getUser();
            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أخفضه*");

            // حماية المطور من الخفض
            if (isBotOwner(user)) {
                if (isSenderAdmin && !isSenderOwner) {
                    return m.reply("هتهزر معي ؟\n(متخفش يعم مش هطردك انت حبيبي 🤍)");
                } else {
                    await m.reply("بتهزر معي ؟");
                    return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }
            }

            await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
            return m.reply("*🕷️ تم الخفض بنجاح*");
        }
        
    } catch (error) {
        await m.reply("❌ " + error.message);
    }
};

control.usage = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.command = ['ضيف', 'طرد', 'رفع', 'خفض'];
control.admin = false; // سيبناها كدة بس حطينا فلاتر داخلية تمنع استغلال الأعضاء للأمر
control.botAdmin = true;
control.category = "admin";
export default control;
