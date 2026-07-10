/* ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
   المطور الرئيسي: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
   أمر: .allmenu (القائمة الذكية التلقائية لجميع ملفات السورس)
*/

import fs from 'fs';
import { performance } from 'perf_hooks';

// دالة تحويل وقت التشغيل لشكل منسق
function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms % 3600000 / 60000);
    let s = Math.floor(ms % 60000 / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, usedPrefix }) => {
    await conn.sendMessage(m.chat, { react: { text: '📜', key: m.key } });

    let old = performance.now();
    let neww = performance.now();
    let speed = (neww - old).toFixed(4);

    let d = new Date(new Date() + 3600000);
    let locale = 'ar';
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);

    const totalUsers = Object.keys(global.db?.data?.users || {}).length || 'غير متوفر';

    // 🛡️ التقفيل الهندسي: قراءة الأوامر والـ Tags تلقائياً من الذاكرة
    let help = Object.values(global.plugins).filter(p => p.help && !p.disabled);
    
    // تجميع التصنيفات بشكل فريد وتصفيتها
    let groups = {};
    for (let plugin of help) {
        if (plugin.tags && Array.isArray(plugin.tags)) {
            for (let tag of plugin.tags) {
                if (!tag) continue;
                if (!groups[tag]) groups[tag] = [];
                // إضافة الأوامر المنتمية لهذا الـ Tag
                if (Array.isArray(plugin.help)) {
                    groups[tag].push(...plugin.help);
                } else {
                    groups[tag].push(plugin.help);
                }
            }
        }
    }

    // ✨ بناء واجهة النص الملوكية المنسقة
    let menuText = `＊* • ̩̩͙✩ • ̩̩͙ * ˚ ❄️ 𝑺𝑶𝑵𝑰𝑪 ❄️ * • ̩̩͙✩ • ̩̩͙ * ˚ ＊\n`;
    menuText += `> *﹝ 🌀 القائمة الـشـامـلـة لـلـنـظـام 🌀 ﹞*\n`;
    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• ❄️ ••••••••••• ̩̩͙⊰ • * ⭑\n\n`;
    
    menuText += `*🏮 •﹝ إحـصـائـيـات الـسـيـسـتـم ༉ ﹞*\n`;
    menuText += `*❄️ الـسـرعـة:* ${speed} 𝚠𝚜\n`;
    menuText += `*❄️ الـتـشـغيل:* ${uptime}\n`;
    menuText += `*❄️ الـمـسـتـخـدمـيـن:* ${totalUsers} 👥\n`;
    menuText += `*❄️ الـتـاريـخ:* ${date} | ${time} ⏳\n\n`;
    
    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• 💠 ••••••••••• ̩̩͙⊰ • * ⭑\n\n`;

    // 🔄 حلقة تكرار ذكية لاستعراض التصنيفات والأوامر تلقائياً مهما كان عددها
    // ترتيب الأقسام أبجدياً لراحة العين
    const sortedTags = Object.keys(groups).sort();
    
    for (let tag of sortedTags) {
        // إزالة التكرار من الأوامر داخل نفس القسم وتصفيتها
        let uniqueCommands = [...new Set(groups[tag])];
        
        menuText += `*📂 ❬ قـسـم: ${tag.toUpperCase()} ❭ ▢*\n`;
        menuText += `┌──────────────────────────────┐\n`;
        for (let cmd of uniqueCommands) {
            menuText += `│  ⚡ ${usedPrefix}${cmd}\n`;
        }
        menuText += `└──────────────────────────────┘\n\n`;
    }

    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• ❄️ ••••••••••• ̩̩͙⊰ • * ⭑\n`;
    menuText += `> *👤 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ*\n`;
    menuText += `＊* • ̩̩͙✩ • ̩̩͙ * ˚ 👑 𝚂𝙾𝙽𝙸𝙲 𝚂𝚈𝚂𝚃𝙴𝙼 👑 * • ̩̩͙✩ • ̩̩͙ * ˚ ＊`;

    // قراءة الصورة المعتمدة للسورس أو جلب الاحتياطية
    let imageBuffer;
    try {
        imageBuffer = fs.readFileSync('./src/downloads.jpg');
    } catch (e) {
        imageBuffer = { url: 'https://files.catbox.moe/fg61lg.jpg' };
    }

    // إرسال كارد القائمة الشاملة بالصورة والمنشن
    await conn.sendMessage(m.chat, {
        image: imageBuffer,
        caption: menuText,
        mentions: [m.sender]
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

// تشغيل الأمر عند كتابة .allmenu أو .القائمة-الكاملة
handler.command = /^(allmenu|القائمة-الكاملة|كل-الأوامر)$/i;

export default handler;