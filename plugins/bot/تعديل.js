/*▲ حـقـوق الـتـطـويـر ▲
 * 👤 المطور: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
 * 🤖 البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: محرر الصور بالذكاء الاصطناعي
 */

import axios from 'axios';
import crypto from 'crypto';
import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys'

// ─── AIRich مبسط ───────────────────────────────────────────
class AIRich {
   #client
   constructor(client) {
      if (!client) throw new Error('Socket is required')
      this.#client = client
      this._title = '🤖 ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌'
      this._submessages = []
      this._sections = []
      this._richResponseSources = []
   }
   static newLayout(name, data) {
      return { view_model: { [Array.isArray(data) ? 'primitives' : 'primitive']: data, __typename: `GenAI${name}LayoutViewModel` } }
   }
   addImage(imageUrl) {
      const urls = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
      const imageUrls = urls.map(url => ({ imagePreviewUrl: url, imageHighResUrl: url, sourceUrl: 'https://fiora.nixel.my.id/' }))
      this._submessages.push({ messageType: 1, gridImageMetadata: { gridImageUrl: { imagePreviewUrl: urls[0] }, imageUrls } })
      imageUrls.forEach(({ imagePreviewUrl }) => {
         this._sections.push(AIRich.newLayout('Single', { media: { url: imagePreviewUrl, mime_type: 'image/png' }, imagine_type: 'IMAGE', status: { status: 'READY' }, __typename: 'GenAIImaginePrimitive' }))
      })
      return this
   }
   addText(text) {
      this._submessages.push({ messageType: 2, messageText: text })
      this._sections.push(AIRich.newLayout('Single', { text, __typename: 'GenAIMarkdownTextUXPrimitive' }))
      return this
   }
   build(jid, { quoted } = {}) {
      const qObj = quoted ? { stanzaId: quoted?.key?.id || quoted?.id, participant: quoted?.key?.participant || quoted?.key?.remoteJid, quotedType: 0, quotedMessage: quoted.message ?? quoted } : {}
      const message = {
         messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: { messageDisclaimerText: this._title, richResponseSourcesMetadata: { sources: this._richResponseSources } } },
         botForwardedMessage: { message: { richResponseMessage: { messageType: 1, submessages: this._submessages, unifiedResponse: { data: Buffer.from(JSON.stringify({ response_id: crypto.randomUUID(), sections: this._sections })).toString('base64') }, contextInfo: { ...qObj } } } }
      }
      return generateWAMessageFromContent(jid, message, { messageId: generateMessageIDV2() })
   }
   async send(jid, options = {}) {
      const msg = await this.build(jid, options)
      return this.#client.relayMessage(jid, msg.message, { messageId: msg.key.id, ...options })
   }
}

// ─── Handler ────────────────────────────────────────────────

const handler = async (m, { conn, text, usedPrefix, command }) => {

  // ── الدليل ────────────────────────────────────────────────────────────
  if (!text?.trim() && !m.quoted) {
    return m.reply(
`*◜⏤͟͞⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌◞*
*⎔⋅• ━ ╼╃⎔╷🎨╵⎔╄╾ ━ •⋅⎔*

*𖤐┆مــحــرر الــصــور بــالــذكــاء اݪاصــطــنــاعــي*

*⎔⋅• ━ ╼╃⎔╷كــيــفــيــة اݪاســتــخــدام╵⎔╄╾ ━ •⋅⎔*
*𖤐┆* رد على صورة واكتب الامر
*𖤐┆* الـصـيـغـة: ${usedPrefix}${command} <الوصف>

*⎔⋅• ━ ╼╃⎔╷امــثــلــة╵⎔╄╾ ━ •⋅⎔*
*𖤐┆* ${usedPrefix}${command} ضع له قبعة
*𖤐┆* ${usedPrefix}${command} غير الخلفية لغابة
*𖤐┆* ${usedPrefix}${command} حولها لانمي

*⎔⋅• ━ ╼╃⎔╷مــلــاحــظــة╵⎔╄╾ ━ •⋅⎔*
*𖤐┆* يجب الرد على صورة بصيغة jpg او png او webp

*⎔⋅• ━ ╼╃⎔╷🎨╵⎔╄╾ ━ •⋅⎔*`
    );
  }

  // ── التحقق ─────────────────────────────────────────────────────────
  const prompt = text?.trim();
  if (!prompt) throw '*❌ يرجى كتابة وصف التعديل المطلوب*\n*مثال:* ضع له قبعة';

  const quoted = m.quoted ? m.quoted : m;
  const mime = (quoted.msg || quoted).mimetype || '';
  if (!mime.startsWith('image/')) throw '*❌ يجب الرد على رسالة صورة*';

  await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } });
  await m.reply(`*◜⏤͟͞⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌◞*
*⎔⋅• ━ ╼╃⎔╷⏳╵⎔╄╾ ━ •⋅⎔*

*𖤐┆جــار مــعــالــجــة صــورتــك بــالــذكــاء اݪاصــطــنــاعــي*

*𖤐┆اݪوصــف:* ${prompt}
*𖤐┆اݪحــالــة:* جاري التعديل... الرجاء الانتظار

*⎔⋅• ━ ╼╃⎔╷⏳╵⎔╄╾ ━ •⋅⎔*`);

  // ── تحميل الصورة ─────────────────────────────────────────────
  const mediaBuffer = await quoted.download();
  const base64Image = `data:image/webp;base64,${mediaBuffer.toString('base64')}`;

  // ── ارسال للـ API ────────────────────────────────────────────────
  const payload = {
    prompt,
    input_image: base64Image,
    input_image_mime_type: 'image/webp',
    input_image_extension: 'webp',
    width: 576,
    height: 1024,
    mode: 'standard',
    client_request_id: crypto.randomUUID(),
  };

  const response = await axios.post('https://raphael.app/api/ai-image-editor', payload, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/plain; charset=utf-8', 'User-Agent': 'Mozilla/5.0' },
    responseType: 'text',
  });

  const lines = response.data.trim().split('\n');
  const lastLine = JSON.parse(lines[lines.length - 1]);
  if (lastLine.status !== 'complete') throw '*❌ فشل التعديل او الصورة عالقة في الطابور. جرب مرة اخرى*';

  const resultUrl = `https://raphael.app${lastLine.data.url}`;
  const imgBuffer = await axios.get(resultUrl, { responseType: 'arraybuffer' });
  const finalBase64 = `data:image/png;base64,${Buffer.from(imgBuffer.data).toString('base64')}`;

  // ── ارسال النتيجة بطريقة AIRich + نص كبير فوق ───────────────────────
  await new AIRich(conn)
     .addText(`# ✨ تــم تــعــديــل اݪــصــورة بــنــجــاح\n*𖤐┆اݪوصــف:* ${prompt}`)
     .addImage(finalBase64)
     .send(m.chat, { quoted: m })

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

};

handler.help = ['تعديل <الوصف>'];
handler.tags = ['ai'];
handler.command = /^(تعديل|aiedit)$/i;

export default handler;