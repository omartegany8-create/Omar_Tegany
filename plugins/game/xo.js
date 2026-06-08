async function handler(m, { command, text, conn }) {
    global.xoGames ??= {};
    const game = global.xoGames[m.chat];
    
    // تنظيف النص وتجنب الأخطاء لو العضو كتب الأمر بدون إضافات
    const args = (text || '').trim().toLowerCase().split(' ');
    const cmd = args[0];
    
    const isDelete = cmd === 'delete' || cmd === 'حذف';
    const isJoin = cmd === 'join' || cmd === 'انضمام' || !cmd; // لو كتب الأمر فاضي يعتبر انضمام تلقائي

    // 1. أمر حذف اللعبة
    if (isDelete) {
        if (!game) return m.reply("❌ لا توجد لعبة نشطة للحذف حالياً!");
        if (game.player1 !== m.sender && game.player2 !== m.sender) return m.reply("❌ فقط اللاعبين المشاركين يمكنهم حذف اللعبة!");
        delete global.xoGames[m.chat];
        return m.reply("🗑️ تم إلغاء وحذف لعبة XO بنجاح!");
    }
    
    // 2. أمر الانضمام أو بدء اللعبة
    if (isJoin) {
        if (!game) {
            // لو مفيش لعبة أصلاً، ننشئ واحدة جديدة
            global.xoGames[m.chat] = { 
                player1: m.sender, 
                player2: null, 
                board: Array(9).fill(null), 
                turn: 'X', 
                status: 'waiting' 
            };
            return m.reply(`🎮 *تم إنشاء لعبة XO بنجاح!*\n\n@${m.sender.split('@')[0]} ينتظر خصماً الآن..\n\n> _اكتب *${m.prefix || '.'}${command}* للعب ضده وتحديه!_`, null, { mentions: [m.sender] });
        }
        
        // لو في لعبة قيد الانتظار وصاحبك كتب .xo هيدخل هنا علطول ويشتغل
        if (game.status === 'waiting') {
            if (game.player1 === m.sender) return m.reply("❌ لا يمكنك اللعب ضد نفسك! انتظر خصماً حقيقياً.");
            
            game.player2 = m.sender;
            game.status = 'playing';
            
            return conn.sendMessage(m.chat, { 
                text: `⚔️ *بدأت ملحمة الـ XO الآن!*\n\n${drawBoard(game.board)}\n\n❌ ⌯︙ @${game.player1.split('@')[0]}\n⭕ ⌯︙ @${game.player2.split('@')[0]}\n\n⚡ الدور الآن عند: @${game.player1.split('@')[0]} (❌)\n_اكتب رقم المربع من [1 إلى 9] للعب_`,
                mentions: [game.player1, game.player2] 
            });
        }
        
        // لو في لعبة شغالة بالفعل في الشات وكتب .xo تالت
        if (game.status === 'playing') {
            return m.reply(`❌ توجد لعبة نشطة بالفعل حالياً في الجروب!\n\nاكتب *${m.prefix || '.'}${command} حذف* لإلغائها وبدء جولة جديدة.`);
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
        await m.reply("❌ هذا المربع مشغول بالفعل! اختر مكاناً آخر.");
        return true;
    }
    
    game.board[move] = game.turn;
    const winner = checkWinner(game.board);
    
    if (winner || game.board.every(cell => cell)) {
        let text, winnerJid;
        
        if (winner) {
            winnerJid = winner === 'X' ? game.player1 : game.player2;
            text = `🏆 *انتهت اللعبة بفوز ساحق!*\n\n${drawBoard(game.board)}\n\n🎉 الفائز المحترف: @${winnerJid.split('@')[0]}`;
            
            if (global.db?.users[winnerJid]) {
                global.db.users[winnerJid].xp = (global.db.users[winnerJid].xp || 0) + 500;
                global.db.users[winnerJid].cookies = (global.db.users[winnerJid].cookies || 0) + 10;
                text += `\n\n🏅 الجوائز: *+500 XP* | *🍪 +10 كوكيز*`;
            }
        } else {
            text = `🤝 *انتهت المباراة بالتعادل!🏆*\n\n${drawBoard(game.board)}\n\nلم يتمكن أحد من السيطرة على اللوحة.`;
        }
        
        await conn.sendMessage(m.chat, { text, mentions: winnerJid ? [winnerJid] : undefined });
        delete global.xoGames[m.chat];
        return true;
    }
    
    game.turn = game.turn === 'X' ? 'O' : 'X';
    const nextPlayer = game.turn === 'X' ? game.player1 : game.player2;
    await conn.sendMessage(m.chat, { 
        text: `${drawBoard(game.board)}\n\nدورك يا أسطورة: @${nextPlayer.split('@')[0]} (${game.turn === 'X' ? '❌' : '⭕'})`,
        mentions: [nextPlayer] 
    });
    return true;
};

handler.usage = ["اكس"];
handler.category = "games";
handler.command = ['اكس', 'xo'];
handler.usePrefix = true;
export default handler;

const drawBoard = b => [0,3,6].map(i => 
    b.slice(i,i+3).map((c,idx) => c ? (c==='X'?'❌':'⭕') : `${i+idx+1}️⃣`).join(' | ')
).join('\n');

const checkWinner = b => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    return null;
};
