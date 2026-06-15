/*
code: premium text-based capitals guessing game (لعبة تخمين العواصم الفخمة)
by: Gemini
*/

// داتا بيز العواصم (تقدر تزود دول وعواصم تانية هنا براحتك يسطا)
const capitalsData = [
    { country: "مصر", capital: "القاهرة" },
    { country: "السعودية", capital: "الرياض" },
    { country: "اليابان", capital: "طوكيو" },
    { country: "فرنسا", capital: "باريس" },
    { country: "المغرب", capital: "الرباط" },
    { country: "العراق", capital: "بغداد" },
    { country: "ألمانيا", capital: "برلين" },
    { country: "المملكة المتحدة (بريطانيا)", capital: "لندن" },
    { country: "إيطاليا", capital: "روما" },
    { country: "الإمارات", capital: "ابو ظبي" },
    { country: "الكويت", capital: "الكويت" },
    { country: "فلسطين", capital: "القدس" },
    { country: "الجزائر", capital: "الجزائر" },
    { country: "تونس", capital: "تونس" },
    { country: "الأردن", capital: "عمان" },
    { country: "لبنان", capital: "بيروت" },
    { country: "سوريا", capital: "دمشق" },
    { country: "إسبانيا", capital: "مدريد" },
    { country: "روسيا", capital: "موسكو" },
    { country: "البرازيل", capital: "برازيليا" },
    { country: "كوريا الجنوبية", capital: "سيول" },
    { country: "الأرجنتين", capital: "بوينس ايرس" },
    { country: "تركيا", capital: "انقرة" },
    { country: "قطر", capital: "الدوحة" },
    { country: "السودان", capital: "الخرطوم" }
];

const handler = async (m, { conn, command, text }) => {
    global.capitalsGame ??= {};
    
    // ميزة إنهاء اللعبة لو معلقة
    if (text === 'حذف' || text === 'انهاء') {
        if (!global.capitalsGame[m.chat]) return m.reply("❌ مفيش جولة عواصم شغالة حالياً عشان أقفلها!");
        delete global.capitalsGame[m.chat];
        await conn.sendMessage(m.chat, { react: { text: "🗑️", key: m.key } });
        return m.reply("🗑️🦦 *تم إلغاء وإنهاء جولة العواصم بنجاح.*");
    }

    if (global.capitalsGame[m.chat]) {
        return m.reply(`⚠️🦦 في سؤال عواصم شغال حالياً في الشات!\n\n💡 جاوب عليه أو اكتب 👈🏻 *.${command} حذف* عشان تقفله.`);
    }

    // اختيار دولة عشوائية
    const item = capitalsData[Math.floor(Math.random() * capitalsData.length)];
    
    global.capitalsGame[m.chat] = {
        ...item,
        attempts: 0,
        hintCount: 0,
        time: setTimeout(() => {
            if (global.capitalsGame[m.chat]) {
                m.reply(`⏳ *انتهى الوقت ولم يعرف أحد الإجابة!*\n\n🏳️ العاصمة الصحيحة هي: *${global.capitalsGame[m.chat].capital}*`);
                delete global.capitalsGame[m.chat];
            }
        }, 60000) // وقت السؤال دقيقة كاملة
    };

    await conn.sendMessage(m.chat, { react: { text: "🌍", key: m.key } });

    return m.reply(`🌍 ⇦ *لـعـبـة الـعـواصـم الـعـالـمـيـة!* 🔍\n\nما هي عاصمة دولة: 📌 *[ ${item.country} ]* ؟\n\n────────────────\n⏳ _قدامكم دقيقة واحدة للإجابة السريعة!_\n💡 _لو عطلتوا خالص اكتبوا 👈🏻 *تلميح*_`);
};

// فحص الإجابات والـ التلميحات لايف جوه الشات
handler.before = async (m, { conn }) => {
    const game = global.capitalsGame?.[m.chat];
    if (!game || !m.text) return false;

    const userAnswer = m.text.trim().toLowerCase();
    const correctAnswer = game.capital.toLowerCase();

    // 💡 ميزة التلميح الذكي
    if (userAnswer === 'تلميح' || userAnswer === 'لمح') {
        if (game.hintCount >= 1) {
            return m.reply("❌ هو تلميح واحد بس يسطا عشان الحماس! ركز كدا وشغل مخك 😉🦦");
        }
        game.hintCount++;
        // إظهار الحرف الأول والأخير وإخفاء الباقي بنقاط
        const hinted = correctAnswer[0] + '..'.repeat(correctAnswer.length - 2) + correctAnswer[correctAnswer.length - 1];
        await conn.sendMessage(m.chat, { react: { text: "💡", key: m.key } });
        return m.reply(`💡 *تلميح على الماشي:* العاصمة تبدأ وتنتهي بـ ⇦ [ *${hinted}* ]`);
    }

    // ✅ فحص الإجابة الصحيحة
    if (userAnswer === correctAnswer) {
        clearTimeout(game.time);
        await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

        let rewardText = `🏆 *إجـابـة عـبـقـريـة وصـحـيـحـة!* 🎉\n\n👤 *البطل:* @${m.sender.split('@')[0]}\n🏳️ *عاصمة ${game.country} هي:* *${game.capital}*\n\n`;
        
        // زيادة الجوائز في الداتا بيز
        if (global.db?.users?.[m.sender]) {
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 150;
            global.db.users[m.sender].cookies = (global.db.users[m.sender].cookies || 0) + 3;
            rewardText += `🎁 الجوائز: *+150 XP* & *🍪 +3 كوكيز* ⚡`;
        } else {
            rewardText += `🎁 الجوائز: *+150 نقطة* 🔥`;
        }

        await conn.sendMessage(m.chat, { text: rewardText, mentions: [m.sender] }, { quoted: m });
        delete global.capitalsGame[m.chat];
        return true;
    } 
    
    // ❌ فحص الإجابة الغلط (لو قريبة يلمحله، ولو بعيدة يعمل ريأكت غلط عشان الحماس)
    if (correctAnswer.includes(userAnswer) && userAnswer.length > 1) {
        await conn.sendMessage(m.chat, { react: { text: "👀", key: m.key } });
        return m.reply("🦦 *قربت جداً! فاضل تكّة وتجيبها صح، حاول تاني!*");
    }

    return false;
};

handler.usage = ["عواصم"];
handler.category = "games";
handler.command = ["عواصم", "عاصمة", "capitals"];
handler.group = true;

export default handler;
