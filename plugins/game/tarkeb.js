// تغيير اسم الفانكشن لـ arrangeHandler لمنع التضارب نهائياً
async function arrangeHandler(m, { conn, text, command }) {
    if (!global.arrangeGame) global.arrangeGame = { games: {}, scores: {} };

    if (global.arrangeGame.games[m.chat]) {
        clearTimeout(global.arrangeGame.games[m.chat].timeout);
        delete global.arrangeGame.games[m.chat];
    }

    // ريأكت البدء الفخم للتركيب 🀄
    await conn.sendMessage(m.chat, { react: { text: "🀄", key: m.key } });

    // جلب قائمة الكلمات من رابط JSON أونلاين
    const data = await (await fetch("https://raw.githubusercontent.com/Xov445447533/Xov11111/master/src/JSON/venom-تفكيك.json")).json();
    const q = data[Math.floor(Math.random() * data.length)];
    
    // الحل السحري: البوت يعرض الكلمة المفككة (قالب الحروف) واللاعب يدمجها
    m.reply(`
╭─┈─┈─┈─⟞🧩⟝─┈─┈─┈─╮
┃ *⌯︙ ${q.question.trim()}*
╰─┈─┈─┈─⟞⚙️⟝─┈─┈─┈─╯
> _*رتب وادمج الكلمة السابقة بسرعة لتكسب نقطة! معاك ٣٠ ثانية قبل انتهاء الجولة*_`);
    
    if (!global.arrangeGame.scores[m.chat]) global.arrangeGame.scores[m.chat] = {};
    
    global.arrangeGame.games[m.chat] = {
        answer: q.response.trim().toLowerCase(), // الإجابة الصحيحة المدمجة النظيفة
        timeout: setTimeout(() => {
            if (global.arrangeGame.games[m.chat]) {
                delete global.arrangeGame.games[m.chat];
                delete global.arrangeGame.scores[m.chat];
                m.reply("`⏰: انتهى الوقت`");
            }
        }, 30000)
    };
}

arrangeHandler.before = async (m, { conn }) => {
    if (!m.text || !global.arrangeGame?.games?.[m.chat] || !global.arrangeGame?.scores?.[m.chat]) return;

    const game = global.arrangeGame.games[m.chat];
    const player = m.sender;
    
    // التحقق من الإجابة (تطابق الكلمة المدمجة بالملّي)
    if (m.text.trim().toLowerCase() !== game.answer) return;

    clearTimeout(game.timeout);
    delete global.arrangeGame.games[m.chat];

    if (!global.arrangeGame.scores[m.chat][player]) global.arrangeGame.scores[m.chat][player] = 0;
    global.arrangeGame.scores[m.chat][player]++;
    
    // ريأكت البرق ⚡ على رسالة العضو اللي جاوب صح
    await conn.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
    
    let total = 0;
    for (let id in global.arrangeGame.scores[m.chat]) {
        total += global.arrangeGame.scores[m.chat][id];
    }
    
    // إذا وصل إجمالي النقاط في الجروب لـ 20، تنتهي اللعبة ويعلن الفائز
    if (total >= 20) {
        const entries = Object.entries(global.arrangeGame.scores[m.chat])
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
            text: `🏆 *الفائزون في لـعـبـة الـتـركـيـب والـدمـج*\n\n${sorted.join('\n')}\n\n🏅 @${winner.split('@')[0]} حصل على +500 XP و 🍪 +10 كوكيز ⚡`,
            mentions
        });
        delete global.arrangeGame.scores[m.chat];
        return;
    }

    // رسالة المكافأة مع المنشن والإيموجي ⚡
    await conn.sendMessage(m.chat, {
        text: `⚡ أحسنت يا @${player.split('@')[0]} إجابة صحيحة مدمجة! معاك: ${global.arrangeGame.scores[m.chat][player]} نقطة.`,
        mentions: [player]
    }, { quoted: m });
    
    // استدعاء الميثود للجولة التالية تلقائياً
    await new Promise(resolve => setTimeout(resolve, 1500));
    arrangeHandler(m, { conn, text: '', command: 'تركيب' });
};

arrangeHandler.usage = ["تركيب"];
arrangeHandler.category = "games";
arrangeHandler.command = ['تركيب', 'دمج'];
export default arrangeHandler;
    
