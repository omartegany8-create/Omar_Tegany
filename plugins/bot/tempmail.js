// plugins/tempmail.js
/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: أمر البريد المؤقت (TempMail) بالأزرار التفاعلية
 */

import axios from 'axios';
import crypto from 'crypto';

// تخزين الجلسات لكل شات
global.tempMailSessions = global.tempMailSessions || {};

class TempMail {
    constructor() {
        this.baseApi = 'https://api.temp-mail.io';
        this.domains = [];
        this.email = null;
        this.prefix = null;
        this.knownMessages = new Set();
    }

    async _fetchDomains() {
        try {
            const { data } = await axios.get(`${this.baseApi}/request/domains/format/json`, { timeout: 10000 });
            if (Array.isArray(data) && data.length) {
                this.domains = data;
                return;
            }
            throw new Error('قائمة النطاقات غير صالحة');
        } catch (e) {
            console.warn('⚠️ فشل جلب النطاقات، استخدام الاحتياطي:', e.message);
            this.domains = ['temp-mail.io', 'mail.tm', 'temp-mail.org'];
        }
    }

    async generateEmail(prefix = null) {
        await this._fetchDomains();
        if (!prefix) {
            prefix = crypto.randomBytes(6).toString('hex'); // 12 حرف عشوائي
        }
        const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
        this.email = `${prefix}@${domain}`;
        this.prefix = prefix;
        this.knownMessages.clear();
        return this.email;
    }

    async getMessages() {
        if (!this.email) throw new Error('لم يتم إنشاء بريد بعد.');
        const encoded = this.email.replace('@', '%40');
        try {
            const { data } = await axios.get(`${this.baseApi}/request/mail/id/${encoded}/format/json`, { timeout: 10000 });
            return data;
        } catch (e) {
            console.warn('⚠️ فشل جلب الرسائل:', e.message);
            return [];
        }
    }

    async waitForNewMessages(checkInterval = 5, maxChecks = 12, onNewMessage = null) {
        if (!this.email) throw new Error('لا يوجد بريد نشط.');
        let attempts = 0;
        let newMessages = [];
        while (attempts < maxChecks) {
            const msgs = await this.getMessages();
            const newMsgs = msgs.filter(msg => !this.knownMessages.has(msg.id));
            if (newMsgs.length) {
                for (const msg of newMsgs) {
                    this.knownMessages.add(msg.id);
                    if (onNewMessage) await onNewMessage(msg);
                }
                newMessages.push(...newMsgs);
                return newMessages;
            }
            attempts++;
            await this.sleep(checkInterval * 1000);
        }
        return newMessages;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    formatMessage(msg) {
        const from = msg.from || 'غير معروف';
        const subject = msg.subject || 'بدون موضوع';
        const body = msg.body_text || 'لا يوجد نص';
        return `📩 *رسالة جديدة*\n👤 *من:* ${from}\n📌 *الموضوع:* ${subject}\n📝 *النص:* ${body.substring(0, 300)}${body.length > 300 ? '...' : ''}`;
    }

    formatMessagesList(messages) {
        if (!messages || !messages.length) return '📭 لا توجد رسائل حالياً في الصندوق.';
        let text = `📬 *عدد الرسائل المستلمة:* ${messages.length}\n\n`;
        messages.forEach((msg, i) => {
            text += `${i+1}️⃣ *من:* ${msg.from || 'غير معروف'}\n📌 *الموضوع:* ${msg.subject || 'بدون موضوع'}\n------------------------\n`;
        });
        return text;
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;
    if (!global.tempMailSessions[chatId]) {
        global.tempMailSessions[chatId] = new TempMail();
    }
    const session = global.tempMailSessions[chatId];

    // إعداد الميتا داتا والتوثيق
    const botJid = conn.user?.id?.includes(':') ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : conn.user?.id;
    const botMeta = {
        isForwarded: true,
        forwardingScore: 999,
        forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
        forwardOrigin: 4
    };

    // جلب دالة إنشاء الرسائل التفاعلية ديناميكياً
    const generateMsg = conn.generateWAMessageFromContent || 
                       (await import('@whiskeysockets/baileys')).default?.generateWAMessageFromContent || 
                       (await import('@whiskeysockets/baileys')).generateWAMessageFromContent;

    // دالة إرسال الأزرار المشتركة
    const sendButtons = async (bodyText, buttons = []) => {
        if (typeof generateMsg !== 'function') return m.reply(bodyText);
        
        const msg = await generateMsg(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: bodyText },
                        footer: { text: '＊* • ̩̩͙✩ 𝚂𝙾𝙽𝙸𝙲 𝙰𝙸 𝚃𝙴𝙼𝙿𝙼𝙰𝙸𝙻 ✩• ̩̩͙ *˚' },
                        contextInfo: botMeta,
                        nativeFlowMessage: {
                            buttons: buttons
                        }
                    }
                }
            }
        }, { userJid: botJid, quoted: m });

        return conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    };

    // تحليل الأمر الفرعي
    const args = text.trim().split(/\s+/);
    const sub = args[0] ? args[0].toLowerCase() : '';

    // 1. إنشاء بريد جديد
    if (sub === 'جديد' || sub === 'create') {
        const prefix = args[1] || null;
        try {
            const email = await session.generateEmail(prefix);
            const body = `✅ *تَمَّ إِنْشَاءُ بَرِيدٍ مُؤَقَّتٍ بِنَجَاحْ!* ⚡\n\n📧 البريد الحالي:\n\`${email}\`\n\n🤖 المطور: ${global.author || '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉'}`;
            
            const buttons = [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '📬 عرض الرسائل', id: `${usedPrefix + command} رسائل` })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '⏳ بدء المراقبة التلقائية', id: `${usedPrefix + command} انتظار` })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🗑️ حذف البريد', id: `${usedPrefix + command} حذف` })
                }
            ];
            
            return sendButtons(body, buttons);
        } catch (e) {
            return m.reply(`❌ فشل إنشاء البريد: ${e.message}`);
        }
    }

    // 2. جلب وعرض الرسائل المستلمة
    if (sub === 'رسائل' || sub === 'messages' || sub === 'msg') {
        if (!session.email) {
            return m.reply(`⚠️ لا يوجد بريد نشط في هذه المحادثة حالياً.\nإضغط على الزر أدناه لإنشاء واحد.`);
        }
        try {
            const msgs = await session.getMessages();
            const bodyList = `📧 البريد الحالي: \`${session.email}\`\n\n${session.formatMessagesList(msgs)}`;
            
            const buttons = [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🔄 تحديث صندوق الوارد', id: `${usedPrefix + command} رسائل` })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🗑️ حذف البريد', id: `${usedPrefix + command} حذف` })
                }
            ];
            
            return sendButtons(bodyList, buttons);
        } catch (e) {
            return m.reply(`❌ فشل جلب الرسائل: ${e.message}`);
        }
    }

    // 3. مراقبة وانتظار وصول رسائل جديدة (لوبر)
    if (sub === 'انتظار' || sub === 'wait') {
        if (!session.email) {
            return m.reply('⚠️ لا يوجد بريد نشط. أنشئ بريداً أولاً.');
        }
        const interval = parseInt(args[1]) || 5;
        const maxChecks = parseInt(args[2]) || 12;

        await m.reply(`⏳ جاري مراقبة البريد \`${session.email}\` ...\nسيتم التحقق كل ${interval} ثوانٍ تلقائياً.`);
        
        try {
            let newMsgs = await session.waitForNewMessages(interval, maxChecks, async (msg) => {
                await conn.sendMessage(chatId, { text: session.formatMessage(msg) });
            });
            
            if (newMsgs.length === 0) {
                const expiredBody = `⏱️ *انتهت فترة المراقبة التلقائية.*\n\nلم يتم استلام أي رسائل جديدة خلال هذه المدة لـ \`${session.email}\`.`;
                const buttons = [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({ display_text: '🔄 مراقبة مجدداً', id: `${usedPrefix + command} انتظار` })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({ display_text: '📬 فحص يدوي', id: `${usedPrefix + command} رسائل` })
                    }
                ];
                return sendButtons(expiredBody, buttons);
            } else {
                return m.reply(`✅ تم استلام ${newMsgs.length} رسالة جديدة بنجاح.`);
            }
        } catch (e) {
            return m.reply(`❌ خطأ أثناء المراقبة: ${e.message}`);
        }
    }

    // 4. حذف الجلسة والبريد الحالي
    if (sub === 'حذف' || sub === 'delete' || sub === 'end') {
        delete global.tempMailSessions[chatId];
        const deleteBody = '🗑️ *تَمَّ حَذْفُ جَلْسَةِ الـبَرِيدِ الـمُؤَقَّتِ بِنَجَاحْ!*';
        const buttons = [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '📧 إنشاء بريد جديد', id: `${usedPrefix + command} جديد` })
            }
        ];
        return sendButtons(deleteBody, buttons);
    }

    // القائمة الرئيسية الترحيبية بالأزرار (في حال كتابة الأمر الرئيسي فقط مثل .ايميل)
    const mainMenuText = `📬 *نِظَامُ الـبَرِيدِ الـمُؤَقَّتِ الـذَّكِي (TempMail)* ⚡\n\nمرحباً بك! يتيح لك هذا الأمر إنشاء بريد إلكتروني وهمي لاستقبال تفعيلات الحسابات والرسائل دون كشف بريدك الحقيقي.\n\n📧 البريد الحالي النشط: ${session.email ? `\`${session.email}\`` : '_لا يوجد بريد نشط حالياً_'}`;
    
    const mainButtons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: '✨ إنشاء بريد تلقائي', id: `${usedPrefix + command} جديد` })
        }
    ];

    if (session.email) {
        mainButtons.push(
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '📥 صندوق الرسائل', id: `${usedPrefix + command} رسائل` })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '🗑️ إلغاء البريد النشط', id: `${usedPrefix + command} حذف` })
            }
        );
    }

    return sendButtons(mainMenuText, mainButtons);
};

handler.help = ['ايميل', 'tempmail'];
handler.tags = ['أدوات'];
handler.command = ['ايميل', 'tempmail'];

export default handler;