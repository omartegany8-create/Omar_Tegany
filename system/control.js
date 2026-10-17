/* ════════════════════════════════════════════════════════════
   control.js — أحداث الجروبات + رسائل منع الأوامر (صلاحيات/كولداون)
   ════════════════════════════════════════════════════════════ */

const LOGO = 'https://files.catbox.moe/hm9iq4.jpg';
const ALERT_IMG = 'https://i.pinimg.com/originals/02/c3/51/02c351dfd4eb72a62f225ce964dc510d.jpg';

const num = (jid) => String(jid ?? '').split('@')[0].split(':')[0];

const group = async (ctx, event, eventType) => {
    try {
        if (!event?.participants) return null;

        const participants = event.participants.filter((p) => p?.phoneNumber).map((p) => p.phoneNumber);
        const author = event.author;

        const users = participants.length
            ? participants.map((p) => '@' + num(p)).join(' and ')
            : 'No users';
        const authorTag = author ? '@' + num(author) : 'Unknown';
        const by = authorTag === users ? '' : `\n𝐛𝐲 ${authorTag}`;

        const messages = {
            add: `♡゙ مـنـور/ه ${users}${by}`,
            remove: `${users} تم إزالته من الجروب${by}`,
            promote: `♡゙ مـبـروك الادمـن ${users}\nby ${authorTag}`,
            demote: `♡゙ بـقـيـت عـضـو خـلاص ${users}\nby ${authorTag}`
        };

        const txt = messages[eventType];
        if (!txt) return null;

        // لو الترحيب مقفول للجروب ده
        if (global.db?.groups?.[event.chat]?.noWelcome === true) return 9999;

        const withUserPic = ['remove', 'add'].includes(eventType);
        const name = ctx.config?.info?.nameBot || 'WhatsApp Bot';

        await ctx.sock.msgUrl(event.chat, txt, {
            img: withUserPic ? (event.userUrl || LOGO) : LOGO,
            title: name,
            body: '𝐴 𝑠𝑖𝑚𝑝𝑙𝑒 𝑊𝒉𝑎𝑡𝑠𝐴𝑝𝑝 𝑏𝑜𝑡 𝑓𝑜𝑟 𝑏𝑒𝑔𝑖𝑛𝑛𝑒𝑟𝑠, 𝑏𝑦 𝑴𝑬𝑹𝑶',
            mentions: author ? [author, ...participants] : participants,
            newsletter: {
                name: ctx.config?.info?.nameChannel || name,
                jid: ''
            },
            big: withUserPic
        });
    } catch (e) {
        console.error('❌ group event error:', e?.message || e);
    }
    return null;
};

const access = async (msg, checkType, time) => {
    const messages = {
        cooldown: `*♡⏳ استنى ${time || 'بعض كام ثانيه'} ثانية وكمل الأمر ⏳♡*\n⊱⋅ ──────────── ⋅⊰\n> *_لازم تصبر شويه عشان الأمر ده مينفعش فيه الاسبام_*`,
        owner: `*♡ 🇩🇪 الأمر ده لـ المطورين فقط 🇩🇪♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر ده لـ المطورين البوت لازم تكون مطور عشان تقدر تستخدمه_*`,
        rowner: `*♡ 👑 الأمر ده للمطور الأساسي فقط 👑♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر ده مقفول على صاحب البوت بس_*`,
        group: `*♡💠 الأمر ده بيشتغل بس ف الجروبات 💠♡*\n⊱⋅ ──────────── ⋅⊰\n> *_لازم الأمر ده تستخدمه ف جروب فقط ممنوع غير كده_*`,
        admin: `*♡📯 الأمر ده لـ الادمن فقط 📯♡*\n⊱⋅ ──────────── ⋅⊰\n> *_انت مجرد عضو لازم تبقي ادمن يا عضو يا عبد_*`,
        private: `*♡🏷️ الأمر ده في الخاص فقط 🏷️♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر ف الخاص بس ياحبيبي_*`,
        botAdmin: `*♡📌 لازم اكون ادمن عشان انقذ الأمر 📌♡*\n⊱⋅ ──────────── ⋅⊰\n> *_حطني ادمن عشان تقدر تستعمل الأمر ده_*`,
        noSub: `*♡🫒 الأمر ده ف البوت الأساسي فقط 🫒♡*\n⊱⋅ ──────────── ⋅⊰\n> *كلم المطور عشان تفعل البوت*`,
        disabled: `*♡🗃️ الامر متوقف (تحت صيانة) 🗃️♡*\n⊱⋅ ──────────── ⋅⊰\n> *_الامر تحت صيانه قريباً بيشتغل تاني_*`,
        error: `*♡❌ الأمر فيه خطأ، كلم المطورين ❌♡*\n⊱⋅ ──────────── ⋅⊰\n*_اكتب " .المطور " عشان يبعتلك رقم المطور_*`
    };

    const text = messages[checkType];
    if (!text) return null;            // نوع فحص مش معروف: سيب الأمر يكمل

    // من هنا الأمر ممنوع في كل الأحوال (حتى لو فشل إرسال الرسالة)
    try {
        const conn = await msg.client();
        if (conn) {
            const senderNum = num(msg.sender);
            const name = msg.pushName || senderNum;

            const quoted = {
                key: {
                    participant: `${senderNum}@s.whatsapp.net`,
                    remoteJid: 'status@broadcast',
                    fromMe: false
                },
                message: {
                    contactMessage: {
                        displayName: `${name}`,
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nitem1.TEL;waid=${senderNum}:${senderNum}\nEND:VCARD`
                    }
                },
                participant: '0@s.whatsapp.net'
            };

            await conn.msgUrl(msg.chat, text, {
                img: ALERT_IMG,
                title: '𝑴𝑬𝑹𝑶 𝑨𝑰',
                body: '𝐵𝑜𝑡 𝑎𝑙𝑒𝑟𝑡𝑠: 𝑅𝑒𝑎𝑑 𝑡𝒉𝑒 𝑚𝑒𝑠𝑠𝑎𝑔𝑒 𝑡𝑜 𝑙𝑒𝑎𝑟𝑛 𝑚𝑜𝑟𝑒',
                newsletter: {
                    name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
                    jid: ''
                },
                big: false
            }, quoted);
        }
    } catch (e) {
        console.error('❌ access message error:', e?.message || e);
    }
    return false;
};

export { access, group };
