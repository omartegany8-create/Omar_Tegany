/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور: SONIC EL GHADAR (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.2
 * 📝 الوظيفة: استخراج الـ Proto وعرضه في واجهة ميتـا مع محاكاته فوراً
 */

import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys';
import crypto from 'crypto';

// ─── مـحـرك واجـهـة مـيـتـا الـذكـيـة الـمُـدَعَّـم ─────────────────────────────────
class AIRich {
   #client
   constructor(client) {
      this.#client = client;
      this._title = '';
      this._footer = '';
      this._sections = [];
      this._submessages = [];
   }
   setTitle(t) { this._title = t; return this }
   setFooter(t) { this._footer = t; return this }
   addText(text) {
      this._submessages.push({ messageType: 2, messageText: text })
      this._sections.push({ view_model: { primitive: { text, __typename: 'GenAIMarkdownTextUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' }})
      return this
   }
   addCode(language, code) {
      const lines = code.split('\n');
      const tokens = lines.map(line => ({ content: line + '\n', type: 'DEFAULT' }));
      this._submessages.push({ messageType: 5, codeMetadata: { codeLanguage: language, codeBlocks: [] } })
      this._sections.push({ view_model: { primitive: { language, code_blocks: tokens, __typename: 'GenAICodeUXPrimitive' }, __typename: 'GenAISingleLayoutViewModel' }})
      return this
   }
   async send(jid, quoted) {
      const sections = this._footer ? [...this._sections, { view_model: { primitive: { text: this._footer, __typename: 'GenAIMetadataTextPrimitive' }, __typename: 'GenAISingleLayoutViewModel' }}] : [...this._sections];
      const message = {
         messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: this._title, richResponseSourcesMetadata: { sources: [] } } },
         botForwardedMessage: { message: { richResponseMessage: { messageType: 1, submessages: this._submessages, unifiedResponse: { data: Buffer.from(JSON.stringify({ response_id: crypto.randomUUID(), sections })).toString('base64') }, contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '0@bot' }, forwardOrigin: 4, stanzaId: quoted?.key?.id, participant: quoted?.key?.participant || quoted?.key?.remoteJid, quotedMessage: quoted?.message } } } }
      }
      const msg = generateWAMessageFromContent(jid, message, { messageId: generateMessageIDV2() });
      return this.#client.relayMessage(jid, msg.message, { messageId: msg.key.id });
   }
}

// ─── الـهـنـدلـر الـرئـيـسـي ────────────────────────────────────────────────
let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) {
        return m.reply(`*⚠️ يرجى الرد على الرسالة التي تريد عمل Dump ومحاكاة لها باستخدام الاختصار:* \n\n*مثال:* قم بالرد على الرسالة واكتب \`${usedPrefix}${command}\``);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // جلب الرسالة المقتبسة من جميع المسارات المحتملة
        let quotedMessage = m.quoted.message || 
                            (m.quoted.vM && m.quoted.vM.message) || 
                            m.quoted.msg;

        if (!quotedMessage) {
            let remoteMsg = await conn.loadMessage(m.chat, m.quoted.id);
            if (remoteMsg && remoteMsg.message) quotedMessage = remoteMsg.message;
        }

        if (!quotedMessage) {
            throw new Error('فشل الوصول إلى كائن الـ protobuf من كاش الهندلر أو السيرفر.');
        }

        // تحويل محتوى الـ protobuf إلى نص JSON منسق
        const protoTarget = JSON.stringify(quotedMessage, null, 4);

        // بناء كود الـ eval التنفيذي
        const evalCode = `// كود إرسال الرسالة المنسوخة عبر الـ eval المستخلص من SonicBot-MD
const { generateWAMessageFromContent, generateMessageIDV2 } = (await import('@whiskeysockets/baileys')).default;

const messageId = generateMessageIDV2();
const quotedMessage = ${protoTarget};

const msg = generateWAMessageFromContent(m.chat, quotedMessage, {
    messageId: messageId,
    userJid: conn.user.jid
});

await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });`;

        // 🛡️ [الخطوة الأولى]: تشغيل وتطبيق الكود فوراً وإرسال نفس الرسالة في نفس اللحظة
        const liveMessageId = generateMessageIDV2();
        const liveMsg = generateWAMessageFromContent(m.chat, quotedMessage, {
            messageId: liveMessageId,
            userJid: conn.user.jid
        });
        await conn.relayMessage(m.chat, liveMsg.message, { messageId: liveMsg.key.id });

        // ✨ [الخطوة الثانية]: إرسال واجهة الميتـا الاحترافية التي تحتوي على كود الـ eval الجاهز
        let metaRender = new AIRich(conn)
            .setTitle(`✨ ───〔 𝐒𝐎𝐍𝐈𝐂 𝐏𝐑𝐎𝐓𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 〕─── ✨`)
            .setFooter(`🎯 الـمُـطَـوِّر: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ | https://sonicdev.vercel.app/`)
            .addText(`# 📦 تم استخراج هيكل الرسالة ومحاكاتها فوراً!\n\n📋 يمكنك نسخ الكود البرمجي المنسق أدناه واستخدامه في أوامر الـ \`eval\` الخاصة بك لإعادة إنتاج الرسالة في أي وقت محمي من التلف:`)
            .addCode('javascript', evalCode);

        await metaRender.send(m.chat, m);
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('خطأ في أمر Dump Proto & Live Render:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`*❌ فشل استخراج أو محاكاة بروتو الرسالة:*\n\`${e.message || e}\``);
    }
}

handler.help = ['--<']
handler.tags = ['المطور 💻']
handler.command = ['--<', 'dump_proto', 'proto']
handler.owner = true 

export default handler;