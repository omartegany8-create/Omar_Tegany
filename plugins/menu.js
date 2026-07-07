// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🕸️ قائمة أوامر بوت: 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪
//  ⚡ تصميم منسق وفخم ومقاوم للأخطاء
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MENU_TIMEOUT = 120000;

const CATEGORIES = [
    [1, 'التـحـمـيـل', 'downloads', '📂'],
    [2, 'الـمـجـمـوعـات', 'group', '🛡️'],
    [3, 'الـمـلـصـقـات', 'sticker', '🌄'],
    [4, 'الـمـطـوريـن', 'owner', '👑'],
    [5, 'امـثـلـه', 'example', '✳️'],
    [6, 'الـادوات', 'tools', '🚀'],
    [7, 'الـبـحـث', 'search', '🌐'],
    [8, 'الادمــن', 'admin', '👨🏻‍⚖️'],
    [9, 'الالــعـاب', 'games', '🎮'],
    [10, 'الچيف', 'gif', '✴️'],
    [11, 'الـبــنـك', 'bank', '💰'],
    [12, 'الـذكـاء الاصـطـنـاعـي', 'ai', '🤖'],
    [13, 'الـبـوتـات الـفـرعـي', 'sub', '♥️'],
    [14, 'مـعـلومـات الـبـوت', 'info', '🗃️'],
    [15, 'الـالــقــاب', 'nicknames', '🏷️'],
    [16, 'الـلـوجـوهــات', 'logos', '🎡'],
    [17, 'تـغـيـر الاصـوات', 'voices', '📢'],
    [18, 'أخــرى', 'other', '🌹']
];

const getCat = n => CATEGORIES.find(c => c[0] === n);

if (!global.menus) global.menus = {};

const clean = () => {
    const now = Date.now();
    Object.keys(global.menus).forEach(k => {
        if (now - global.menus[k].time > MENU_TIMEOUT) delete global.menus[k];
    });
};

const getImg = (bot) => {
    const { images } = bot.config.info;
    return Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images;
};

const context = (jid, img) => ({
    mentionedJid: [jid],
    isForwarded: true,
    forwardingScore: 1,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '0029Vb8Q2Q56WaKx5Qk8QM2y@newsletter',
        newsletterName: '𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
        serverMessageId: 0
    },
    externalAdReply: {
        title: "𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️",
        body: "✮⃝🕸️ 𝑴𝑬𝑹𝑶 𝑴𝑬𝑵𝑼 𝑳𝑰𝑺𝑻 🕸️⃝✮",
        thumbnailUrl: img,
        sourceUrl: 'https://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y',
        mediaType: 1,
        renderLargerThumbnail: true
    }
});

const menu = async (m, { conn, bot }) => {
    clean();
    
    const cmds = await bot.getAllCommands();
    const cats = {};
    
    cmds.forEach(c => {
        if (!c.usage?.length) return;
        const cat = c.category || 'other';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(c);
    });

    // تنسيق واجهة القائمة الرئيسية بشكل فخم
    let txt = `🕸️⃟🕷️ ═══ 𓆩 𝑴𝑬𝑹𝑶 𝑴𝑬𝑵𝑼 𓆪 ═══ 🕸️⃟🕷️\n\n`;
    txt += `  ⚡ *مـرحـبـاً بك يـا حـب فـي قـائـمـة الأوامـر* ⚡\n`;
    txt += `┌──────────────────────┐\n`;
    
    CATEGORIES.forEach(c => {
        // حشو المسافات لجعل المنيو متناسق ومحاذاته مظبوطة
        const num = c[0] < 10 ? `0${c[0]}` : c[0];
        txt += `│ ⌯ [ ${num} ] ➥ *قـسـم ${c[1]}* ${c[3]}\n`;
    });
    
    txt += `└──────────────────────┘\n\n`;
    txt += `📌 *مـلـحوظـة:* رد على هذه الرسالة بـ **رقم القسم فقط** (بدون نقطة أو رموز) لفتح الأوامر الخاصة به.\n\n`;
    txt += `⊱⋅ ─────────────── ⋅⊰\n`;
    txt += `🕯️ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 ~ ${bot.config.info.nameBot || 'Bot'}`;

    const msg = await conn.sendMessage(m.chat, { 
        text: txt,
        contextInfo: context(m.sender, getImg(bot))
    }, { quoted: m }); // تم التعديل هنا لـ m لضمان الاستقرار
  
    global.menus[msg.key.id] = { cats, chatId: m.chat, time: Date.now() };
};

menu.before = async (m, { conn, bot }) => {
    clean();
    
    const menuData = global.menus[m.quoted?.id];
    if (!menuData) return false;
    
    const cat = getCat(parseInt(m.text));
    if (!cat) {
        await conn.sendMessage(m.chat, { text: '❌ *يا حب، اختار رقم صح من القائمة المكتوبة فوق بس!*' }, { quoted: m });
        return true;
    }
    
    const cmds = menuData.cats[cat[2]];
    if (!cmds?.length) {
        await conn.sendMessage(m.chat, { text: '❌ *عذراً، هذا القسم فارغ حالياً!*' }, { quoted: m });
        return true;
    }
    
    // حذف منيو الاختيارات القديم لمنع تشتيت الشات
    try {
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: m.quoted.id, fromMe: true } });
    } catch {}
    
    delete global.menus[m.quoted.id];
    
    // تنسيق عرض الأوامر داخل القسم المختار بشكل احترافي
    let cmdsList = '';
    cmds.forEach(c => {
        c.usage.forEach(u => {
            cmdsList += `  🔹 *${bot.config.prefix || '.'}${u}*\n`;
        });
    });
    
    let resultTxt = `╔═════ 𓆩 ${cat[3]} قـسـم ${cat[1]} ${cat[3]} 𓆪 ═════╗\n\n`;
    resultTxt += `${cmdsList}\n`;
    resultTxt += `╚════════════════════════╝\n\n`;
    resultTxt += `⊱⋅ ─────────────── ⋅⊰\n`;
    resultTxt += `🕯️ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 ~ ${bot.config.info.nameBot || 'Bot'}`;
    
    await conn.sendMessage(m.chat, { 
        text: resultTxt,
        contextInfo: context(m.sender, getImg(bot))
    }, { quoted: m });
    
    return true;
};

menu.command = ['اوامر', 'القائمة', 'menu'];
export default menu;
        
