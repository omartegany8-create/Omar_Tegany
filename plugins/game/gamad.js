/*
code: game gamad complete custom (Multi-Player & Reply-Only Edition)
by: 𝐓𝐨جي & Gemini
*/

const GAMAD_DATABASE = {
    "أ": {
        "ولد": ["أحمد", "أمجد", "أكرم", "أنور", "أسامة", "أشرف", "أنس", "أدهم", "أمين", "أمير", "إياد", "إسلام", "إبراهيم", "أسر"],
        "بنت": ["أمل", "أميرة", "أسماء", "آية", "أروى", "أريج", "أفنان", "إيمان", "إسراء", "أحلام", "آلاء", "أنيسة", "أيتن", "أصالة"],
        "جماد": ["أريكة", "إبرة", "أبريق", "أستك", "أنبوبة", "ألبوم", "أبجورة", "أرض", "ألوان", "أقلام", "إناء", "أسمنت"],
        "نبات": ["أرز", "أناناس", "أفوكادو", "أقحوان", "أراك", "ألوفيرا", "أرزة", "أثل"],
        "حيوان": ["أسد", "أرنب", "أفعى", "أخطبوط", "أوزة", "إغوانا", "أنف العجل", "أبو قردان"],
        "بلاد": ["ألمانيا", "أمريكا", "أرجنتين", "أستراليا", "أفغانستان", "أنجولا", "أوزبكستان", "أيرلندا", "أثينا", "أسوان"]
    },
    "ب": {
        "ولد": ["باسم", "باهر", "بدر", "بشار", "بلال", "بهاء", "بسام", "بخيت", "بكر", "بندري", "بيبرس", "بطرس", "بنيامين"],
        "بنت": ["بسمة", "بسنت", "بثينة", "بدرية", "بشرى", "بلقيس", "بارين", "بنان", "بهيرة", "بيري", "بتول", "براعم", "بيلسان"],
        "جماد": ["باب", "برميل", "بلاط", "برواز", "بانيو", "بلكونة", "بيجامة", "بطارية", "بوق", "باخرة", "بساط", "بندقية"],
        "نبات": ["بطيخ", "برتقال", "باذنجان", "بامية", "بسلة", "بقدونس", "بصل", "بن", "بلوط", "بنجر", "بابونج", "برسيم"],
        "حيوان": ["بقرة", "بغالة", "بومة", "ببغاء", "بطة", "بطريق", "برغوث", "ببر", "باز", "بونوبو", "برص"],
        "بلاد": ["برازيل", "بلجيكا", "بحرين", "باكستان", "بلغاريا", "بولندا", "بيرو", "بوليفيا", "بغداد", "بيروت", "بنغازي"]
    },
    "ت": {
        "ولد": ["تامر", "توفيق", "تحسين", "تيمور", "تيم", "تقي", "تاج", "تليد", "تميم", "تركي", "تيسير"],
        "بنت": ["تهاني", "تغريد", "تقى", "تسنيم", "تارا", "تالا", "تولين", "تيماء", "تمارا", "تالين", "تحية", "توبة"],
        "جماد": ["تلفزيون", "تابلت", "تمثال", "تاج", "ترابيزة", "تلفون", "تنورة", "تابوت", "تكييف", "ترمومتر"],
        "نبات": ["تفاح", "تمر", "تين", "ترمس", "توت", "تبغ", "تمارند", "تيوليب"],
        "حيوان": ["تمساح", "تيس", "تنين", "تايجر", "توواتارا"],
        "بلاد": ["تونس", "تركيا", "تايلاند", "تايوان", "تنزانيا", "تشاد", "تشيك", "تبوك", "تطوان"]
    },
    "ج": {
        "ولد": ["جابر", "جاسم", "جلال", "جمال", "جمعة", "جهاد", "جواد", "جود", "جرير", "جعفر", "جبر", "جسار", "جورج"],
        "بنت": ["جيهان", "جميلة", "جود", "جوري", "جنا", "جنات", "جوهرة", "جلنار", "جيسيكا", "جومانا", "جاكلين", "جوزفين"],
        "جماد": ["جدول", "جدار", "جرس", "جورب", "جلد", "جسر", "جرار", "جواهر", "جنيه", "جلباب", "جهاز"],
        "نبات": ["جزر", "جوافة", "جوافه", "جنزبيل", "جرجير", "جوز", "جوز الهند", "جلجلان", "جيرانيوم"],
        "حيوان": ["جمل", "جندب", "جدي", "جاموس", "جرو", "جعول", "جاغوار", "جربوع"],
        "بلاد": ["جزائر", "الجزائر", "جورجيا", "جيبوتي", "جاميكا", "جنوب إفريقيا", "جدة", "جنيف", "جاكرتا"]
    },
    "ر": {
        "ولد": ["رامي", "رامز", "رائد", "رأفت", "رجب", "رضا", "رمضان", "رفعت", "راشد", "ربيع", "راني", "راغب", "روبرت"],
        "بنت": ["رانيا", "روان", "رحمة", "رحمه", "رشا", "رضوى", "ريهام", "رنا", "رهف", "رنيم", "روجينا", "رؤى", "رباب", "ريماس"],
        "جماد": ["رصيف", "رادار", "رمل", "راديو", "رف", "رصاص", "روبة", "ريشة", "روب", "رأس", "رماد"],
        "نبات": ["رمان", "ريحان", "رند", "راوند", "رشاد", "روز ماري", "رطب"],
        "حيوان": ["راكون", "رنة", "ريم", "رشا", "رباح", "روبين"],
        "بلاد": ["روسيا", "رومانيا", "رواندا", "رياض", "الرياض", "روما", "رباط", "الرباط", "رام الله"]
    },
    "س": {
        "ولد": ["سامح", "سامر", "سعيد", "سليم", "سمير", "سليمان", "سلطان", "سامي", "سراج", "ساهر", "ساديو", "سوكونا", "ساسكي"],
        "بنت": ["سارة", "ساره", "سمر", "سلوى", "سهام", "سها", "سوزان", "سحر", "سهيلة", "سهيله", "سلمى", "سيلا", "ساندي", "سيرين"],
        "جماد": ["سرير", "سيارة", "سياره", "ساعة", "ساعه", "سجادة", "سجاده", "سكين", "سقف", "سلسلة", "سفينة", "سهم", "سبورة"],
        "نبات": ["سبانخ", "سمسم", "سدر", "سفرجل", "سحلب", "سنابل", "سلق"],
        "حيوان": ["سنجاب", "سمكة", "سمكه", "سلحفاة", "سلحفاه", "سحلية", "سحليه", "سيد قشطة", "سرطان البحر", "سمان"],
        "بلاد": ["سعودية", "السعودية", "سوريا", "سودان", "السودان", "سويد", "السويد", "سويسرا", "سنغال", "السنغال", "سنغافورة"]
    },
    "م": {
        "ولد": ["محمد", "محمود", "مصطفى", "مروان", "ميرو", "مازن", "موسى", "مهند", "مالك", "مؤمن", "مدحت", "مجدي", "منير", "مراد"],
        "بنت": ["مريم", "منى", "مها", "مي", "منار", "ملك", "منة", "منه", "ميرنا", "ميادة", "مياده", "ميساء", "مروة", "مرام", "مليكة"],
        "جماد": ["مكتب", "مسطرة", "مسطره", "مفتاح", "مقص", "مصحف", "مروحة", "مروحه", "ملعقة", "معلقة", "مرآة", "منزل", "موبايل"],
        "نبات": ["موز", "مانجو", "مانجا", "منجا", "مشمش", "ملوخية", "ملوخيه", "مرمية", "ميرمية", "مشروم", "ملفوف", "مقدونس"],
        "حيوان": ["ماعز", "معزة", "معزه", "ماموث", "مهر", "مرجان", "مينا", "مدرع", "مكاك", "مها", "المها"],
        "بلاد": ["مصر", "مغرب", "المغرب", "ماليزيا", "موريتانيا", "مالي", "مدغشقر", "مقدونيا", "مكسيك", "موناكو", "ملديف", "مكة"]
    }
};

const CATEGORY_TYPES = ["ولد", "بنت", "جماد", "نبات", "حيوان", "بلاد"];
const CATEGORY_EMOJIS = { "ولد": "🙋🏻", "بنت": "🙋🏻‍♀️", "جماد": "🪨", "نبات": "☘️", "حيوان": "🐦", "بلاد": "🎌" };

async function askGamadQuestion(m, conn, step) {
    const chatId = m.chat;
    const g = global.gamadGameCustom[chatId];
    if (!g) return;
    
    const letter = g.letter;
    const currentType = CATEGORY_TYPES[step];
    const currentEmoji = CATEGORY_EMOJIS[currentType];
    const validAnswers = GAMAD_DATABASE[letter][currentType];

    g.current = {
        step: step,
        type: currentType,
        emoji: currentEmoji,
        validAnswers: validAnswers,
        questionId: null,
        timer: setTimeout(async () => {
            if (global.gamadGameCustom?.[chatId]?.current?.step === step) {
                g.current = null;
                g.results.push({ type: currentType, status: "❌ انتهى الوقت", winner: null });
                await conn.sendMessage(chatId, { text: `⏰ *انتهى وقت جولة (${currentType}) يا كساير!* محدش لحق يجاوب الفئة دي.. 🦦` });
                
                if (step < CATEGORY_TYPES.length - 1) {
                    setTimeout(() => askGamadQuestion(m, conn, step + 1), 2000);
                } else {
                    finishGamadGame(m, conn);
                }
            }
        }, 30000)
    };

    const sent = await conn.sendMessage(chatId, {
        text: `🚌 *لعبة ولد ، بنت ، جماد ، نبات ، حيوان ، بلاد 👻💫*\n\n👈 المطلوب الآن: اكتب اسم (*${currentType}*) يبدأ بحرف [ *${letter}* ]\n\n⚠️ *ملاحظة مهمة:* لازم تعمل (رد / Reply) على الرسالة دي بالإجابة وإلا مش هتتحسب! 😎🔥\n⏱️ _معاكم 30 ثانية للتفكير السريع!_`
    });
    g.current.questionId = sent.key.id;
}

async function finishGamadGame(m, conn) {
    const chatId = m.chat;
    const g = global.gamadGameCustom[chatId];
    if (!g) return;

    let summary = g.results.map(r => {
        let winText = r.winner ? `@${r.winner.split('@')[0]}` : "لا أحد";
        return `${r.status === '✅' ? '✅' : '❌'} *${r.type}* ⌯︙ ${r.status} (${winText})`;
    }).join('\n');

    // فرز الفائزين بالترتيب حسب تكرار الفوز لحسبة نهائية فخمة
    let scoreBoard = {};
    g.results.forEach(r => {
        if (r.winner) scoreBoard[r.winner] = (scoreBoard[r.winner] || 0) + 1;
    });

    let sortedEntries = Object.entries(scoreBoard).sort((a, b) => b[1] - a[1]);
    let leaderboard = sortedEntries.map(([user, score], idx) => {
        if (global.db?.users[user]) {
            global.db.users[user].xp = (global.db.users[user].xp || 0) + (score * 70);
        }
        return `${idx + 1}. @${user.split('@')[0]} ⌯︙ *${score} نقاط* (+${score * 70} XP)`;
    }).join('\n') || "😔 لا يوجد رابحون في هذه الجولة الكسولة!";

    await conn.sendMessage(chatId, {
        text: `🏁 *انتهت لعبة جماد الأسطورية بالكامل لحرف [ ${g.letter} ]!* 👻\n\n📊 *كشف الأداء العام للجولات:*\n${summary}\n\n🏆 *لوحة شرف الأبطال الأسرع:*\n${leaderboard}\n\n> 💡 *إذا تريد اللعب اكتب .جماد 🤍*`,
        mentions: [...new Set(g.results.map(r => r.winner).filter(Boolean)), ...sortedEntries.map(e => e[0])]
    });

    delete global.gamadGameCustom[chatId];
}

async function handler(m, { conn, text }) {
    if (!global.gamadGameCustom) global.gamadGameCustom = {};
    const chatId = m.chat;

    // ميزة الحذف
    if (text === 'حذف' || text === 'انهاء') {
        if (!global.gamadGameCustom[chatId]) return m.reply("❌ مفيش لعبة جماد شغالة حالياً عشان أحذفها!");
        if (global.gamadGameCustom[chatId].current?.timer) clearTimeout(global.gamadGameCustom[chatId].current.timer);
        delete global.gamadGameCustom[chatId];
        return m.reply("🗑️ *تم إنهاء وإغلاق لعبة جماد بنجاح بواسطة الكينج!*");
    }

    if (global.gamadGameCustom[chatId]) return m.reply("❌ هناك لعبة جماد قائمة بالفعل في هذا الشات!");

    const availableLetters = Object.keys(GAMAD_DATABASE);
    const chosenLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];

    global.gamadGameCustom[chatId] = {
        player: m.sender,
        letter: chosenLetter,
        results: [],
        current: null
    };

    await conn.sendMessage(m.chat, { react: { text: "🪵", key: m.key } });
    await m.reply(`🎮 *تم بدء لعبة جماد الجماعية...!*\nالحرف المختار عشوائياً هو: [ *${chosenLetter}* ] 🎲\n\nاستعدوا الشات مفتوح للجميع والسرعة هي الحكم! 🔥🚀`);
    
    setTimeout(() => askGamadQuestion(m, conn, 0), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.gamadGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    
    // الشرط الجوهري: لازم العضو يعمل رد (Reply) على رسالة سؤال البوت بالملي
    if (!m.quoted || m.quoted.id !== cur.questionId) return false;

    const userAnswer = m.text.trim().toLowerCase();

    // التحقق من صحة الإجابة
    const isCorrect = cur.validAnswers.some(ans => ans.toLowerCase() === userAnswer);

    if (isCorrect) {
        clearTimeout(cur.timer);
        g.current = null;
        
        await conn.sendMessage(m.chat, { react: { text: cur.emoji, key: m.key } });
        g.results.push({ type: cur.type, status: "✅", winner: m.sender });
        
        await m.reply(`🎉 *إجابة صحيحة خارقة طلقة!* أحسنت يا @${m.sender.split('@')[0]} جبت اسم الـ ${cur.type} صح بالملّي! 🏆`, null, { mentions: [m.sender] });

        if (cur.step < CATEGORY_TYPES.length - 1) {
            setTimeout(() => askGamadQuestion(m, conn, cur.step + 1), 2500);
        } else {
            setTimeout(() => finishGamadGame(m, conn), 1500);
        }
    } else {
        // إجابة خاطئة بالرد
        await conn.sendMessage(m.chat, { react: { text: "🙄", key: m.key } });
        await m.reply(`ده ${cur.type} أوله حرف الـ [ ${g.letter} ] بالله عليك ؟ 🙂 ركز شوية يا @${m.sender.split('@')[0]}!!`, null, { mentions: [m.sender] });
    }

    return true;
};

handler.usage = ["جماد"];
handler.category = "games";
handler.command = ['جماد'];
export default handler;
