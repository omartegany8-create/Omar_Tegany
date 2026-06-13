/*
code: advanced group control & ironclad security system (ULTIMATE FIX)
by: 𝐓𝐨جي & Gemini
*/

let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        // رقمك الخاص كمطور أساسي وصاحب البوت (عمر)
        const DEV_NUMBER = '201158601817@s.whatsapp.net';
        
        // جلب جيد (JID) البوت نفسه عشان نمنع المحاكاة الغبية
        const BOT_NUMBER = conn.user.id.split(':')[0] + '@s.whatsapp.net';

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

        // جلب العضو المستهدف
        let user = getUser();
        const isTargetAdminCheck = user ? groupAdmins.includes(user) : false;

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
            // جلب قائمة كل الأعضاء المنشنين في الرسالة، أو العضو المردود عليه
            let usersToKick = m.mentionedJid && m.mentionedJid.length > 0 ? m.mentionedJid : (m.quoted ? [m.quoted.sender] : []);

            // إذا لم يتم تحديد أي عضو (لا منشن ولا رد)
            if (usersToKick.length === 0) {
                if (!isSenderAdmin && !isSenderOwner) return; // تجاهل العضو العادي
                return m.reply("*🕷️ منشن عضو، أو رد على الشخص اللي عايز تطرده*");
            }

            // مصفوفة لتجميع الأعضاء المستحقين للطرد الشرعي بعد الفحص
            let finalKickList = [];

            for (let targetUser of usersToKick) {
                // [تأمين المحاكاة]: لو الأمر مبعوث من البوت نفسه والمستهدف هو الأونر نفسه، يتجاهله
                if (m.sender === BOT_NUMBER && isBotOwner(targetUser)) {
                    continue; 
                }

                // 1. الأمان الأكبر: لو حد جرب يطردك إنت كـ مطور البوت -> طرد فوري للفاعل وقفل العملية
                if (isBotOwner(targetUser)) {
                    await m.reply("بتهزر معي ؟");
                    return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }

                // فحص هل المستهدف الحالي مشرف في الجروب
                // (تأكد أن متغير participants متاح عندك في السورس كـ metadata.participants)
                const isTargetAdmin = participants ? participants.some(p => p.id === targetUser && p.admin) : false;

                // 2. فخ الحماية: لو عضو عادي جرب يطرد مشرف
                if (!isSenderAdmin && !isSenderOwner && isTargetAdmin) {
                    await m.reply("*يجدع؟ 😂 طب بص تحت كدا 👇🏻*");
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                    return conn.sendMessage(m.chat, {
                        text: `*صاحبنا دمو خفيف كان عايز يطردني 🥰*`
                    });
                }

                // 3. منع الأعضاء العاديين من طرد بعضهم البعض
                if (!isSenderAdmin && !isSenderOwner) {
                    return m.reply("❌انت مالك بالاوامر دي ؟ متستخدمهاش تاني احسنلك !");
                }

                // منع البوت من طرد نفسه بالخطأ لو حصل تداخل
                if (targetUser === BOT_NUMBER) {
                    m.reply("❌ عايزني أطرد نفسي يسطا؟ مش للدرجادي! 😂");
                    continue;
                }

                // إذا تخطى كل الفحوصات بسلام، يضاف لقائمة الطرد
                finalKickList.push(targetUser);
            }

            // تنفيذ الطرد الجماعي الشرعي للأعضاء المحددين
            if (finalKickList.length > 0) {
                await conn.groupParticipantsUpdate(m.chat, finalKickList, 'remove');
                
                // تنسيق رسالة التأكيد بناءً على عدد المطرودين
                let kickedMentions = finalKickList.map(u => `@${u.split('@')[0]}`).join(', ');
                return conn.sendMessage(m.chat, {
                    text: `*🕷️ تم طرد:* ${kickedMentions}`,
                    mentions: finalKickList
                }, { quoted: m });
            }
}
        
        // ═════════════════ [ أمر رفع ] ═════════════════
        if (command === "رفع") {
            // لو عضو عادي كتب .رفع -> العقاب والتهزيء فوراً
            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("*يجدع ؟ \nالمره الجاية انا الي هرفعك...*");
            }

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
control.admin = false; 
control.botAdmin = true;
control.category = "admin";
export default control;
