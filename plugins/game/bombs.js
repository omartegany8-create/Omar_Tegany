/*
code: game bombs custom (Solo Reply & Anti-Overlap Edition)
by: 𝐓𝐨جي & Gemini
*/

// دالة مساعدة لرسم اللوحة للعضو أولاً بأول بشكل منظم
function drawLiveBoard(board, revealed) {
    let grid = board.map((type, i) => {
        if (!revealed[i]) {
            // تحويل الأرقام الترتيبية لإيموجي
            const numbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
            return numbers[i];
        }
        if (type === 'B') return "💣";
        if (type === 'C') return "🍪";
        return "⬜";
    });
    return `${grid[0]} | ${grid[1]} | ${grid[2]}\n${grid[3]} | ${grid[4]} | ${grid[5]}\n${grid[6]} | ${grid[7]} | ${grid[8]}`;
}

async function startBombTimeout(chatId, conn) {
    const game = global.bombsGame[chatId];
    if (!game) return;

    if (game.timeout) clearTimeout(game.timeout);

    game.timeout = setTimeout(async () => {
        if (global.bombsGame?.[chatId]) {
            const oldPlayer = global.bombsGame[chatId].player;
            delete global.bombsGame[chatId];
            await conn.sendMessage(chatId, {
                text: `⚠️ @${oldPlayer.split('@')[0]} أنت شغلت اللعبة وسبتها ومشيت؟ 🤨\n*لم تقم بأي تفاعل تم الغلق تلقائياً..*\n\nاللي يحب يلعب يكتب 👈🏻 *.متفجرات* عشان تبدأ اللعبة 💣🔥`,
                mentions: [oldPlayer]
            });
        }
    }, 30000); // 30 ثانية سحب سحب
}

async function handler(m, { conn }) {
    if (!global.bombsGame) global.bombsGame = {};
    const chatId = m.chat;

    // منع تداخل اللعب المتزامن لعضوين
    if (global.bombsGame[chatId]) {
        return m.reply(`دقيقة يا @${m.sender.split('@')[0]}، في واحد بيلعب حالياً لما يخلص يبقا العب انت تمام 🌹`, null, { mentions: [m.sender] });
    }

    // التوزيعة الجديدة المطلوبة: قنبلة واحدة بس (B)، 6 كوكيز (C)، 2 فارغ (S)
    let items = ['B', 'C', 'C', 'C', 'C', 'C', 'C', 'S', 'S'];
    items = items.sort(() => Math.random() - 0.5);

    // مقادير كوكيز عشوائية ممتازة ومثيرة لكل خانة كوكيز
    const cookiesValues = Array(9).fill(0).map(() => Math.floor(Math.random() * 5) + 3);

    global.bombsGame[chatId] = {
        player: m.sender,
        board: items,
        cookiesMap: cookiesValues,
        revealed: Array(9).fill(false),
        safeZonesNeeded: 8, // الفوز يتطلب فتح الـ 8 خانات الآمنة وتجنب القنبلة الواحدة
        safeZonesOpened: 0,
        scoreCookies: 0,
        lastMsgId: null,
        timeout: null
    };

    await conn.sendMessage(m.chat, { react: { text: "💣", key: m.key } });

    const currentBoardText = drawLiveBoard(global.bombsGame[chatId].board, global.bombsGame[chatId].revealed);

    const sent = await m.reply(`🎮 *لعبة المتفجرات بدأت 👻💣🔥*\n@${m.sender.split('@')[0]} يلعب الآن \n\n${currentBoardText}\n\n> *عندك 9 مناطق! اعمل (رد / Reply) على الرسالة دي بالرقم من [1 إلى 9]، بس خلي بالك من القنابل 👽💣!*`, null, { mentions: [m.sender] });
    
    global.bombsGame[chatId].lastMsgId = sent.key.id;
    startBombTimeout(chatId, conn);
}

handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    const game = global.bombsGame?.[chatId];
    if (!game || !m.text) return false;

    // تجاهل تام لأي لاعب غير مفعل اللعبة
    if (m.sender !== game.player) return false;

    // منع تداخل XO: لازم يكون العضو عامل رد على رسالة البوت الأخيرة للمتفجرات
    if (!m.quoted || m.quoted.id !== game.lastMsgId) return false;

    const move = parseInt(m.text.trim());
    if (isNaN(move) || move < 1 || move > 9) return false;

    const index = move - 1;

    if (game.revealed[index]) {
        await m.reply("⚠️ المنطقة دي متطهرة ومفتوحة أصلاً يا أسطورة! اختر مربع تاني بسرعة.");
        return true;
    }

    // تجديد التايم أوت لأن اللاعب لسه شغال بيتفاعل وبيلعب
    if (game.timeout) clearTimeout(game.timeout);

    game.revealed[index] = true;
    const cellType = game.board[index];

    // 1. حالة القنبلة الواحدة القاتلة 💣
    if (cellType === 'B') {
        await conn.sendMessage(m.chat, { react: { text: "💣", key: m.key } });
        
        let finalBoard = game.board.map(type => {
            if (type === 'B') return "💣";
            if (type === 'C') return "🍪";
            return "⬜";
        });
        const gridFail = `${finalBoard[0]} | ${finalBoard[1]} | ${finalBoard[2]}\n${finalBoard[3]} | ${finalBoard[4]} | ${finalBoard[5]}\n${finalBoard[6]} | ${finalBoard[7]} | ${finalBoard[8]}`;

        await m.reply(`💣💥💣💥💣💥💣💥💣💥\n💣     *بووووووم !!!*\n*لقد تفجرت في المنطقة [ ${move} ]* \n💣\n💥    ${gridFail}\n💣\n > ☠️💣 حظاً أوفر المرة القادمة، لقد\n💣 تفجرت وخسرت الكوكيز التي جمعتها!\n💥 *لو عايز تلعب تاني اكتب .متفجرات*\n💣 *وشوف حظك 👽💥*\n💥💣💥💣💥💣💥💣💥`);
        
        delete global.bombsGame[chatId];
        return true;
    }

    // 2. حالة الكوكيز 🍪
    if (cellType === 'C') {
        await conn.sendMessage(m.chat, { react: { text: "🍪", key: m.key } });
        const prize = game.cookiesMap[index];
        game.scoreCookies += prize;
        game.safeZonesOpened += 1;
        
        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].cookies = (global.db.users[m.sender].cookies || 0) + prize;
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 50;
        }

        const boardNow = drawLiveBoard(game.board, game.revealed);
        
        if (game.safeZonesOpened === game.safeZonesNeeded) {
            // فوز كاسح
            if (global.db?.users[m.sender]) global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 300;
            await m.reply(`🏆 *نــصــر ســاحــق ومـثـيـر!!* 🏆\n\nلقد قمت باستبعاد جميع المناطق وتفادي القنبلة بنجاح أسطوري مذهل! 🤩🔥\n\n${boardNow}\n\n🏅 مكافأة الفوز الكبرى: *+300 XP*\n🍪 إجمالي الكوكيز المكتسبة: *+${game.scoreCookies} كوكيز*\n\nعاش يا كينج المتفجرات! 😎🔥`);
            delete global.bombsGame[chatId];
            return true;
        }

        const nextMsg = await m.reply(`🍪 *حظك 👽 ! عثرت على إمدادات كوكيز في المنطقة [ ${move} ]*\n\n🎁 حصلت على: *+${prize} كوكيز* و *+50 XP*\n📊 مجموع الكوكيز: *${game.scoreCookies} كوكيز*\n\n${boardNow}\n\n> _عاش كمل استبعاد واعمل رد بالرقم التالي..._`);
        game.lastMsgId = nextMsg.key.id;
        startBombTimeout(chatId, conn);
    }

    // 3. حالة المنطقة الفارغة الآمنة ⬜
    if (cellType === 'S') {
        await conn.sendMessage(m.chat, { react: { text: "⬜", key: m.key } });
        game.safeZonesOpened += 1;
        
        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 30;
        }

        const boardNow = drawLiveBoard(game.board, game.revealed);

        if (game.safeZonesOpened === game.safeZonesNeeded) {
            // فوز كاسح
            if (global.db?.users[m.sender]) global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 300;
            await m.reply(`🏆 *نــصــر ســاحــق ومـثـيـر!!* 🏆\n\nلقد قمت باستبعاد جميع المناطق وتفادي القنبلة بنجاح أسطوري مذهل! 🤩🔥\n\n${boardNow}\n\n🏅 مكافأة الفوز الكبرى: *+300 XP*\n🍪 إجمالي الكوكيز المكتسبة: *+${game.scoreCookies} كوكيز*\n\nعاش يا كينج المتفجرات! 😎🔥`);
            delete global.bombsGame[chatId];
            return true;
        }

        const nextMsg = await m.reply(`⬜ *حظك 👽 المنطقة دي آمنة! نجوت في المربع [ ${move} ]*\n\n🏅 حصلت على جائزة: *+30 XP*.\n\n${boardNow}\n\n> _الوضع لحد دلوقتي آمن.. اكتب الرقم التالي 👽_`);
        game.lastMsgId = nextMsg.key.id;
        startBombTimeout(chatId, conn);
    }

    return true;
};

handler.usage = ["متفجرات"];
handler.category = "games";
handler.command = ['متفجرات', 'قنبلة', 'قنبله'];
export default handler;
