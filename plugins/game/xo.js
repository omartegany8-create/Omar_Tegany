async function handler(m, { command, text, conn }) {
    global.xoGames ??= {};
    const game = global.xoGames[m.chat];
    
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];
    
    const isDelete = cmd === 'delete' || cmd === 'حذف' || cmd === 'انهاء';
    const isJoin = cmd === 'join' || cmd === 'انضمام' || !cmd;

    if (isDelete) {
        if (!game) return m.reply("❌ مفيش لعبة XO شغالة في عشان أحذفها يسطا!");
        
        // 👑 الفحص المطور الجديد: لو اللي كاتب الأمر هو الأونر/المطور، يتخطى الشرط فوراً ويقفل الجيم
        const isOwner = global.isBotOwner ? global.isBotOwner(m.sender) : (m.sender.includes('201') || m.fromMe);
        
        if (!isOwner && game.player1 !== m.sender && game.player2 !== m.sender) {
            return m.reply("❌ العب بعيد يا شاطر.. اللي بدأوا الجيم بس هما اللي يقدروا يحذفوه! 🤫🔥");
        }
        
        delete global.xoGames[m.chat];
        return m.reply("🗑️ *أبشر! تم إلغاء وحذف جولة الـ XO.*");
    }
    
    if (isJoin) {
        if (!game) {
            global.xoGames[m.chat] = { 
                player1: m.sender, 
                player2: null, 
                board: Array(9).fill(null), 
                turn: 'X', 
                status: 'waiting' 
            };
            // ريأكت الدائرة عند بدء اللعبة
            await conn.sendMessage(m.chat, { react: { text: "⭕", key: m.key } });
            return m.reply(`🎮 *تـحـدي لعبة XO الممتعة!* ✨\n\n👑 الاعب : @${m.sender.split('@')[0]} في انتظار خصم لتحديه..\n\n> 💡 _عايز تنزل تلعب ضده؟ اكتب بس 👈🏻 *.${command}*_`, null, { mentions: [m.sender] });
        }
        
        if (game.status === 'waiting') {
            if (game.player1 === m.sender) return m.reply("❌ بطل كسل والعب ضد حد حقيقي.. مستحيل تلعب ضد نفسك يسطا! 😂");
            
            game.player2 = m.sender;
            game.status = 'playing';
            
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            
            const msg = await conn.sendMessage(m.chat, { 
                text: `⚔️ *بـدأت مـلـحـمـة الـذكـاء والـتـحـدي!* 🔥\n\n${drawBoard(game.board)}\n\n❌ ⇦ @${game.player1.split('@')[0]}\n⭕ ⇦ @${game.player2.split('@')[0]}\n\n────────────────\n⚡ الدور الأول والبداية عند: @${game.player1.split('@')[0]} (❌)\n🦦 _اكتب رقم المربع من [1 إلى 9]!_`,
                mentions: [game.player1, game.player2] 
            });
            
            await conn.sendMessage(m.chat, { react: { text: "❌", key: msg.key } });
            return;
        }
        
        if (game.status === 'playing') {
            return m.reply(`⚠️ يسطا في مباراة XO طحن شغالة حالياً في الشات!\n\nاكتب 👈🏻 *.${command} حذف* لو الجيم معلق وعايز تقفله.`);
        }
    }
}

handler.before = async (m, { conn }) => {
    if (!m.text || !global.xoGames?.[m.chat]) return false;
    const game = global.xoGames[m.chat];
    if (game.status !== 'playing') return false;
    
    const currentPlayer = game.turn === 'X' ? game.player1 : game.player2;
    if (m.sender !== currentPlayer) return false;
    
    const move = parseInt(m.text.trim()) - 1;
    if (move < 0 || move > 8 || isNaN(move)) return false;
    if (game.board[move] !== null) {
        await m.reply("❌ المربع ده ومشغول يسطا! ركز في الخانات الفاضية ونقي رقم تاني. 🧐");
        return true;
    }
    
    game.board[move] = game.turn;
    const winner = checkWinner(game.board);
    const isSmartDraw = checkSmartDraw(game.board);
    
    // فحص الفوز أو التعادل الذكي المبكر
    if (winner || isSmartDraw || game.board.every(cell => cell)) {
        let text, winnerJid;
        
        if (winner) {
            winnerJid = winner === 'X' ? game.player1 : game.player2;
            text = `🏆 *انـتـهـت الـمـبـاراة بـفـوز مـحـتـرف!* 🎉\n\n${drawBoard(game.board)}\n\n👑 *البطل الكينج:* @${winnerJid.split('@')[0]}\n`;
            
            if (global.db?.users[winnerJid]) {
                global.db.users[winnerJid].xp = (global.db.users[winnerJid].xp || 0) + 500;
                global.db.users[winnerJid].cookies = (global.db.users[winnerJid].cookies || 0) + 10;
                text += `🎁 الجوائز: *+500 XP* & *🍪 +10 كوكيز* ⚡`;
            }
            await conn.sendMessage(m.chat, { react: { text: "🎉", key: m.key } });
        } else {
            text = `🤝 *تـعـادل ذكِـي ومـحـتـوم!* ⚖️\n\n${drawBoard(game.board)}\n\n> 💡 _البوت قفل الجيم تلقائي لأن مفيش أي خط فوز محتمل لأي لاعب.. اللعب متقفل ومفيهاش مكسب حاول تغير رقم 5 دا شوية !_ 🐦🤙🏻`;
            await conn.sendMessage(m.chat, { react: { text: "⚖️", key: m.key } });
        }
        
        await conn.sendMessage(m.chat, { text, mentions: winnerJid ? [winnerJid] : undefined });
        delete global.xoGames[m.chat];
        return true;
    }
    
    // تبديل الأدوار بشكل سلس
    game.turn = game.turn === 'X' ? 'O' : 'X';
    const nextPlayer = game.turn === 'X' ? game.player1 : game.player2;
    
    const msg = await conn.sendMessage(m.chat, { 
        text: `${drawBoard(game.board)}\n\n🦦 دورك يا : @${nextPlayer.split('@')[0]} (${game.turn === 'X' ? '❌' : '⭕'})`,
        mentions: [nextPlayer] 
    });
    
    const currentTurnEmoji = game.turn === 'X' ? "❌" : "⭕";
    await conn.sendMessage(m.chat, { react: { text: currentTurnEmoji, key: msg.key } });
    
    return true;
};

handler.usage = ["اكس"];
handler.category = "games";
handler.command = ['اكس', 'xo'];
handler.usePrefix = true;
export default handler;

// 🎨 دالة رسم البوردة الأنيقة والفاخرة لتسهيل القراءة بالرموز النظيفة
const drawBoard = b => {
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return [0, 3, 6].map(i => 
        "   " + b.slice(i, i + 3).map((c, idx) => c ? (c === 'X' ? '❌' : '⭕') : emojis[i + idx]).join("  ┃  ")
    ).join("\n   ───╋───╋───\n");
};

// فحص الفوز التقليدي
const checkWinner = b => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return null;
};

// 🧠 خوارزمية ذكية للكشف عن التعادل المحتوم قبل امتلاء البوردة بالكامل
const checkSmartDraw = b => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let possibleLines = 0;
    
    for (const [a, c, d] of lines) {
        const cells = [b[a], b[c], b[d]];
        const hasX = cells.includes('X');
        const hasO = cells.includes('O');
        
        // الخط يفضل متاح للفوز لو كان فاضي أو فيه رمز واحد بس ومفهوش خبيص (مش مخلوط X مع O)
        if (!(hasX && hasO)) {
            possibleLines++;
        }
    }
    // لو عدد الخطوط المتاحة للفوز صفر.. يبقا اللعبة منتهية برمجياً بالتعادل!
    return possibleLines === 0;
};
