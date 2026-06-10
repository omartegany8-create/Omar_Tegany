/*
code: game gamad complete custom
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const CATEGORIES = [
    { 
        type: "ولد", 
        emoji: "🙋🏻", 
        data: [
            "محمد", "محمود", "مصطفى", "مروان", "ميرو", "مازن", "موسى", "مهند", 
            "مالك", "مؤمن", "مدحت", "مجدي", "منير", "مسعود", "مدحت", "مصطفي",
            "مؤيد", "معتز", "ماجد", "منصور", "مأمون", "مختار", "ممدوح", "مبشر",
            "مراد", "مظهر", "مسعد", "مشاري", "متولي", "منسي", "مصلح", "مساعد",
            "محي", "محسن", "ميشيل", "ماريو", "مايكل", "مؤنس", "مبارك", "مكرم"
        ] 
    },
    { 
        type: "بنت", 
        emoji: "🙋🏻‍♀️", 
        data: [
            "مريم", "منى", "مها", "مي", "منار", "ملك", "منة", "منه", "ميرنا", 
            "ميادة", "مياده", "ميساء", "مروة", "مروه", "مديحة", "مديحه", "ميس",
            "ميرال", "ميلا", "ميرا", "ميرفت", "مايا", "ميريت", "منال", "ميادة",
            "مونا", "ميسون", "مهيرة", "مهيره", "منيرة", "منيره", "ميريهان", "مآثر",
            "مليكة", "مليكه", "ملاك", "مرام", "ميسرة", "مروى", "مادلين", "ميسان"
        ] 
    },
    { 
        type: "جماد", 
        emoji: "🪨", 
        data: [
            "مكتب", "مسطرة", "مسطره", "مفتاح", "مقص", "مصحف", "مروحة", "مروحه", 
            "ملعقة", "معلقة", "مرآة", "مرايه", "منزل", "مسجد", "موبايل", "محمول",
            "مطبخ", "مقلمة", "مقلمه", "مخدة", "مخده", "مرتبة", "مرتبه", "مفرش",
            "مسمار", "مطرقة", "مطرقه", "مفك", "ميزان", "متر", "مكيف", "مذياع",
            "مبنى", "متحف", "مستشفى", "مستشفي", "ملعب", "متجر", "ممر", "محفظة", "محفظه"
        ] 
    },
    { 
        type: "نبات", 
        emoji: "☘️", 
        data: [
            "موز", "مانجو", "مانجا", "منجا", "مشمش", "ملوخية", "ملوخيه", "مرمية", 
            "ميرمية", "مشروم", "مرجان", "مرامية", "ميراميه", "مريمية", "مريميه",
            "مندرين", "مستكة", "مستكه", "مرّار", "محلب", "ملفوف", "مكاوي", "مقدونس",
            "بقدونس", "مريمية", "ماندارين", "مورينجا", "مورينغا", "مشرومعش الغراب"
        ] 
    },
    { 
        type: "حيوان", 
        emoji: "🐦", 
        data: [
            "ماعز", "معزة", "معزه", "ماموث", "مهر", "مرجان", "مينا", "مدرع",
            "ميجالودون", "مينك", "مرموط", "مكاك", "مها", "المها", "موس", "الموس",
            "مالك الحزين", "محار", "منك", "موظ", "الموظ", "ميجالودون", "ميدوزا"
        ] 
    },
    { 
        type: "بلاد", 
        emoji: "🎌", 
        data: [
            "مصر", "مغرب", "المغرب", "ماليزيا", "موريتانيا", "مالي", "مدغشقر", 
            "مقدونيا", "مكسيك", "المكسيك", "موناكو", "موريتاني", "ملاوي", "ملديف",
            "المالديف", "منغوليا", "موزمبيق", "ميكرونيزيا", "مارتينيك", "ماكاو",
            "مدريد", "مكة", "مكه", "مسقط", "المنامة", "المنامه", "موسكو", "ميامي"
        ] 
    }
];


async function askGamadQuestion(m, conn, step) {
    const chatId = m.chat;
    const g = global.gamadGameCustom[chatId];
    const cat = CATEGORIES[step];

    g.current = {
        step: step,
        type: cat.type,
        emoji: cat.emoji,
        validAnswers: cat.data,
        timer: setTimeout(async () => {
            if (global.gamadGameCustom?.[chatId]?.current?.step === step) {
                g.current = null;
                g.results.push({ type: cat.type, status: "❌ انتهى الوقت" });
                await m.reply(`⏰ *انتهى وقت جولة (${cat.type})!* لم يتم الإجابة.`);
                
                if (step < CATEGORIES.length - 1) {
                    setTimeout(() => askGamadQuestion(m, conn, step + 1), 2000);
                } else {
                    finishGamadGame(m, conn);
                }
            }
        }, 30000)
    };

    await conn.sendMessage(chatId, {
        text: `🚌 *لعبة جماد وبحر الحروف* ✨\n\n👈 المطلوب الآن: اكتب اسم (*${cat.type}*) يبدأ بحرف [ *م* ]\n\n⏱️ _معاك 30 ثانية للتفكير والكتابة السليمة!_`
    });
}

async function finishGamadGame(m, conn) {
    const chatId = m.chat;
    const g = global.gamadGameCustom[chatId];

    let summary = g.results.map(r => `${r.status === '✅' ? '✅' : '❌'} *${r.type}* ⌯︙ ${r.status}`).join('\n');
    let correctCount = g.results.filter(r => r.status === '✅').length;

    if (global.db?.users[g.player]) {
        global.db.users[g.player].xp = (global.db.users[g.player].xp || 0) + (correctCount * 50);
    }

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت رحلة لعبة جماد بالكامل!* 🚌\n\nإليك كشف أداء الذكاء السريع الخاص بك:\n\n${summary}\n\n🏆 المجموع النهائي للإجابات الصحيحة: *${correctCount} من 6*\n🏅 الجوائز المكتسبة: *+${correctCount * 50} XP*\n\n> 💡 *اذا تريد اللعب اكتب .حجر*`,
        mentions: [g.player]
    });

    delete global.gamadGameCustom[chatId];
}

async function handler(m, { conn }) {
    if (!global.gamadGameCustom) global.gamadGameCustom = {};
    const chatId = m.chat;

    if (global.gamadGameCustom[chatId]) return m.reply("❌ هناك جولة لعبة جماد قائمة بالفعل في هذا الشات!");

    global.gamadGameCustom[chatId] = {
        player: m.sender,
        results: [],
        current: null
    };

    // ريأكت التفعيل بالخشب 🪵
    await conn.sendMessage(m.chat, { react: { text: "🪵", key: m.key } });
    askGamadQuestion(m, conn, 0);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gamadGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    // اللعبة محجوزة للعضو المبادر
    if (m.sender !== g.player) return false;

    const cur = g.current;
    const userAnswer = m.text.trim().toLowerCase();

    clearTimeout(cur.timer);
    g.current = null;

    // التحقق من صحة الإجابة بحرف الميم
    if (cur.validAnswers.includes(userAnswer)) {
        // إجابة صحيحة
        await conn.sendMessage(m.chat, { react: { text: cur.emoji, key: m.key } });
        g.results.push({ type: cur.type, status: "✅" });
        await m.reply(`🎉 *إجابة صحيحة وممتازة!* تم تسجيل نقطة لفئة الـ ${cur.type}.`);
    } else {
        // إجابة خاطئة
        await conn.sendMessage(m.chat, { react: { text: "🙄", key: m.key } });
        g.results.push({ type: cur.type, status: "❌ خاطئة" });
        await m.reply(`ده ${cur.type} اولو حرف ال م بالله عليك ؟ 🙂`);
    }

    // الانتقال للجولة التالية
    if (cur.step < CATEGORIES.length - 1) {
        setTimeout(() => askGamadQuestion(m, conn, cur.step + 1), 2000);
    } else {
        setTimeout(() => finishGamadGame(m, conn), 1500);
    }

    return true;
};

handler.usage = ["جماد"];
handler.category = "games";
handler.command = ['جماد'];
export default handler;
