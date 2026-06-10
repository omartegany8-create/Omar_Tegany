/*
code: game bombs custom (solo edition)
by: 𝐓𝐨𝐣𝐢 & Gemini
*/

async function handler(m, { conn, text, command }) {
    if (!global.bombsGame) global.bombsGame = {};
    const chatId = m.chat;

    // التحقق لو في لعبة شغالة في الجروب
    if (global.bombsGame[chatId]) {
        return m.reply(`❌ هناك لعبة متفجرات قائمة بالفعل في هذا الجروب يلعبها: @${global.bombsGame[chatId].player.split('@')[0]}`, null, { mentions: [global.bombsGame[chatId].player] });
    }

    // إنشاء وتوزيع عناصر اللوحة عشوائياً (9 مربعات)
    // العناصر: 2 قنبلة (B)، 4 كوكيز (C)، 3 آمنة (S)
    let items = ['B', 'B', 'C', 'C', 'C', 'C', 'S', 'S', 'S'];
    // خلط العناصر عشوائياً بالكامل
    items = items.sort(() => Math.random() - 0.5);

    // تجهيز مصفوفة بمقادير الكوكيز العشوائية لكل مربع كوكيز عشان الحماس
    const cookiesValues = Array(9).fill(0).map(() => Math.floor(Math.random() * 5) + 3); // كوكيز عشوائي من 3 لـ 7

    global.bombsGame[chatId] = {
        player: m.sender,
        board: items, // التوزيعة العشوائية
        cookiesMap: cookiesValues,
        revealed: Array(9).fill(false), // المربعات المفتوحة
        safeZonesNeeded: 7, // عدد المناطق الآمنة المطلوب فتحها للفوز (9 ناقص قنبلتين)
        safeZonesOpened: 0,
        scoreCookies: 0
    };

    // ريأكت التفعيل الفخم 💣
    await conn.sendMessage(m.chat, { react: { text: "💣", key: m.key } });

    await m.reply(`🎮 *حلبة المتفجرات الأسطورية بدأت!* 💣\n\nالميدان محجوز بالكامل للرائد: @${m.sender.split('@')[0]}\n\n1️⃣ | 2️⃣ | 3️⃣\n4️⃣ | 5️⃣ | 6️⃣\n7️⃣ | 8️⃣ | 9️⃣\n\n> *أمامك 9 مناطق مصيرية! اكتب رقم المربع من [1 إلى 9] لتطهيره، إياك ولمس القنابل!*`, null, { mentions: [m.sender] });
}

handler.before = async (m, { conn }) => {
    if (!m.text || !global.bombsGame?.[m.chat]) return false;
    
    const chatId = m.chat;
    const game = global.bombsGame[chatId];
    
    // تأمين اللعبة: التأكد إن اللي بيكتب هو نفس العضو اللي فعل اللعبة
    if (m.sender !== game.player) return false;

    // قراءة الرقم من الشات
    const move = parseInt(m.text.trim());
    if (isNaN(move) || move < 1 || move > 9) return false;

    const index = move - 1;

    // التحقق لو المربع اتفتح قبل كده
    if (game.revealed[index]) {
        await m.reply("⚠️ لقد قمت بفتح هذه المنطقة مسبقاً! اختر رقماً آخر.");
        return true;
    }

    game.revealed[index] = true;
    const cellType = game.board[index];

    // 1. حالة الانفجار والخسارة 💣
    if (cellType === 'B') {
        await conn.sendMessage(m.chat, { react: { text: "💣", key: m.key } });
        
        // كشف اللوحة كاملة للعضو
        let finalBoard = game.board.map((type, i) => {
            if (type === 'B') return "💣";
            if (type === 'C') return "🍪";
            return "⬜";
        });
        
        const grid = `${finalBoard[0]} | ${finalBoard[1]} | ${finalBoard[2]}\n${finalBoard[3]} | ${finalBoard[4]} | ${finalBoard[5]}\n${finalBoard[6]} | ${finalBoard[7]} | ${finalBoard[8]}`;
        
        await m.reply(`💥 *💥 كـبـووووم!! لقد تفجرت في المنطقة [ ${move} ]* 💥\n\n${grid}\n\n☠️ حظاً أوفر المرة القادمة يا أسطورة، خسرت الكوكيز التي جمعتها في هذه الجولة!`);
        delete global.bombsGame[chatId];
        return true;
    }

    // 2. حالة العثور على كوكيز 🍪
    if (cellType === 'C') {
        await conn.sendMessage(m.chat, { react: { text: "🍪", key: m.key } });
        const prize = game.cookiesMap[index];
        game.scoreCookies += prize;
        game.safeZonesOpened += 1;
        
        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].cookies = (global.db.users[m.sender].cookies || 0) + prize;
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 50;
        }

        await m.reply(`🍪 *رائع! عثرت على إمدادات كوكيز في المنطقة [ ${move} ]*\n\n🎁 حصلت على: *+${prize} كوكيز* و *+50 XP*\n📊 مجموع ما جمعته حتى الآن: *${game.scoreCookies} كوكيز*\n\n> _تابع التطهير واكتب رقم المربع التالي..._`);
    }

    // 3. حالة المنطقة الآمنة الفارغة ⬜
    if (cellType === 'S') {
        await conn.sendMessage(m.chat, { react: { text: "⬜", key: m.key } });
        game.safeZonesOpened += 1;
        
        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 30;
        }

        await m.reply(`⬜ *هذه المنطقة آمنة تماماً! لقد نجوت في المربع [ ${move} ]*\n\n🏅 حصلت على: *+30 XP* كجائزة نجاة.\n\n> _الوضع آمن حتى الآن.. اكتب الرقم التالي!_`);
    }

    // 4. حالة الفوز الكاسح (فتح كل المناطق وتفادي القنبلتين) 🎉
    if (game.safeZonesOpened === game.safeZonesNeeded) {
        let winBoard = game.board.map((type) => {
            if (type === 'B') return "💣";
            if (type === 'C') return "🍪";
            return "⬜";
        });
        const gridWin = `${winBoard[0]} | ${winBoard[1]} | ${winBoard[2]}\n${winBoard[3]} | ${winBoard[4]} | ${winBoard[5]}\n${winBoard[6]} | ${winBoard[7]} | ${winBoard[8]}`;

        if (global.db?.users[m.sender]) {
            global.db.users[m.sender].xp = (global.db.users[m.sender].xp || 0) + 300;
        }

        await m.reply(`🏆 *نــصــر ســاحــق!!* 🏆\n\nلقد قمت بتطهير الميدان بالكامل وتفادي القنابل بنجاح أسطوري!\n\n${gridWin}\n\n🏅 مكافأة الفوز الكبرى: *+300 XP*\n🍪 إجمالي الكوكيز المكتسبة: *+${game.scoreCookies} كوكيز* \n\nعاش يا كينج المتفجرات! 😎🔥`);
        delete global.bombsGame[chatId];
    }

    return true;
};

handler.usage = ["متفجرات"];
handler.category = "games";
handler.command = ['متفجرات', 'قنبلة', 'قنبله'];
export default handler;
          
