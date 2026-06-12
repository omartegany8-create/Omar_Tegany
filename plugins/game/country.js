/*
code: premium flags guessing game (بدون زخارف - نظام تفاعل بشري ذكي)
by: 𝐓𝐨جي & Gemini
*/

const MAX_ROUNDS = 10;

const flagsData = [
    { name: "مصر", img: "https://flagcdn.com/w640/eg.png" },
    { name: "السعودية", img: "https://flagcdn.com/w640/sa.png" },
    { name: "فلسطين", img: "https://flagcdn.com/w640/ps.png" },
    { name: "اليابان", img: "https://flagcdn.com/w640/jp.png" },
    { name: "البرازيل", img: "https://flagcdn.com/w640/br.png" },
    { name: "الارجنتين", img: "https://flagcdn.com/w640/ar.png" },
    { name: "المغرب", img: "https://flagcdn.com/w640/ma.png" },
    { name: "الجزائر", img: "https://flagcdn.com/w640/dz.png" },
    { name: "تونس", img: "https://flagcdn.com/w640/tn.png" },
    { name: "فرنسا", img: "https://flagcdn.com/w640/fr.png" },
    { name: "المانيا", img: "https://flagcdn.com/w640/de.png" },
    { name: "اسبانيا", img: "https://flagcdn.com/w640/es.png" },
    { name: "ايطاليا", img: "https://flagcdn.com/w640/it.png" },
    { name: "انجلترا", img: "https://flagcdn.com/w640/gb.png" },
    { name: "امريكا", img: "https://flagcdn.com/w640/us.png" },
    { name: "كوريا الجنوبية", img: "https://flagcdn.com/w640/kr.png" },
    { name: "العراق", img: "https://flagcdn.com/w640/iq.png" },
    { name: "الامارات", img: "https://flagcdn.com/w640/ae.png" },
    { name: "قطر", img: "https://flagcdn.com/w640/qa.png" },
    { name: "البرتغال", img: "https://flagcdn.com/w640/pt.png" },
    { name: "الكويت", img: "https://flagcdn.com/w640/kw.png" },
    { name: "البحرين", img: "https://flagcdn.com/w640/bh.png" },
    { name: "عمان", img: "https://flagcdn.com/w640/om.png" },
    { name: "الاردن", img: "https://flagcdn.com/w640/jo.png" },
    { name: "سوريا", img: "https://flagcdn.com/w640/sy.png" },
    { name: "لبنان", img: "https://flagcdn.com/w640/lb.png" },
    { name: "اليمن", img: "https://flagcdn.com/w640/ye.png" },
    { name: "السودان", img: "https://flagcdn.com/w640/sd.png" },
    { name: "ليبيا", img: "https://flagcdn.com/w640/ly.png" },
    { name: "روسيا", img: "https://flagcdn.com/w640/ru.png" },
    { name: "الصين", img: "https://flagcdn.com/w640/cn.png" },
    { name: "كندا", img: "https://flagcdn.com/w640/ca.png" },
    { name: "المكسيك", img: "https://flagcdn.com/w640/mx.png" },
    { name: "هولندا", img: "https://flagcdn.com/w640/nl.png" },
    { name: "بلجيكا", img: "https://flagcdn.com/w640/be.png" },
    { name: "سويسرا", img: "https://flagcdn.com/w640/ch.png" },
    { name: "كرواتيا", img: "https://flagcdn.com/w640/hr.png" },
    { name: "تركيا", img: "https://flagcdn.com/w640/tr.png" },
    { name: "الهند", img: "https://flagcdn.com/w640/in.png" },
    { name: "استراليا", img: "https://flagcdn.com/w640/au.png" },
    { name: "نيجيريا", img: "https://flagcdn.com/w640/ng.png" },
    { name: "السنغال", img: "https://flagcdn.com/w640/sn.png" },
    { name: "غانا", img: "https://flagcdn.com/w640/gh.png" },
    { name: "الكاميرون", img: "https://flagcdn.com/w640/cm.png" },
    { name: "جنوب افريقيا", img: "https://flagcdn.com/w640/za.png" }
];

const getFlagPrize = (rank) => {
    if (rank === 0) return { xp: 400, cookies: 8, emoji: "🏆" };
    if (rank === 1) return { xp: 250, cookies: 5, emoji: "🥈" };
    return { xp: 90, cookies: 2, emoji: "⭐" };
};

// تجميع كل الأسماء المتاحة للأعلام لفحص الإجابات الخاطئة
const allFlagNames = flagsData.map(f => f.name.trim().toLowerCase());

async function runFlagGame(m, conn, round) {
    const chatId = m.chat;
    const g = global.gameFlagCustom[chatId];
    if (!g) return;

    const country = flagsData[Math.floor(Math.random() * flagsData.length)];

    g.current = {
        answer: country.name.trim().toLowerCase(),
        round: round,
        image: country.img,
        id: null,
        timer: setTimeout(async () => {
            if (global.gameFlagCustom?.[chatId]?.current?.round === round) {
                const correctAns = global.gameFlagCustom[chatId].current.answer;
                global.gameFlagCustom[chatId].current = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى الوقت ومحدش جابها!* \n\nالعلم ده كان: *${correctAns}* 🌍\n\nنجهز الجولة اللي بعدها حالا صحصحوا..` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => runFlagGame(m, conn, round + 1), 2500);
                } else {
                    endFlagGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `📌 *تحدي العواصم وأعلام الدول الثقافي* 🌍\n\n*البيانات الحالية للجولة:*\n• الجولة الحالية: [ *${round} من ${MAX_ROUNDS}* ]\n• الوقت المتاح: [ *30 ثانية* ]\n\n👀 *اكتب اسم الدولة الصحيحة صاحب العلم ده فوراً في الشات!*`;
    
    const msg = await conn.sendMessage(chatId, { image: { url: country.img }, caption: caption });
    if (g.current) g.current.id = msg.key.id;
}

async function endFlagGame(m, conn) {
    const chatId = m.chat;
    const g = global.gameFlagCustom[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: `🏁 *انتهت الـ ${MAX_ROUNDS} جولات كاملة!*\n\ للأسف مفيش ولا واحد جمع نقطة.. الجروب كله أبيض في الخرايط! 🦦` });
        delete global.gameFlagCustom[chatId];
        return;
    }

    const prizesList = [];
    const mentions = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        const prize = getFlagPrize(i);
        mentions.push(id);

        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + prize.xp;
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + prize.cookies;
        }
        prizesList.push(`${prize.emoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n• الأعلام الصحيحة: [ *${score} دول* ]\n• المكافأة المضافة: [ *+${prize.xp} XP* | *🍪 +${prize.cookies} كوكيز* ]`);
    }

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *لوحة النتائج - نهاية تحدي الأعلام* 🏆\n\n${prizesList.join('\n\n')}\n\n🏅 *عاش عليكم! مبروك الصدارة يا @${winner.split('@')[0]} لفيت العالم في ثواني!* 😉🔥`,
        mentions
    });
    
    delete global.gameFlagCustom[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.gameFlagCustom) global.gameFlagCustom = {};
    const chatId = m.chat;
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];

    // ميزة الحذف الفوري والآمن
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.gameFlagCustom[chatId]) return m.reply("❌ مفيش جولة أعلام شغالة حالياً عشان أحذفها!");
        if (global.gameFlagCustom[chatId].current?.timer) clearTimeout(global.gameFlagCustom[chatId].current.timer);
        delete global.gameFlagCustom[chatId];
        return m.reply("🗑️ *تم إنهاء وإغلاق تحدي الأعلام.*");
    }

    if (global.gameFlagCustom[chatId]) return m.reply(`⚠️ في تحدي أعلام شغال حالياً في الجروب!\n\nاكتب *.${command} حذف* لو حابب تقفله وتبدأ جولة جديدة.`);

    await conn.sendMessage(chatId, { react: { text: "🗺️", key: m.key } });

    global.gameFlagCustom[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`🌍 *تحدي الاعلام بدأ 🚩🎌!*\n\nالتحدي مكون من *10 جولات* سريعة.. ركزوا في العلم واكتبوا اسم الدولة بسرعة عشان تاخدو الصدارة والجوائز..\n\nالجولة الأولى ... 🚀🔥`);
    
    setTimeout(() => runFlagGame(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gameFlagCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const answer = m.text.trim().toLowerCase();

    // 1. فحص لو العضو جاوب صح
    if (answer === cur.answer) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(chatId, { react: { text: "⚡", key: m.key } });

        let captionText = `🎉 *ماشاءالله سريع وجبتها في ثانية!* \n\nعاش يا @${m.sender.split('@')[0]} العلم فعلاً لـ (*${m.text.trim()}*) 🏆\n🎯 مجموع نقاطك حالياً: [ *${g.scores[m.sender]} نقطة* ]\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. الجولة رقم (${nextRound} / 10) نازلة حالا في الشات...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => runFlagGame(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة في التحدي العالمي! ثواني والترتيب النهائي نازل...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endFlagGame(m, conn), 2000);
        }
        return true;
    } 
    
    // 2. فحص لو كتب اسم دولة تانية غلط (يتفاعل فقط لو الكلمة مسجلة في أسماء الدول لمنع التداخل مع السوالف)
    else if (allFlagNames.includes(answer) && !answer.startsWith('.')) {
        await conn.sendMessage(chatId, { react: { text: "🤧", key: m.key } });
        
        const flagRoasts = [
            "❌ *لأ غلط!* أنت ساط جغرافيا باين؟ العلم ده في قارة تانية خالص يسطا! 😂🗺️",
            "❌ *مش هو خالص!* روح ذاكر خرايط وتعال بسرعة عشان الجولة هتطير! 🧐",
            "❌ *إجابة بريئة من الأطلس!* ركز في الألوان والرموز يا فنان وحاول تاني!"
        ];
        const randomRoast = flagRoasts[Math.floor(Math.random() * flagRoasts.length)];
        await m.reply(randomRoast);
        return true;
    }
    return false;
};

handler.usage = ["علم"];
handler.category = "games";
handler.command = ['علم', 'اعلام', 'العلم', 'country'];
export default handler;
