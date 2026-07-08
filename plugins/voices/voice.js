import axios from 'axios'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// مفتاح ElevenLabs (يفضل تنقله لـ config لاحقاً)
const ELEVENLABS_API_KEY = "sk_ce4df1ada3d4e2f9e6821a4972b769f2c179abe933f977f4"

const voices = {
  male:    "pNInz6obpgDQGcFmaJgB",
  female:  "EXAVITQu4vr4xnSDxMaL",
  robotic: "ErXwobaYiN019PkySvjV"
}
const voiceNames   = { male: "ذكري 🔵", female: "أنثوي 🔴", robotic: "روبوتي 🤖" }
const dialectNames = { fusha: "الفصحى", khaliji: "الخليجية", masri: "المصرية", shami: "الشامية", english: "English" }

// جلسات حفظ البيانات مؤقتاً
const sessions = {}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // ─── [1] معالجة النداء المخفي من الأزرار ──────────────────
  if (command === 'v-gen') {
    const args = text.split('|')
    if (args.length < 3) return
    const voice = args[0].trim()
    const dialect = args[1].trim()
    const speechText = args.slice(2).join('|').trim()

    react('⏳')
    await m.reply(`⏳ (*جـاري تـولـيـد الـصـوت الآن...*)`)

    try {
      const resp = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voices[voice]}`,
        {
          text: speechText,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.35, similarity_boost: 0.8 }
        },
        {
          headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
          responseType: "arraybuffer"
        }
      )

      const audioBuffer = Buffer.from(resp.data)

      const caption = 
        `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
        `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
        `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
        `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
        `*⸙【 ◈|🕸️|◈  】 الـتـولـيـد الـصـوتـي*\n\n` +
        `*➸ الـنـوع:* *${voiceNames[voice]}*\n` +
        `*➸ الـلـهـجـة:* *${dialectNames[dialect]}*\n` +
        `*➸ الـنـص:* *${speechText}*\n\n` +
        `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
        `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`

      await m.reply(caption)
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: "mero_voice.mp3",
        ptt: false
      }, { quoted: m })

      react('✅')
    } catch (e) {
      console.error(e)
      react('❌')
      m.reply(`❌ (*فـشـل تـولـيـد الـصـوت، تـأكـد مـن الـمـفـتـاح*)`)
    }
    return
  }

  // ─── [2] أمر اختيار اللهجة بعد اختيار نوع الصوت ──────────────────
  if (command === 'v-step2') {
    const args = text.split('|')
    if (args.length < 2) return
    const chosenVoice = args[0].trim()
    const speechText = args.slice(1).join('|').trim()

    const caption = 
      `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
      `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  ✮⃝🕷️𓆪 خـطـوـة 2: اخـتـر الـلـهـجـة*\n\n` +
      `*➸ الـصـوت الـمـخـتـار:* *${voiceNames[chosenVoice]}*\n\n` +
      `*𝖬𝖤𝖱𝖮 𝖡𝖮𝖳 🛠️ حدد اللهجة المراد التحدث بها من الأسفل:* \n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`

    const buttons = [
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌍 الفصحى', id: `.v-gen ${chosenVoice}|fusha|${speechText}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🇸🇦 الخليجية', id: `.v-gen ${chosenVoice}|khaliji|${speechText}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🇪🇬 المصرية', id: `.v-gen ${chosenVoice}|masri|${speechText}` }) },
      { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🇸🇾 الشامية', id: `.v-gen ${chosenVoice}|shami|${speechText}` }) },
    ]

    const message = {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: `𓆩  𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪  🕷️` }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
          })
        }
      }
    }

    const msg = generateWAMessageFromContent(m.chat, message, { userJid: conn.user.jid })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return
  }

  // ─── [3] الأمر الأساسي والبداية ──────────────────
  if (!text?.trim()) {
    react('☁️')
    return m.reply(
      `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
      `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  ✮⃝🕷️𓆪 تـحـوـيـل الـنـص إلـى صـوـت*\n\n` +
      `*『  ˹🎶˼  』 الاستخدام:* \n` +
      `*${usedPrefix + command} <الجملة المراد نطقها>*\n\n` +
      `*➸ مثال:* \n` +
      `*${usedPrefix + command} هلا والله يا ميرو*\n\n` +
      `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
      `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`
    )
  }

  react('🔍')

  const caption = 
    `*╭─┈─┈─┈─⟞🕸️⟝─┈─┈─┈─╮*\n` +
    `*┃ —̳͟͞͞☁️ 𓆩𝑴𝑬𝑹𝑶𓆪 🕸️⃟⁦🕷️ 𓆩𝑩𝑶𝑻𓆪〈*\n` +
    `*╰─┈─┈─┈─⟞🕷️⟝─┈─┈─┈─╯*\n\n` +
    `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
    `*𓆩  ✮⃝🕷️𓆪 خـطـوـة 1: اخـتـر نـوـع الـصـوـت*\n\n` +
    `*𝖬𝖤𝖱𝖮 𝖡𝖮𝖳 🛠️ حدد الجنس المفضل لنطق النص بالأسفل:* \n` +
    `*❉═━═━═━ ◦ • ⊰🕷️ • ◦ ━═━═━═❉*\n` +
    `*𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️*`

  const buttons = [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👨 ذكري (رجل)', id: `.v-step2 male|${text.trim()}` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👩 أنثوي (فتاة)', id: `.v-step2 female|${text.trim()}` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 روبوتي (آلي)', id: `.v-step2 robotic|${text.trim()}` }) },
  ]

  const message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
          footer: proto.Message.InteractiveMessage.Footer.create({ text: `𓆩  𝑴𝑬𝑹𝑶 𝑩𝑶𝑻 𓆪  🕷️` }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({ buttons })
          })
        }
      }
    }

  const msg = generateWAMessageFromContent(m.chat, message, { userJid: conn.user.jid })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  react('✅')
}

handler.command = /^(احكي|voice|تكلم|v-step2|v-gen)$/i
handler.help    = ['احكي <نص>']
handler.tags    = ['ai']

export default handler
                    
