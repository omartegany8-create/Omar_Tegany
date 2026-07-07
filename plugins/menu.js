// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  🕸️ منيو الأزرار التفاعلية المطور لـ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪
//  🔘 بنظام الـ Native Flow Single Select List المضمون
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { proto, generateWAMessageFromContent } from "@whiskeysockets/baileys"

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
const getCatByKey = key => CATEGORIES.find(c => c[2] === key);

const getImg = (bot) => {
    const { images } = bot.config.info;
    return Array.isArray(images) ? images[Math.floor(Math.random() * images.length)] : images;
};

// إعداد سياق الرسالة (الإعلان الفخم أسفل الرسالة)
const getContext = (jid, img) => ({
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
    // رياكشن الانتظار المروق
    try { await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } }) } catch {}

    const cmds = await bot.getAllCommands();
    const cats = {};
    cmds.forEach(c => {
        if (!c.usage?.length) return;
        const cat = c.category || 'other';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(c);
    });

    // تجهيز أقسام المنيو كصفوف خيارات (Rows) داخل القائمة الزرار
    const menuRows = CATEGORIES.map(c => ({
        title: `قسم ${c[1]} ${c[3]}`,
        id: `meromenu_cat_${c[2]}`,
        description: `اضغط لعرض أوامر قسم الـ ${c[1]}`
    }));

    // إضافة أزرار الدعم الإضافية زي صورة صاحبك بالظبط
    const extraRows = [
        { title: "📢 القناة الرسمية", id: "meromenu_extra_channel", description: "تابع تحديثات البوت أول بأول" },
        { title: "👑 مراسلة الـمـطـور مـيـرو", id: "meromenu_extra_owner", description: "للدعم الفني وتطوير البوت" }
    ];

    // بناء بارامترات أزرار الـ Native Flow
    const buttonParamsJson = JSON.stringify({
        title: "  𓆩 عرض الاقسام ♡ 𓆪  ",
        sections: [
            { title: "🕸️ قـائـمـة أقـسـام الـبـوت ⛈️", rows: menuRows },
            { title: "✨ الـدّعـم والـتـواصـل ✨", rows: extraRows }
        ]
    });

    const textPayload = `🕸️⃟🕷️ ═══ 𓆩 𝑴𝑬𝑹𝑶 𝑴𝑬𝑵𝑼 𓆪 ═══ 🕸️⃟🕷️\n\n  ⚡ *مـرحـبـاً بك يـا حـب فـي قـائـمـة الأوامـر* ⚡\n\nاضغط على الزر بالأسفل لفتح قائمة الأقسام الرئيسية مباشرة واختر ما يناسبك.\n\n⊱⋅ ─────────────── ⋅⊰\n🕯️ 𓆩 𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪`;

    // إنشاء رسالة الأزرار التفاعلية المتطورة
    const menuMessage = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ text: textPayload }),
                    contextInfo: getContext(m.sender, getImg(bot)),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [{
                            name: "single_select",
                            buttonParamsJson: buttonParamsJson
                        }]
                    })
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, menuMessage.message, { messageId: menuMessage.key.id });
    try { await conn.sendMessage(m.chat, { react: { text: '✨', key: m.key } }) } catch {}
};

// الاستماع لضغطات الأزرار وعرض الأوامر تلقائياً
menu.before = async (m, { conn, bot }) => {
    if (!m.text || !m.text.startsWith('meromenu_')) return false;

    const cmds = await bot.getAllCommands();
    const cats = {};
    cmds.forEach(c => {
        if (!c.usage?.length) return;
        const cat = c.category || 'other';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(c);
    });

    // 1. لو تم الضغط على زر القناة
    if (m.text === 'meromenu_extra_channel') {
        await m.reply(`📌 تفضل يا حب رابط قناتنا الرسمية تابعنا هنا:\nhttps://whatsapp.com/channel/0029Vb8Q2Q56WaKx5Qk8QM2y`);
        return true;
    }

    // 2. لو تم الضغط على زر مراسلة المطور
    if (m.text === 'meromenu_extra_owner') {
        await m.reply(`👑 للتواصل مع مطور البوت [ ميرو ] مباشرة:\nwa.me/201017631165`); // ضع رقمك هنا يا حب
        return true;
    }

    // 3. معالجة فتح قسم الأوامر المختار
    const catKey = m.text.replace('meromenu_cat_', '');
    const cat = getCatByKey(catKey);
    
    if (!cat) return false;

    const selectedCmds = cats[catKey];
    if (!selectedCmds?.length) {
        await m.reply('❌ *عذراً، هذا القسم فارغ حالياً!*');
        return true;
    }

    let cmdsList = '';
    selectedCmds.forEach(c => {
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
        contextInfo: getContext(m.sender, getImg(bot))
    }, { quoted: m });

    return true;
};

menu.command = ['اوامر', 'القائمة', 'menu'];
export default menu;
    
