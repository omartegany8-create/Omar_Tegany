/*
code: premium smart warning system with owner protection (نظام الإنذارات المطور وحماية ميرو)
by: 𝐓𝐨جي & Gemini
*/

const handler = async (m, { conn, command }) => {
    let targetJid = m.mentionedJid?.[0] || m.quoted?.sender;

    if (!targetJid) return m.reply('⚠️ *يرجى منشن الشخص أو الرد على رسالته لإعطائه إنذار!*');

    // جلب بيانات الجروب للتأكد من وجود المستخدم وفحص الرتب
    const metadata = await conn.groupMetadata(m.chat);
    const participants = metadata.participants;
    const userExists = participants.find(p => p.id === targetJid);

    if (!userExists) return m.reply("❌ *المستخدم ده مش موجود في الجروب يسطا!*");

    // 🛡️ فخ الحماية الأسطوري: لو حد جرب يديك إنت (مطور البوت) إنذار
    // الفحص هنا بيبص على دالة الأونر أو لو الرقم المكتوب فيه رقمك (تلقائي)
    const isTargetOwner = global.isBotOwner ? global.isBotOwner(targetJid) : (targetJid === m.sender || targetJid.includes('201'));
    
    if (isTargetOwner) { 
        await conn.sendMessage(m.chat, { react: { text: "👑", key: m.key } });
        
        // عودة الحق على الفاعل (الشخص اللي كتب الأمر)
        targetJid = m.sender;

        const ownerRoasts = [
            "⚠️ *بتحاول تدي إنذار للمطور؟* 😂 طب خد عندك بقا الإنذار ده ليك إنت!",
            "⚠️ *إيدك سبقت عقلك؟* 🪄 الحركة دي هتكلفك يغالي.. الإنذار اتحول ليك!"
        ];
        const randomRoast = ownerRoasts[Math.floor(Math.random() * ownerRoasts.length)];
        await m.reply(randomRoast);
    }

    // تجهيز الداتا بيز للجروب بناءً على سستم السورس عندك عشان ميعملش خطأ
    global.db ??= {};
    global.db.groups ??= {};
    global.db.groups[m.chat] ??= {};
    global.db.groups[m.chat].warnings ??= {};
    
    const warningsDB = global.db.groups[m.chat].warnings;

    // زيادة عدد الإنذارات للشخص المستهدف
    const warnCount = warningsDB[targetJid] = (warningsDB[targetJid] || 0) + 1;

    await conn.sendMessage(m.chat, { react: { text: "⚠️", key: m.key } });

    // إرسال رسالة الإنذار الفخمة والمنسقة
    await conn.sendMessage(m.chat, {
        text: `⚠️ *تـم إعـطـاء إنـذار جـديـد!* ⚠️\n\n👤 *الـمـسـتـهدف:* @${targetJid.split("@")[0]}\n📊 *إجمالي الإنذارات:* [ *${warnCount} من 3* ]\n\n> روق كدا عشان متكلش طرد المره الجاية! _ 🚷`,
        mentions: [targetJid]
    }, { quoted: m });

    // 🚷 الفحص الفوري: لو وصل 3 إنذارات يطرد في نفس الثانية
    if (warnCount >= 3) {
        await conn.sendMessage(m.chat, {
            text: `🚫 @${targetJid.split("@")[0]} *أنت تخطيت الحد الأقصى من القوانين والإنذارات (3/3).. مع السلامة يا حب!* 🚪✈️`,
            mentions: [targetJid]
        }, { quoted: m });

        await conn.groupParticipantsUpdate(m.chat, [targetJid], "remove");
        delete warningsDB[targetJid]; // تصفير العداد بعد الطرد
    }
};

// الـ قبل (before) يفضل شغال لحماية الجروب لو فيه داتا قديمة متسجلة
handler.before = async (m, { conn }) => {
    const g = global.db?.groups?.[m.chat];
    if (!g?.warnings) return false;

    const user = m.sender;
    if (!g.warnings[user]) return false;

    if (g.warnings[user] >= 3) {
        await conn.sendMessage(m.chat, {
            text: `🚫 @${user.split("@")[0]} *أنت برضه عندك 3 إنذارات وقد أعذر من أنذر.. طرد!*`,
            mentions: [user]
        });
        await conn.groupParticipantsUpdate(m.chat, [user], "remove");
        delete g.warnings[user];
    }
    return false;
};

handler.command = ["انذار", "كارت اصفر", "warn"];
handler.usage = ['انذار'];
handler.category = "admin";
handler.group = true;       
handler.admin = true;       
handler.botAdmin = true;    

export default handler;
