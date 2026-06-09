/*
code: game math / mathematics (10 rounds edition)
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

const MAX_ROUNDS = 10;

function generateMathQuestion() {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    if (op === '+') {
        num1 = Math.floor(Math.random() * 80) + 10; // من 10 لـ 90
        num2 = Math.floor(Math.random() * 80) + 10;
        answer = num1 + num2;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * 90) + 20;
        num2 = Math.floor(Math.random() * (num1 - 5)) + 5; // نضمن مفيش سالب
        answer = num1 - num2;
    } else if (op === '*') {
        num1 = Math.floor(Math.random() * 12) + 2;  // جدول الضرب المتوسط
        num2 = Math.floor(Math.random() * 12) + 2;
        answer = num1 * num2;
    }

    const displayOp = op === '*' ? 'X' : op;
    return { question: `${num1} ${displayOp} ${num2} = ؟`, answer: answer.toString() };
}

async function startMathRound(m, conn, round) {
    const chatId = m.chat;
    const g = global.mathGameCustom[chatId];
    
    const math = generateMathQuestion();
    g.current = {
        answer: math.answer,
        round: round,
        timer: setTimeout(async () => {
            if (global.mathGameCustom?.[chatId]?.current?.round === round) {
                g.current = null;
                await conn.sendMessage(chatId, { text: `⏰ *انتهى الوقت!* لم يحل أحد المسألة الحسابية.\n🕵️ الإجابة الصحيحة كانت: *${math.answer}*\n\n⏳ _استعدوا للمسألة القادمة..._` });
                
                if (round < MAX_ROUNDS) {
                    setTimeout(() => startMathRound(m, conn, round + 1), 2000);
                } else {
                    endMathGame(m, conn);
                }
            }
        }, 30000)
    };

    await conn.sendMessage(chatId, {
        text: `📐 *تحدي العباقرة والرياضيات ➗ (جولة: ${round} / ${MAX_ROUNDS})*\n\nأسرع واحد يحل العملية الحسابية المتوسطة التالية:\n👇👇\n🧠  *${math.question}* 🧠\n\n> _معاك 30 ثانية لتشغيل عقلك الحسابي!_`
    });
}

async function endMathGame(m, conn) {
    const chatId = m.chat;
    const g = global.mathGameCustom[chatId];
    
    const entries = Object.entries(g.scores).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
        await conn.sendMessage(chatId, { text: "🏁 *انتهت اللعبة!* ولم يشارك أحد العباقرة في حل المسائل." });
        delete global.mathGameCustom[chatId];
        return;
    }

    const sorted = entries.map(([id, score], i) => `${i + 1}. @${id.split('@')[0]} ⌯︙ ${score} جولات صحيحة`).join('\n');
    const mentions = entries.map(([id]) => id);
    const winner = entries[0][0];

    if (global.db?.users[winner]) {
        global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 450;
        global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 9;
    }

    await conn.sendMessage(chatId, {
        text: `🏆 *لوحة شرف عباقرة الرياضيات الكبرى* ➗\n\n${sorted}\n\n🏅 الفائز الأول أينشتاين الجروب: @${winner.split('@')[0]}\nحصل على: *+450 XP* & *🍪 +9 كوكيز* 🎉`,
        mentions
    });
    delete global.mathGameCustom[chatId];
}

async function handler(m, { conn, text }) {
    if (!global.mathGameCustom) global.mathGameCustom = {};
    const chatId = m.chat;
    const cmd = (text || '').trim().toLowerCase();

    // ميزة حذف اللعبة وإنهاء الجولات فورا
    if (cmd === 'حذف' || cmd === 'delete') {
        if (!global.mathGameCustom[chatId]) return m.reply("❌ لا توجد لعبة رياضيات قائمة حالياً لإغلاقها!");
        if (global.mathGameCustom[chatId].current?.timer) clearTimeout(global.mathGameCustom[chatId].current.timer);
        delete global.mathGameCustom[chatId];
        return m.reply("🗑️ تم إغلاق وحذف لعبة الرياضيات بنجاح!");
    }

    if (global.mathGameCustom[chatId]) return m.reply("❌ هناك لعبة رياضيات قائمة بالفعل في هذا الجروب!\nاكتب *.رياضيات حذف* لقفلها.");

    global.mathGameCustom[chatId] = { round: 0, scores: {}, current: null };
    
    // ريأكت القسمة والتفعيل ➗
    await conn.sendMessage(m.chat, { react: { text: "➗", key: m.key } });
    startMathRound(m, conn, 1);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const g = global.mathGameCustom?.[chatId];
    if (!g?.current || !m.text) return false;

    const cur = g.current;
    const userAnswer = m.text.trim();

    if (userAnswer !== cur.answer) return false;

    clearTimeout(cur.timer);
    g.current = null;

    g.scores[m.sender] = (g.scores[m.sender] || 0) + 1;

    // ريأكت الاحتفال بالجولة 🎉 على رسالة الفائز
    await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });

    let captionText = `🎉 *حل عبقري وفي قمة السرعة!*\n\nأحسنت يا أسطورة @${m.sender.split('@')[0]} حساباتك صحيحة 🏆\n⚔️ نقاطك الحالية: *${g.scores[m.sender]} نقطة*\n\n`;

    if (cur.round < MAX_ROUNDS) {
        captionText += `⏳ *استعدوا.. المسألة القادمة (${cur.round + 1} / 10) في الطريق!*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => startMathRound(m, conn, cur.round + 1), 2500);
    } else {
        captionText += `🏁 *انتهت الـ 10 جولات الحسابية! تابعوا الإعلان النهائي...*`;
        await conn.sendMessage(chatId, { text: captionText, mentions: [m.sender] }, { quoted: m });
        setTimeout(() => endMathGame(m, conn), 1500);
    }
    return true;
};

handler.usage = ["رياضيات"];
handler.category = "games";
handler.command = ['رياضيات', 'رياضة', 'رياضه'];
export default handler;
      
