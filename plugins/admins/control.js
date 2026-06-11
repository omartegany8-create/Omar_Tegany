/*
code: advanced group control & ironclad security system (WITH ZARF COMMAND)
by: 𝐓𝐨جي & Gemini
*/

let control = async (m, { command, text, conn, bot, participants }) => {
    try {
        // رقمك الخاص كمطور أساسي وصاحب البوت (عمر)
        const DEV_NUMBER = '201158601817@s.whatsapp.net';
        
        // جلب جيد (JID) البوت نفسه عشان نمنع المحاكاة
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

        // ═════════════════ [ أمر زرف (نسف الجروب) ] ═════════════════
        if (command === "زرف") {
            // الأمان المطلق: مستحيل أي حد يشغل الأمر ده غيرك أنت شخصياً (عمر)
            if (!isSenderOwner) return m.reply("❌ العب بعيد يا شاطر.. الأمر ده للأسياد بس! 🤫🔥");

            await m.reply("🚀 *جـاري تـصـفـيـر ونـسـف الـمـجـمـوعـة بـالـكـامـل... بـاي بـاي!* 💀💥");

            // جلب كل الأعضاء في الجروب ما عدا البوت نفسه
            let targets = participants.map(p => p.id).filter(id => id !== BOT_NUMBER);

            // طرد جماعي لكل الأعضاء برمشة عين
            for (let target of targets) {
                try {
                    await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
                } catch {
                    // تخطي أي عضو لو حصلت مشكلة سيرفر أو كان هو المنشئ الأساسي عشان الكود ميفصلش
                    continue;
                }
            }

            // بعد طرد الجميع البوت يخرج ببرستيج وكبرياء
            await conn.sendMessage(m.chat, { text: "🎯 تم النسف بنجاح. تصفير شامل! 🔥✈️" });
            return await conn.groupLeave(m.chat);
        }

        // ═════════════════ [ أمر ضيف ] ═════════════════
        if (command === "ضيف") {
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
            if (!user) {
                if (!isSenderAdmin && !isSenderOwner) return; 
                return m.reply("*🕷️ منشن أو رد على العضو اللي عايز تطرده*");
            }

            if (m.sender === BOT_NUMBER && isBotOwner(user)) return; 

            if (isBotOwner(user)) {
                await m.reply("بتهزر معي ؟");
                return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            }

            if (!isSenderAdmin && !isSenderOwner && isTargetAdminCheck) {
                await m.reply("يجدع؟ 😂 طب بص تحت كدا 👇🏻");
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                return conn.sendMessage(m.chat, {
                    text: `صاحبنا دمو خفيف كان عايز يطرد الادمن 🥰`
                });
            }

            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("❌ معندكش صلاحيات طرد يا حب!");
            }

            if (user === BOT_NUMBER) return m.reply("❌ عايزني أطرد نفسي يسطا؟ مش للدرجادي! 😂");

            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            return m.reply("*🕷️ تم الطرد بنجاح*");
        }
        
        // ═════════════════ [ أمر رفع ] ═════════════════
        if (command === "رفع") {
            if (!isSenderAdmin && !isSenderOwner) {
                return m.reply("يجدع ؟ \nالمره الجاية انا الي هرفعك...*");
            }

            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أرفعه*");

            if (isBotOwner(user)) {
                return m.reply("بترفع مين يسطا منا ادمن اصلا 🙂");
            }

            await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
            return m.reply("*🕷️ تم الرفع لأدمن بنجاح*");
        }
        
        // ═════════════════ [ أمر خفض ] ═════════════════
        if (command === "خفض") {
            if (!isSenderAdmin && !isSenderOwner) return;

            if (!user) return m.reply("*🕷️ منشن أو رد على العضو عشان أخفضه*");

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

control.usage = ['ضيف', 'طرد', 'رفع', 'خفض', 'زرف'];
control.command = ['ضيف', 'طرد', 'رفع', 'خفض', 'زرف'];
control.admin = false; 
control.botAdmin = true;
control.category = "admin";
export default control;
