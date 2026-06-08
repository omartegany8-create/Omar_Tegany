// تغيير اسم الفانكشن لـ breakHandler
async function breakHandler(m, { conn }) {
    if (!global.breakGame) global.breakGame = { games: {}, scores: {} };

    if (global.breakGame.games[m.chat]) {
        clearTimeout(global.breakGame.games[m.chat].timeout);
        delete global.breakGame.games[m.chat];
    }

    const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-تفكيك.json")).json();
    const q = data[Math.floor(Math.random() * data.length)];
    
    m.reply(`
╭─┈─┈─┈─⟞🔨⟝─┈─┈─┈─╮
┃ *⌯︙ ${q.question}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
> _*اكتب الكلام بسرعه عشان تتحسبلك نقطه + بعد ٣٠ ثانيه لو مردتش اللعبه هتنتهي*_`);
    
    if (!global.breakGame.scores[m.chat]) global.breakGame.scores[m.chat] = {};
    
    global.breakGame.games[m.chat] = {
        answer: q.response,
        timeout: setTimeout(() => {
            if (global.breakGame.games[m.chat]) {
                delete global.breakGame.games[m.chat];
                delete global.breakGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

breakHandler.before = async (m, { conn }) => {
    if (!m.text || !global.breakGame?.games[m.chat] || !global.breakGame?.scores[m.chat]) return;

    const game = global.breakGame.games[m.chat];
    const player = m.sender;
    
    if (m.text.trim() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.breakGame.games[m.chat];

    if (!global.breakGame.scores[m.chat][player]) global.breakGame.scores[m.chat][player] = 0;
    global.breakGame.scores[m.chat][player]++;
    
    let total = 0;
    for (let id in global.breakGame.scores[m.chat]) {
        total += global.breakGame.scores[m.chat][id];
    }
    
    if (total >= 20) {
        const entries = Object.entries(global.breakGame.scores[m.chat])
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
            text: `🏆 *الفائزون في التفكيك*\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز`,
            mentions
        });
        delete global.breakGame.scores[m.chat];
        return;
    }

    await m.reply(`✅ احسنت معاك: ${global.breakGame.scores[m.chat][player]} نقطه`);
    breakHandler(m, { conn }); // استدعاء نفس الفانكشن الخاصة بالتفكيك فقط
};

breakHandler.usage = ["تفكيك"];
breakHandler.category = "games";
breakHandler.command = ['تفكيك'];
export default breakHandler;
