const MAX_ROUNDS = 10;

// دالة توليد المسائل الحسابية المبهجة والسهلة/المتوسطة بدون تعقيد
function generateMathQuestion() {
    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer, questionText;

    if (op === '+') {
        num1 = Math.floor(Math.random() * 50) + 5; // من 5 لـ 55
        num2 = Math.floor(Math.random() * 40) + 5;
        answer = num1 + num2;
        questionText = `${num1} + ${num2} = ؟`;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * 60) + 20;
        num2 = Math.floor(Math.random() * (num1 - 2)) + 2; // ضمان عدم خروج ناتج سالب
        answer = num1 - num2;
        questionText = `${num1} - ${num2} = ؟`;
    } else if (op === '*') {
        num1 = Math.floor(Math.random() * 10) + 2; // جدول ضرب خفيف وسريع
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = num1 * num2;
        questionText = `${num1} × ${num2} = ؟`;
    } else if (op === '/') {
        num2 = Math.floor(Math.random() * 8) + 2; // المقام
        answer = Math.floor(Math.random() * 10) + 2; // الناتج الصحيح
        num1 = num2 * answer; // البسط لضمان عدم وجود كسور نهائياً
        questionText = `${num1} ÷ ${num2} = ؟`;
    }

    return { question: questionText, answer: answer.toString() };
}

async function startMathRound(m, conn, round) {
    const chatId = m.chat;
    const g = global.mathGameCustom[chatId];
    if (!g) return;

    const math = generateMathQuestion();
    g.current = {
        answer: math.answer,
        round: round,
        timer: setTimeout(async () => {
            if (global.mathGameCustom?.[chatId]?.current?.round === round) {
                global.mathGameCustom[chatId].current = null;
                
                await conn.sendMessage(chatId, { 
                    text: `⏰ *انتهى الوقت ومحدش شغل مخه!* 🦦\nالمسألة طارت، والإجابة الصح كانت الشاطر يلقطها: ✨ *${math.answer}* ✨\n\n⏳ _استعدوا.. اللي بعده نازل حالا!_` 
                });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => startMathRound(m, conn, round + 1), 2500);
                } else {
                    endMathGame(m, conn);
                }
            }
        }, 30000)
    };

    const caption = `📐 *لعبة الرياضيات* ➗\n\nجولة رقم: [ *${round} من ${MAX_ROUNDS}* ] 🎲\n────────────────\n\n🤔 *شغل مخك وإديني ناتج العملية دي بسرعة:* \n\n🧠   *${math.question}* 🧠\n\n────────────────\n> 💡 _*اكتب الرقم الصحيح فوراً بالشات عشان تاخد النقطة!*_ \n⏱️ _معاك 30 ثانية قبل ما المسألة تقفل!_`;
    
    await conn.sendMessage(chatId, { text: caption });
}

async function endMathGame(m, conn) {
    const chatId = m.chat;
    const g = global.mathGameCustom[chatId];
    if (!g) return;
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة! ومفيش ولا أينشتاين شارك معانا انهارده.. كله ساط رياضة باين!* 🦦😂" });
        delete global.mathGameCustom[chatId];
        return;
    }

    const scoreboard = [];
    for (let i = 0; i < entries.length; i++) {
        const [id, score] = entries[i];
        let prizeEmoji = i === 0 ? "🏆" : (i === 1 ? "🥈" : "⭐");
        
        if (global.db?.users[id]) {
            global.db.users[id].xp = (global.db.users[id].xp || 0) + (i === 0 ? 450 : (i === 1 ? 250 : 100));
            global.db.users[id].cookies = (global.db.users[id].cookies || 0) + (i === 0 ? 9 : (i === 1 ? 5 : 2));
        }
        
        scoreboard.push(`${prizeEmoji} *المركز ${i + 1}:* @${id.split('@')[0]}\n   🎯 عمليات صح: *${score} جولات* \n────────────────`);
    }

    const winner = entries[0][0];

    await conn.sendMessage(chatId, {
        text: `🏁 *خلصت الـ ${MAX_ROUNDS} جولات وبان عباقرة الشات!* 📐🎉\n\  النتائج والترتيب النهائي اهو.. 👇\n\n────────────────\n${scoreboard.join('\n')}\n🏅 *تحية فخمة لأينشتين   @${winner.split('@')[0]} أينشتاين الجروب يعم!* 😉🔥`,
        mentions: entries.map(e => e[0])
    });
    
    delete global.mathGameCustom[chatId];
}

async function handler(m, { conn, text, command }) {
    if (!global.mathGameCustom) global.mathGameCustom = {};
    const chatId = m.chat;
    const cmd = (text || '').trim().toLowerCase();

    // ميزة الحذف الفوري والإغلاق (.رياضيات حذف)
    if (cmd === 'حذف' || cmd === 'انهاء' || cmd === 'delete') {
        if (!global.mathGameCustom[chatId]) return m.reply("❌ مفيش لعبة رياضيات شغالة حالياً عشان أحذفها يسطا!");
        if (global.mathGameCustom[chatId].current?.timer) clearTimeout(global.mathGameCustom[chatId].current.timer);
        delete global.mathGameCustom[chatId];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف تحدي الرياضيات.*");
    }

    if (global.mathGameCustom[chatId]) return m.reply(`⚠️ يسطا في تحدي حساب شغال في الشات!\nاكتب 👈🏻 *.${command} حذف* لو حابب تقفله.`);

    // ريأكت الحساب ➗
    await conn.sendMessage(chatId, { react: { text: "➗", key: m.key } });

    global.mathGameCustom[chatId] = { round: 0, scores: {}, current: null };
    
    await m.reply(`📐 *تحدي العداد بدأ يا وحوش!* 🧠\nالتحدي مكون من *10 جولات* سريعة.. جمع، طرح، ضرب، وقسمة! ورونا مين أسرع أينشتاين ف الشات! 🔥\n\nالمسألة الأولى... 🚀`);
    
    setTimeout(() => startMathRound(m, conn, 1), 2000);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.mathGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const userAnswer = m.text.trim();

    // حالة الإجابة الصحيحة بالملّي
    if (userAnswer === cur.answer) {
        clearTimeout(cur.timer);
        g.current = null;

        g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

        let captionText = `🎉 *حل عبقري طلقة وفي قمة السرعة!* ⚡\n\nكفو يا @${m.sender.split('@')[0]} حساباتك نزلت صحيحة 🏆\n⚔️ سكورك الحالي بقا: [ *${g.scores[m.sender]} نقطة* ] 🎯\n\n`;

        const nextRound = cur.round + 1;
        if (nextRound <= MAX_ROUNDS) {
            captionText += `⏳ *استعدوا.. المسألة الجاية للجولة رقم (${nextRound} / 10) نازلة حالا...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => startMathRound(m, conn, nextRound), 3000);
        } else {
            captionText += `🏁 *دي كانت الجولة الأخيرة! ثواني اجيب النتائج النهائية...*`;
            await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
            setTimeout(() => endMathGame(m, conn), 2000);
        }
        return true;
    } 
    
    // حالة الإجابة الخاطئة (لو كتب رقم غلط خالص ومش أمر بوت)
    else if (!isNaN(userAnswer) && !userAnswer.startsWith('.')) {
        await conn.sendMessage(m.chat, { react: { text: "🤔", key: m.key } });
        
        // مصفوفة إيفيهات عشوائية تطلع للعضو اللي بيجاوب غلط عشان الضحك والهزار 😂
        const roastMessages = [
            "❌ *لأ غلط!* أنت ساط رياضة ولا إيه يسطا؟ ركز تاني! 😂🔥",
            "❌ *إجابة بريئة من الحساب تماماً!* شكل علمي رياضة زعلان منك انهارده.. حاول تاني! 🤫",
            "❌ *مش دية خالص!* العداد عندك محتاج إعادة تشغيل، فكر كويس قبل ما تبعت الرقم! 🧠",
            "❌ *غلط يا فنان!* جدول الضرب بيعيط في الزاوية حالياً.. ركز وهاتها صح! 🎲"
        ];
        const randomRoast = roastMessages[Math.floor(Math.random() * roastMessages.length)];
        
        await m.reply(randomRoast);
        return true;
    }
    return false;
};

handler.usage = ["رياضيات"];
handler.category = "games";
handler.command = ['رياضيات', 'رياضة', 'رياضه'];
export default handler;
