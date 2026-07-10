/**
 * 📂 menu.js - واجهة الأوامر والقائمة الرئيسية الملوكية التلقائية للبوت
 * 👤 الأوامر : اوامر / الاوامر / menu / القائمة / قائمة
 * 👨🏻‍💻 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
 * 🎯 الـبُـوت: ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 */

import pkg from '@whiskeysockets/baileys'
const { prepareWAMessageMedia } = pkg
import { xpRange } from '../lib/levelling.js'
import { performance } from 'perf_hooks'

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms % 3600000 / 60000);
    let s = Math.floor(ms % 60000 / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

let handler = async (m, { conn, usedPrefix: _p, text }) => {
  try {
    let plugins = Object.values(global.plugins).filter(p => !p.disabled)
    let matchedTag = text ? text.trim().toLowerCase() : ''

    // 1. فحص ما إذا كان المستخدم يطلب قسماً معيناً (جلب الأوامر من handler.command تلقائياً)
    if (matchedTag) {
        let categoryCommands = plugins.filter(p => p.tags && p.tags.map(t => t.toLowerCase()).includes(matchedTag))
        if (categoryCommands.length > 0) {
            let sectionText = `＊* • ̩̩͙✩ • ̩̩͙ * ˚ ❄️ 𝑺𝑶𝑵𝑰𝑪 ❄️ * • ̩̩͙✩ • ̩̩͙ * ˚ ＊\n`
            sectionText += `> 📂 *قـسـم: [ ${text.toUpperCase()} ]*\n`
            sectionText += `⭑ * • ̩̩͙⊱ •••••••••••••••••••••••••• ⊱ • * ⭑\n\n`
            
            categoryCommands.forEach(p => {
                if (p.command) {
                    // تحويل الأوامر إلى مصفوفة للتعامل معها بشكل موحد
                    let cmdList = Array.isArray(p.command) ? p.command : [p.command]
                    
                    cmdList.forEach(cmd => {
                        if (cmd) {
                            let cleanCmd = cmd
                            // إذا كان الأمر عبارة عن RegExp (تعبير نمطي)، نقوم بتنظيفه وتحويله لنص مقروء
                            if (cmd instanceof RegExp) {
                                cleanCmd = cmd.source
                                    .replace(/^\^/, '')   // إزالة علامة البداية ^
                                    .replace(/\$$/, '')   // إزالة علامة النهاية $
                                    .replace(/\|/g, ' / ') // استبدال الفواصل بين الأوامر بـ /
                                    .replace(/\\/g, '')   // إزالة الشرطات المائلة العكسية
                            }
                            sectionText += `⚡ \`${_p + cleanCmd}\`\n`
                        }
                    })
                }
            })
            sectionText += `\n⭑ * • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 ❄️ 👑 𝐒𝐘𝐒𝐓𝐄𝐌 ✩• ̩̩͙ *˚`
            return await conn.sendMessage(m.chat, { text: sectionText }, { quoted: m })
        }
    }

    // 2. الحسابات الإحصائية والوقت والسيرفر
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    let d = new Date(new Date() + 3600000);
    let locale = 'ar';
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let dayName = d.toLocaleDateString(locale, { weekday: 'long' });
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);

    let user = global.db.data.users[m.sender] || {};
    let creatorNum = '212698078610'; 
    let isCreator = m.sender.includes(creatorNum);

    let { exp = 0, level = 0, role = 'مواطن 👨🏻‍💼', limit = 0 } = user;
    let { min, max } = xpRange(level, global.multiplier);
    const totalUsers = Object.keys(global.db?.data?.users || {}).length || 'غير متوفر'
    
    let displayLevel = isCreator ? '♾️ [ MAX ]' : level;
    let displayExp = isCreator ? '∞ / ∞' : `${exp} / ${max}`;
    let displayRole = isCreator ? '👑 حـاكـم الـنـظـام' : role;
    let progress = isCreator ? 100 : Math.min(100, Math.max(0, ((exp - min) / (max - min) * 100))).toFixed(0);

    const editVideo = 'https://files.catbox.moe/ajhucr.mp4'
    const channelLink = "https://whatsapp.com/channel/0029VbC9jBa7oQhlrjUPKa33"
    const channelId = "120363407317665766@newsletter"

    // 3. استخراج الأقسام (Tags) تلقائياً من الملفات وديناميكياً
    let tags = {}
    plugins.forEach(p => {
        if (p.tags && Array.isArray(p.tags)) {
            p.tags.forEach(tag => {
                if (tag) tags[tag.toLowerCase()] = tag
            })
        }
    })

    // تحويل الأقسام المكتشفة إلى أسطر (Rows) لزر الاختيار تلقائياً
    let rows = Object.keys(tags).sort().map((tag, index) => {
        return {
            header: `⚜️ الـقـسـم ${index + 1}`,
            title: `📁┊「 قـسـم_${tags[tag].toUpperCase()} 」`,
            id: `${_p}menu ${tag}` // يرسل التاج كمعطى للأمر للتعرف عليه عند الضغط تلقائياً
        }
    })

    // ✨ بناء نص القائمة بزخارف الكود الأول المتناسقة
    let menuText = `＊* • ̩̩͙✩ • ̩̩͙ * ˚ ❄️ 𝑺𝑶𝑵𝑰𝑪 ❄️ * • ̩̩͙✩ • ̩̩͙ * ˚ ＊\n`
    menuText += `> *﹝ 🌀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝑺𝑶𝑵𝑰𝑪 🌀 ﹞*\n`
    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• ❄️ ••••••••••• ̩̩͙⊰ • * ⭑\n\n`
    
    menuText += `*🌌 •﹝ مـعـلـومـات الـمـسـتـخـدم ༉ ﹞*\n`
    menuText += `*💠 الـمـسـتـخدم:* @${m.sender.split('@')[0]}\n`
    menuText += `*💠 الـرُتـبـة:* ${displayRole}\n`
    menuText += `*💠 الـمـسـتـوى:* ${displayLevel} 🪐\n`
    menuText += `*💠 الـنـقـاط:* ${displayExp} (${progress}%) 🌪️\n`
    menuText += `*💠 الـرصـيـد:* 〘${isCreator ? '∞' : limit} drain💎\n\n`
    
    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• 💠 ••••••••••• ̩̩͙⊰ • * ⭑\n\n`
    
    menuText += `*🏮 •﹝ إحـصـائـيـات الـنـظـام ༉ ﹞*\n`
    menuText += `*❄️ الـبـوت:* ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌\n`
    menuText += `*❄️ الـمـطـور:* 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ 👑\n`
    menuText += `*❄️ الـسـرعـة:* ${speed} 𝚠𝚜 🔱\n`
    menuText += `*❄️ الـتـشـغيل:* ${uptime}\n`
    menuText += `*❄️ الـمـسـتـخـدمـيـن:* ${totalUsers} 👥\n`
    menuText += `*❄️ الـتـاريـخ:* ${dayName}، ${date}\n`
    menuText += `*❄️ الـوقـت:* ${time} ⏳\n\n`
    
    menuText += `⭑ * • ̩̩͙⊱ ••••••••••• ❄️ ••••••••••• ̩̩͙⊰ • * ⭑\n`
    menuText += `> *﹝ 👑 𝑺𝑶𝑵𝑰𝑪 👑 ﹞*\n`
    menuText += `＊* • ̩̩͙✩ • ̩̩͙ * ˚ ❄️ 𝑺𝑶𝑵𝑰𝑪 ❄️ * • ̩̩͙✩ • ̩̩͙ * ˚ ＊`

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    const nativeFlowPayload = {
      body: { text: menuText },
      footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 ❄️ 👑 👑 𝐒𝐘𝐒𝐓𝐄𝐌 ✩• ̩̩͙ *˚' },
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: channelId,
          newsletterName: "⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌",
          serverMessageId: 150
        }
      },
      nativeFlowMessage: {
        buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📜 『 🌻 قائمة الأوامر التلقائية 🌻 』',
            sections: [
              {
                title: 'اختر وجهتك في عالمي 🪐',
                highlight_label: '❄️ 𝑺𝑶𝑵𝑰𝑪 𝐒𝐘𝐒𝐓𝐄𝐌 ༉',
                rows: rows
              }
            ]
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ 
            display_text: '⭐ قـيّم جـدارتـي', 
            id: '.تقييم' 
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '📢 تـابـع الـتـحـديـثـات',
            url: channelLink
          })
        }
        ]
      }
    }

    // 🎞️ معالجة الفيديو كـ هيدر تفاعلي متحرك تلقائياً
    try {
      const media = await prepareWAMessageMedia(
        { video: { url: editVideo }, gifPlayback: true }, 
        { upload: conn.waUploadToServer }
      )
      nativeFlowPayload.header = {
        hasMediaAttachment: true,
        subtitle: '𝚂𝙾𝙽𝙸𝙲 𝙱𝙾🇹 ❄️',
        videoMessage: media.videoMessage
      }
    } catch (e) {
      nativeFlowPayload.header = { hasMediaAttachment: false }
    }

    const generateMsg = conn.generateWAMessageFromContent || 
                        (await import('@whiskeysockets/baileys')).default?.generateWAMessageFromContent || 
                        (await import('@whiskeysockets/baileys')).generateWAMessageFromContent;

    if (typeof generateMsg !== 'function') {
       return await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
    }

    const msg = await generateMsg(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
             ...nativeFlowPayload
          }
        }
      }
    }, { 
      userJid: conn.user.id, 
      quoted: m
    })
    
    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('خطأ في الـ Menu:', e)
    await conn.sendMessage(m.chat, {
      text: '⚠️ حدث خطأ فني أثناء تحميل واجهة الأوامر التفاعلية لبوت سونيك.'
    }, { quoted: m })
  }
}

handler.command = ['اوامر', 'الاوامر', 'menu', 'القائمة', 'قائمه', 'قائمة'];

export default handler;