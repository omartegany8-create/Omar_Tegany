// تغيير اسم الفانكشن لـ writeHandler عشان تمنع التضارب
async function writeHandler(m, { conn }) {
    if (!global.writeGame) global.writeGame = { games: {}, scores: {} };

    if (global.writeGame.games[m.chat]) {
        clearTimeout(global.writeGame.games[m.chat].timeout);
        delete global.writeGame.games[m.chat];
    }

    const wordsList = [
        "سكونا", "غوجو", "لوفي", "ميرو", "ناروتو", "إيتاتشي", "أيزن", "شيبويا", 
        "ل", "لاو", "توجي", "كارولين", "فريزا", "غوكو" ,"يوجي", "ميغومي", "نوبارا", "جوجتسو", "كاكاشي", "زورو", "كوروساكي"
    ];
    
    const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞✍️⟝─┈─┈─┈─╮
┃ *⌯︙ ${randomWord}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
> _*أسرع واحد يكتب الكلمة السابقة بشكل صحيح يكسب نقطة! ⏱️ 30 ثانية*_`);
    
    if (!global.writeGame.scores[m.chat]) global.writeGame.scores[m.chat] = {};
    
    global.writeGame.games[m.chat] = {
        answer: randomWord,
        timeout: setTimeout(() => {
            if (global.writeGame.games[m.chat]) {
                delete global.writeGame.games[m.chat];
                delete global.writeGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

writeHandler.before = async (m, { conn }) => {
    if (!m.text || !global.writeGame?.games[m.chat] || !global.writeGame?.scores[m.chat]) return;

    const game = global.writeGame.games[m.chat];
    const player = m.sender;
    
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.writeGame.games[m.chat];

    if (!global.writeGame.scores[m.chat][player]) global.writeGame.scores[m.chat][player] = 0;
    global.writeGame.scores[m.chat][player]++;
    
    let total = 0;
    for (let id in global.writeGame.scores[m.chat]) {
        total += global.writeGame.scores[m.chat][id];
    }
    
    if (total >= 20) {
        const entries = Object.entries(global.writeGame.scores[m.chat])
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
        delete global.writeGame.scores[m.chat];
        return;
    }

    await m.reply(`✅ احسنت معاك: ${global.writeGame.scores[m.chat][player]} نقطه`);
    writeHandler(m, { conn }); // استدعاء نفس الفانكشن بدون تضارب
};

writeHandler.usage = ["كتابه"];
writeHandler.category = "games";
writeHandler.command = ['كتابه', 'كتابة'];
export default writeHandler;
