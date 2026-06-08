handler.before = async (m, { conn }) => {
    if (!m.text || !global.break?.games[m.chat] || !global.break?.scores[m.chat]) return;

    const game = global.break.games[m.chat];
    const player = m.sender;
    
    // التحقق إن الإجابة مطابقة للكلمة المطلوبة بالملّي
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.break.games[m.chat];

    if (!global.break.scores[m.chat][player]) global.break.scores[m.chat][player] = 0;
    global.break.scores[m.chat][player]++;
    
    let total = 0;
    for (let id in global.break.scores[m.chat]) {
        total += global.break.scores[m.chat][id];
    }
    
    // تنتهي اللعبة عند تجميع 20 نقطة في الجروب
    if (total >= 20) {
        const entries = Object.entries(global.break.scores[m.chat])
            .sort((a, b) => b[1] - a[1]);
        
        const sorted = entries.map(([id, score], i) => 
            `${i+1}. @${id.split('@')[0]} - ${score} نقطة`
        );
        
        const mentions = entries.map(([id]) => id);
        
        const winner = entries[0][0];
        if (global.db?.users[winner]) {
            global.db.users[winner].xp = (global.db.users[winner].xp || 0) + 500;
            global.db.users[winner].cookies = (global.db.users[winner].cookies || 0) + 10;
        }
        
        await conn.sendMessage(m.chat, { 
            text: `🏆 *الفائزون في لـعـبـة الـكـتـابـة*\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.break.scores[m.chat];
        return;
    }

    await m.reply(`✅ احسنت معاك: ${global.break.scores[m.chat][player]} نقطه`);
    handler(m, { conn });
};

async function handler(m, { conn }) {
    if (!global.break) global.break = { games: {}, scores: {} };

    if (global.break.games[m.chat]) {
        clearTimeout(global.break.games[m.chat].timeout);
        delete global.break.games[m.chat];
    }

    // مصفوفة الكلمات العادية (تقدر تزود وتغير الكلمات دي براحتك يا عمر في أي وقت)
    const wordsList = [
        "سكونا", "غوجو", "لوفي", "ميرو", "ناروتو", "إيتاتشي", "أيزن", "شيبويا", 
        "ل", "لاو", "توجي", "كارولين", "فريزا", "غوكو" ,"يوجي", "ميغومي", "نوبارا", "جوجتسو", "كاكاشي", "زورو", "كوروساكي"
    ];
    
    // اختيار كلمة عشوائية من القائمة
    const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞✍️⟝─┈─┈─┈─╮
┃ *⌯︙ ${randomWord}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
> _*أسرع واحد يكتب الكلمة السابقة بشكل صحيح يكسب نقطة! ⏱️ 30 ثانية*_`);
    
    if (!global.break.scores[m.chat]) global.break.scores[m.chat] = {};
    
    global.break.games[m.chat] = {
        answer: randomWord,
        timeout: setTimeout(() => {
            if (global.break.games[m.chat]) {
                delete global.break.games[m.chat];
                delete global.break.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

handler.usage = ["كتابه"];
handler.category = "games";
handler.command = ['كتابه', 'كتابة'];
export default handler;
