/*▲ حـقـوق الـتـطـويـر والـتـعـديـل ▲
 * 👤 المالك والمطور الوحيد: 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽⃢҉ ســونـيــڪ (محمد)
 * 🎯 المشروع: SonicBot-MD v1.8.3
 * 🤖 اسم البوت: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 📝 الوظيفة: اختبار واجهة AIRich (الرسائل الغنية)
 * 🛡️ المطور: فول ستاك (Full Stack) - وحيد
 * 📢 القناة: ⃟꙰⃢ 𝚂𝙾𝙽𝙸𝙲➥Ᏼᝪᝨ ❯ |‌⃟🇲🇦‌|‌
 * 🆔 ايدي القناة: 120363427713105085@newsletter
 * 🔗 رابط القناة: https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z
 */

import { generateWAMessageFromContent, generateMessageIDV2 } from '@whiskeysockets/baileys'
import crypto from 'crypto'

// ─── AIRich Class ───────────────────────────────────────────────────────────

class AIRich {
   #client

   constructor(client) {
      if (!client) throw new Error('Socket is required')
      this.#client = client
      this._title = ''
      this._footer = ''
      this._contextInfo = {}
      this._extraPayload = {}
      this._submessages = []
      this._sections = []
      this._richResponseSources = []
   }

   setTitle(t) { this._title = t; return this }
   setFooter(t) { this._footer = t; return this }
   setContextInfo(obj) { this._contextInfo = obj; return this }

   static newLayout(name, data) {
      return {
         view_model: {
            [Array.isArray(data) ? 'primitives' : 'primitive']: data,
            __typename: `GenAI${name}LayoutViewModel`
         }
      }
   }

   addText(text) {
      this._submessages.push({ messageType: 2, messageText: text })
      this._sections.push(AIRich.newLayout('Single', {
         text,
         __typename: 'GenAIMarkdownTextUXPrimitive'
      }))
      return this
   }

   addTip(text) {
      this._submessages.push({ messageType: 2, messageText: text })
      this._sections.push(AIRich.newLayout('Single', {
         text,
         __typename: 'GenAIMetadataTextPrimitive'
      }))
      return this
   }

   addSuggest(suggestion) {
      const arr = Array.isArray(suggestion) ? suggestion : [suggestion]
      this._sections.push(AIRich.newLayout('ActionRow', arr.map(text => ({
         prompt_text: text,
         prompt_type: 'SUGGESTED_PROMPT',
         __typename: 'GenAIFollowUpSuggestionPillPrimitive'
      }))))
      return this
   }

   addCode(language, code) {
      const meta = AIRich.tokenizer(code, language)
      this._submessages.push({
         messageType: 5,
         codeMetadata: { codeLanguage: language, codeBlocks: meta.codeBlock }
      })
      this._sections.push(AIRich.newLayout('Single', {
         language,
         code_blocks: meta.unified_codeBlock,
         __typename: 'GenAICodeUXPrimitive'
      }))
      return this
   }

   addTable(table) {
      const meta = AIRich.toTableMetadata(table)
      this._submessages.push({
         messageType: 4,
         tableMetadata: { title: meta.title, rows: meta.rows }
      })
      this._sections.push(AIRich.newLayout('Single', {
         rows: meta.unified_rows,
         __typename: 'GenATableUXPrimitive'
      }))
      return this
   }

   addSource(sources = []) {
      if (sources.every(i => typeof i === 'string')) sources = [sources]
      const source = sources.map(([profile_url, url, text]) => ({
         source_type: 'THIRD_PARTY',
         source_display_name: text ?? '',
         source_subtitle: 'AI',
         source_url: url ?? '',
         favicon: { url: profile_url ?? '', mime_type: 'image/jpeg', width: 16, height: 16 }
      }))
      this._sections.push(AIRich.newLayout('Single', {
         sources: source,
         __typename: 'GenAISearchResultPrimitive'
      }))
      return this
   }

   addImage(imageUrl) {
      const urls = Array.isArray(imageUrl) ? imageUrl : [imageUrl]
      const imageUrls = urls.map(url => ({
         imagePreviewUrl: url,
         imageHighResUrl: url,
         sourceUrl: 'https://fiora.nixel.my.id/'
      }))
      this._submessages.push({
         messageType: 1,
         gridImageMetadata: {
            gridImageUrl: { imagePreviewUrl: urls[0] },
            imageUrls
         }
      })
      imageUrls.forEach(({ imagePreviewUrl }) => {
         this._sections.push(AIRich.newLayout('Single', {
            media: { url: imagePreviewUrl, mime_type: 'image/png' },
            imagine_type: 'IMAGE',
            status: { status: 'READY' },
            __typename: 'GenAIImaginePrimitive'
         }))
      })
      return this
   }

   addVideo(videoUrl) {
      const arr = Array.isArray(videoUrl) ? videoUrl : [videoUrl]
      const videoUrls = arr.map(item => {
         const [url, duration = 0] = item.split('|')
         return { videoPreviewUrl: url, videoHighResUrl: url, duration: Number(duration) || 0, sourceUrl: 'https://fiora.nixel.my.id/' }
      })
      this._submessages.push({ messageType: 2, messageText: '[ CANNOT_LOAD_VIDEO ]' })
      videoUrls.forEach(({ videoPreviewUrl, duration }) => {
         this._sections.push(AIRich.newLayout('Single', {
            media: { url: videoPreviewUrl, mime_type: 'video/mp4', duration },
            imagine_type: 'ANIMATE',
            status: { status: 'READY' },
            __typename: 'GenAIImaginePrimitive'
         }))
      })
      return this
   }

   addReels(reelsItems = []) {
      const arr = Array.isArray(reelsItems) ? reelsItems : [reelsItems]
      this._submessages.push({
         messageType: 9,
         contentItemsMetadata: {
            contentType: 1,
            itemsMetadata: arr.map(item => ({
               reelItem: {
                  title: item.username ?? '',
                  profileIconUrl: item.profileIconUrl ?? item.profile_url ?? '',
                  thumbnailUrl: item.thumbnailUrl ?? item.thumbnail ?? '',
                  videoUrl: item.videoUrl ?? item.url ?? ''
               }
            }))
         }
      })
      arr.forEach((item, idx) => {
         this._richResponseSources.push({
            provider: 'NIXEL',
            thumbnailCDNURL: item.thumbnailUrl ?? item.thumbnail ?? '',
            sourceProviderURL: item.videoUrl ?? item.url ?? '',
            sourceQuery: '',
            faviconCDNURL: item.profileIconUrl ?? item.profile_url ?? '',
            citationNumber: idx + 1,
            sourceTitle: item.username ?? ''
         })
      })
      this._sections.push(AIRich.newLayout('HScroll', arr.map(item => ({
         reels_url: item.videoUrl ?? item.url ?? '',
         thumbnail_url: item.thumbnailUrl ?? item.thumbnail ?? '',
         creator: item.username ?? '',
         avatar_url: item.profileIconUrl ?? item.profile_url ?? '',
         reels_title: item.reels_title ?? item.title ?? '',
         likes_count: item.likes_count ?? item.like ?? 0,
         shares_count: item.shares_count ?? item.share ?? 0,
         view_count: item.view_count ?? item.view ?? 0,
         reel_source: item.reel_source ?? item.source ?? 'IG',
         is_verified: !!(item.is_verified || item.verified),
         __typename: 'GenAIReelPrimitive'
      }))))
      return this
   }

   addPost(data = {}) {
      const posts = Array.isArray(data) ? data : [data]
      this._submessages.push({ messageType: 2, messageText: '[ CANNOT_LOAD_POST ]' })
      this._sections.push(AIRich.newLayout('HScroll', posts.map(p => ({
         title: p.title ?? '',
         subtitle: p.subtitle ?? '',
         username: p.username ?? '',
         profile_picture_url: p.profile_picture_url ?? p.profile_url ?? '',
         is_verified: !!(p.is_verified || p.verified),
         thumbnail_url: p.thumbnail_url ?? p.thumbnail ?? '',
         post_caption: p.post_caption ?? p.caption ?? '',
         likes_count: p.likes_count ?? p.like ?? 0,
         comments_count: p.comments_count ?? p.comment ?? 0,
         shares_count: p.shares_count ?? p.share ?? 0,
         post_url: p.post_url ?? p.url ?? '',
         post_deeplink: p.post_deeplink ?? p.deeplink ?? '',
         source_app: p.source_app ?? p.source ?? 'INSTAGRAM',
         footer_label: p.footer_label ?? p.footer ?? '',
         footer_icon: p.footer_icon ?? p.icon ?? '',
         is_carousel: posts.length > 1,
         orientation: p.orientation ?? 'LANDSCAPE',
         post_type: p.post_type ?? 'VIDEO',
         __typename: 'GenAIPostPrimitive'
      }))))
      return this
   }

   addProduct(data = {}) {
      const items = Array.isArray(data) ? data : [data]
      this._submessages.push({ messageType: 2, messageText: '[ CANNOT_LOAD_PRODUCT ]' })
      const product = items.map(item => ({
         title: item.title,
         brand: item.brand,
         price: item.price,
         sale_price: item.sale_price,
         product_url: item.product_url ?? item.url,
         image: { url: item.image_url ?? item.image },
         additional_images: [{ url: item.icon_url ?? item.icon }],
         __typename: 'GenAIProductItemCardPrimitive'
      }))
      this._sections.push(AIRich.newLayout(
         Array.isArray(data) ? 'HScroll' : 'Single',
         Array.isArray(data) ? product : product[0]
      ))
      return this
   }

   build(jid, { forwarded = true, quoted, quotedParticipant, ...options } = {}) {
      const forward = forwarded ? {
         forwardingScore: 1,
         isForwarded: true,
         forwardedAiBotMessageInfo: { botJid: '0@bot' },
         forwardOrigin: 4
      } : {}

      const qObj = quoted ? {
         stanzaId: quoted?.key?.id || quoted?.id,
         participant: quotedParticipant || quoted?.key?.participant || quoted?.key?.remoteJid,
         quotedType: 0,
         quotedMessage: quoted.message ?? quoted
      } : {}

      const sections = this._footer
         ? [...this._sections, AIRich.newLayout('Single', { text: this._footer, __typename: 'GenAIMetadataTextPrimitive' })]
         : [...this._sections]

      const message = {
         messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
               messageDisclaimerText: this._title,
               richResponseSourcesMetadata: { sources: this._richResponseSources }
            }
         },
         botForwardedMessage: {
            message: {
               richResponseMessage: {
                  messageType: 1,
                  submessages: this._submessages,
                  unifiedResponse: {
                     data: Buffer.from(JSON.stringify({
                        response_id: crypto.randomUUID(),
                        sections
                     })).toString('base64')
                  },
                  contextInfo: { ...forward, ...qObj, ...this._contextInfo }
               }
            }
         }
      }

      return generateWAMessageFromContent(jid, message, {
         messageId: generateMessageIDV2(),
         ...options
      })
   }

   async send(jid, options = {}) {
      const msg = await this.build(jid, options)
      return this.#client.relayMessage(jid, msg.message, {
         messageId: msg.key.id,
         ...options
      })
   }

   static tokenizer(code, lang = 'javascript') {
      const keywords = new Set([
         'break','case','catch','continue','debugger','delete','do','else',
         'finally','for','function','if','in','instanceof','new','return',
         'switch','this','throw','try','typeof','var','void','while','with',
         'true','false','null','undefined','class','const','let','super',
         'extends','export','import','yield','static','constructor','async',
         'await','get','set'
      ])
      const TYPE_MAP = { 0:'DEFAULT', 1:'KEYWORD', 2:'METHOD', 3:'STR', 4:'NUMBER', 5:'COMMENT' }
      const tokens = []
      let i = 0
      const push = (content, type) => {
         if (!content) return
         const last = tokens[tokens.length - 1]
         if (last && last.highlightType === type) last.codeContent += content
         else tokens.push({ codeContent: content, highlightType: type })
      }
      while (i < code.length) {
         const c = code[i]
         if (/\s/.test(c)) { let s=i; while(i<code.length&&/\s/.test(code[i]))i++; push(code.slice(s,i),0); continue }
         if (c==='/'&&code[i+1]==='/') { let s=i; i+=2; while(i<code.length&&code[i]!=='\n')i++; push(code.slice(s,i),5); continue }
         if (c==='"'||c==="'"||c==='`') { let s=i,q=c; i++; while(i<code.length){if(code[i]==='\\'&&i+1<code.length)i+=2;else if(code[i]===q){i++;break}else i++} push(code.slice(s,i),3); continue }
         if (/[0-9]/.test(c)) { let s=i; while(i<code.length&&/[0-9.]/.test(code[i]))i++; push(code.slice(s,i),4); continue }
         if (/[a-zA-Z_$]/.test(c)) {
            let s=i; while(i<code.length&&/[a-zA-Z0-9_$]/.test(code[i]))i++
            const word=code.slice(s,i)
            let type=0
            if(keywords.has(word))type=1
            else{let j=i;while(j<code.length&&/\s/.test(code[j]))j++;if(code[j]==='(')type=2}
            push(word,type); continue
         }
         push(c,0); i++
      }
      return {
         codeBlock: tokens,
         unified_codeBlock: tokens.map(t => ({ content: t.codeContent, type: TYPE_MAP[t.highlightType] }))
      }
   }

   static toTableMetadata(arr) {
      const [header, ...rows] = arr
      const maxLen = Math.max(header.length, ...rows.map(r => r.length))
      const normalize = r => [...r, ...new Array(maxLen - r.length).fill('')]
      const unified_rows = [
         { is_header: true, cells: normalize(header) },
         ...rows.map(r => ({ is_header: false, cells: normalize(r) }))
      ]
      return {
         title: '',
         rows: unified_rows.map(r => ({ items: r.cells, ...(r.is_header ? { isHeading: true } : {}) })),
         unified_rows
      }
   }
}

// ─── Handler ────────────────────────────────────────────────────────────────

let handler = async (m, { conn }) => {

   await new AIRich(conn)
      .setTitle('🤖 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽 ⃢҉ ســونـيــڪ')
      .setFooter('© 2026 SonicBot-MD | المطور الوحيد: محمد')
      .addSuggest(['مساعدة', 'الأوامر', 'معلومات'])
      .addTip('مرحباً بك في البوت!')
      .addText(`# 🚀 نظام الرسائل الغنية\n## تم تطويره بواسطة 𝑺𝑶𝑵𝑰𝑪 𝑫𝑬𝑽\n\nجميع الحقوق محفوظة للمطور الوحيد.`)
      .addCode('javascript', `class SonicBot {
   static version = '1.8.3'
   static developer = 'SONIC DEV'
   static fullStack = true
}`)
      .addTable([
         ['الميزة', 'الحالة'],
         ['الرادار الذكي', '🟢 مفعل'],
         ['الإصلاح التلقائي', '🟢 مفعل'],
         ['الرسائل الغنية', '🟢 مفعل']
      ])
      .addSource([
         ['https://i.imgur.com/example.jpg', 'https://whatsapp.com/channel/0029VbCferaKLaHtHkyEVe1z', 'قناة البوت'],
         ['https://i.imgur.com/example.jpg', 'https://github.com/SONIC-DEV', 'GitHub']
      ])
      .addImage('https://files.catbox.moe/a3sbup.jpg')
      .send(m.chat, { quoted: m })
}

handler.help = ['airich', 'richtest']
handler.command = /^(airich|richtest)$/i
handler.tags = ['owner']

export default handler