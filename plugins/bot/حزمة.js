/* ⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌
   المطور الرئيسي: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ
   التحديث: دمج مع Meta System للرسائل الغنية
*/

import axios from 'axios';
import crypto from 'crypto';
import https from 'https';
import JSZip from 'jszip';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys';

// ─── AIRich Class (نسخة مدمجة) ──────────────────────────────────────────
class AIRich {
   #client
   constructor(client) {
      if (!client) throw new Error('Socket is required')
      this.#client = client
      this._title = '⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌'
      this._submessages = []
      this._sections = []
      this._richResponseSources = []
   }
   static newLayout(name, data) {
      return { view_model: { [Array.isArray(data) ? 'primitives' : 'primitive']: data, __typename: `GenAI${name}LayoutViewModel` } }
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

// ─── Pinterest Search ──────────────────────────────────────────────────────
const base = "https://www.pinterest.com";
const search = "/resource/BaseSearchResource/get/";

const headers = {
  accept: "application/json, text/javascript, */*, q=0.01",
  referer: "https://www.pinterest.com/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  "x-app-version": "a9522f",
  "x-pinterest-appstate": "active",
  "x-pinterest-pws-handler": "www/[username]/[slug].js",
  "x-requested-with": "XMLHttpRequest",
};

async function getCookies() {
  try {
    const response = await axios.get(base);
    const setHeaders = response.headers["set-cookie"];
    if (setHeaders) return setHeaders.map(v => v.split(";")[0]).join("; ");
    return null;
  } catch { return null; }
}

async function searchPinterest(query) {
  try {
    const cookies = await getCookies();
    if (!cookies) return { status: false, message: "فشل جلب الكوكيز." };

    const params = {
      source_url: `/search/pins/?q=${query}`,
      data: JSON.stringify({
        options: { isPrefetch: false, query, scope: "pins", bookmarks: [""], page_size: 50 },
        context: {},
      }),
      _: Date.now(),
    };

    const { data } = await axios.get(`${base}${search}`, {
      headers: { ...headers, cookie: cookies },
      params,
    });

    const results = data.resource_response.data.results.filter(v => v.images?.orig);
    if (!results.length) return { status: false, message: "لم يتم العثور على نتائج." };

    const filteredPins = [];
    for (let v of results) {
        const orig = v.images.orig;
        if (orig && orig.width && orig.height) {
            const ratio = orig.width / orig.height;
            if (ratio >= 0.7 && ratio <= 1.3) {
                filteredPins.push({ id: v.id, image: orig.url });
            }
        }
    }
    const finalPins = filteredPins.length ? filteredPins : results.map(v => ({ id: v.id, image: v.images.orig.url }));
    return { status: true, pins: finalPins };
  } catch (e) {
    return { status: false, message: "حدث خطأ في البحث." };
  }
}

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest(); }
function toB64Url(buffer) { return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }

async function makeTrayWebp(buffer) {
    const sharpMod = await import('sharp').catch(() => null);
    const sharp = sharpMod?.default;
    if (!sharp) throw new Error('مكتبة sharp غير متوفرة.');
    return await sharp(buffer, { animated: false }).resize(252, 252, { fit: 'cover' }).webp().toBuffer();
}

async function makeThumbnailJpeg(buffer) {
    const sharpMod = await import('sharp').catch(() => null);
    const sharp = sharpMod?.default;
    return await sharp(buffer).resize(252, 252, { fit: 'cover' }).jpeg().toBuffer();
}

async function uploadToServer(conn, buffer, { hkdf, mediaPath, mediaKey = crypto.randomBytes(32) }) {
    const expanded = Buffer.from(crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(32), Buffer.from(hkdf), 112));
    const iv = expanded.subarray(0, 16);
    const cipherKey = expanded.subarray(16, 48);
    const macKey = expanded.subarray(48, 80);

    const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    const mac = crypto.createHmac('sha256', macKey).update(iv).update(encrypted).digest().subarray(0, 10);
    const encBuffer = Buffer.concat([encrypted, mac]);
    const fileEncSha256 = sha256(encBuffer);

    const iq = await conn.query({
        tag: 'iq',
        attrs: { id: conn.generateMessageTag?.() ?? Date.now().toString(), to: 's.whatsapp.net', type: 'set', xmlns: 'w:m' },
        content: [{ tag: 'media_conn', attrs: {} }],
    });

    const mediaConn = iq.content?.find(v => v.tag === 'media_conn');
    if (!mediaConn) throw new Error('media_conn tidak ditemukan');

    const auth = mediaConn.attrs?.auth;
    const hosts = (mediaConn.content || []).filter(v => v.tag === 'host').map(v => v.attrs?.hostname).filter(Boolean);
    if (!hosts.length) throw new Error('host upload tidak ditemukan');

    const token = encodeURIComponent(fileEncSha256.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''));

    for (const host of hosts) {
        try {
            const json = await new Promise((resolve, reject) => {
                const url = new URL(`https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`);
                const req = https.request({
                    hostname: url.hostname,
                    port: 443,
                    path: url.pathname + url.search,
                    method: 'POST',
                    headers: {
                        Origin: 'https://web.whatsapp.com',
                        Referer: 'https://web.whatsapp.com/',
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': encBuffer.length,
                    },
                }, (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => {
                        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error('Upload failed'));
                        resolve(JSON.parse(body));
                    });
                });
                req.on('error', reject);
                req.write(encBuffer);
                req.end();
            });

            const directPath = json.direct_path ?? json.directPath ?? json.url ?? json.path;
            if (directPath) return { mediaKey, fileLength: buffer.length, fileSha256: sha256(buffer), fileEncSha256, directPath, ...json };
        } catch {}
    }
    throw new Error('جميع محاولات الرفع للسيرفر فشلت');
}

// ─── Handler ───────────────────────────────────────────────────────────────
let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return new AIRich(conn)
      .addText(`*📦 حزمة ملصقات من Pinterest*\n\n*⏤⏤⏤⏤⏤⏤⏤⏤⏤⏤⏤*\n*𖤐┆مثال:*\n\`${usedPrefix}${command} لوفي\`\n\n*𖤐┆سيتم استخراج 30 صورة مطابقة للفيلتر الذكي (المربعة والقريبة للمربع).*\n*⏤⏤⏤⏤⏤⏤⏤⏤⏤⏤⏤*`)
      .send(m.chat, { quoted: m });
  }

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

  let result = await searchPinterest(text);
  if (!result.status) {
    return new AIRich(conn)
      .addText(`❌ *فشل البحث:* ${result.message}`)
      .send(m.chat, { quoted: m });
  }

  let pins = result.pins.slice(0, 30);
  if (pins.length === 0) {
    return new AIRich(conn)
      .addText(`❌ *لم يتم العثور على صور صالحة مطابقة للفيلتر.*`)
      .send(m.chat, { quoted: m });
  }

  const packName = '⃟꙰⃢  𝚂𝙾𝙽𝙸𝙲➥𝙱ᝪᝨ ❯ |‌⃟🇲🇦‌|‌';
  const publisherName = '𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ';

  let stickersMetadata = [];
  const zip = new JSZip();

  for (let i = 0; i < pins.length; i++) {
      try {
          let imgRes = await axios.get(pins[i].image, { responseType: 'arraybuffer', timeout: 10000 });
          let originalBuffer = Buffer.from(imgRes.data);
          
          const sticker = new Sticker(originalBuffer, {
              pack: packName,
              author: publisherName,
              type: StickerTypes.FULL,
              categories: ['✨'],
              id: 'SONIC-BOT-' + i,
              quality: 70
          });

          let stickerBuffer = await sticker.toBuffer();
          const fileName = `${toB64Url(sha256(stickerBuffer))}.webp`;
          zip.file(fileName, stickerBuffer);
          stickersMetadata.push({
              fileName,
              isAnimated: false,
              emojis: ['✨'],
              accessibilityLabel: '',
              isLottie: false,
              mimetype: 'image/webp',
          });
      } catch (err) {
          console.error(`تخطي خطأ في الصورة ${i}:`, err.message);
      }
  }

  if (stickersMetadata.length === 0) {
    return new AIRich(conn)
      .addText(`❌ *فشل تحويل الصور المستخرجة إلى ملصقات.*`)
      .send(m.chat, { quoted: m });
  }

  try {
      let firstSticker = zip.file(stickersMetadata[0].fileName);
      let firstStickerBuffer = await firstSticker.async('nodebuffer');
      let trayBuffer = await makeTrayWebp(firstStickerBuffer);
      
      const trayIconFileName = 'tray_icon.webp';
      zip.file(trayIconFileName, trayBuffer);

      const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' });

      const packUpload = await uploadToServer(conn, archive, {
          hkdf: 'WhatsApp Sticker Pack Keys',
          mediaPath: '/mms/sticker-pack',
      });

      const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer);
      const thumbUpload = await uploadToServer(conn, thumbnailBuffer, {
          hkdf: 'WhatsApp Sticker Pack Thumbnail Keys',
          mediaPath: '/mms/thumbnail-sticker-pack',
          mediaKey: packUpload.mediaKey,
      });

      await conn.relayMessage(
          m.chat,
          {
              messageContextInfo: { messageSecret: crypto.randomBytes(32) },
              stickerPackMessage: {
                  stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
                  name: packName,
                  publisher: publisherName,
                  packDescription: 'حزمة ملصقات ذكية ملوكية - 30 ملصق',
                  stickers: stickersMetadata,
                  fileLength: packUpload.fileLength,
                  fileSha256: packUpload.fileSha256,
                  fileEncSha256: packUpload.fileEncSha256,
                  mediaKey: packUpload.mediaKey,
                  directPath: packUpload.directPath,
                  mediaKeyTimestamp: Math.floor(Date.now() / 1000),
                  stickerPackSize: packUpload.fileLength,
                  stickerPackOrigin: 2,
                  trayIconFileName,
                  thumbnailDirectPath: thumbUpload.directPath,
                  thumbnailSha256: thumbUpload.fileSha256,
                  thumbnailEncSha256: thumbUpload.fileEncSha256,
                  thumbnailHeight: 252,
                  thumbnailWidth: 252,
                  imageDataHash: thumbUpload.fileSha256.toString('base64'),
              },
          },
          { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

      // رسالة نجاح غنية
      await new AIRich(conn)
        .addText(`✅ *تم إرسال حزمة الملصقات بنجاح!*\n\n*📦 عدد الملصقات:* ${stickersMetadata.length}\n*🔍 كلمة البحث:* ${text}`)
        .send(m.chat, { quoted: m });

  } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await new AIRich(conn)
        .addText(`❌ *فشل إرسال الحزمة الكلية:* ${e.message}`)
        .send(m.chat, { quoted: m });
  }
};

handler.help = ['حزمه <الاسم>'];
handler.tags = ['sticker'];
handler.command = /^(حزمه|حزمة)$/i;

export default handler;