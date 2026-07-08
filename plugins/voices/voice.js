import axios from 'axios'

const ELEVENLABS_API_KEY = "sk_ce4df1ada3d4e2f9e6821a4972b769f2c179abe933f977f4"

const voices = {
  male:    "pNInz6obpgDQGcFmaJgB",
  female:  "EXAVITQu4vr4xnSDxMaL",
  robotic: "ErXwobaYiN019PkySvjV"
}
const voiceNames   = { male: "ذكري 🔵", female: "أنثوي 🔴", robotic: "روبوتي 🤖" }
const dialectNames = { fusha: "الفصحى", khaliji: "الخليجية", masri: "المصرية", shami: "الشامية", english: "English" }

// ذاكرة الجلسات العامة عشان تسمع في الدالتين
global.voice_sessions = global.voice_sessions || {}

const VOICE_IMAGE = "https://wallpapercave.com/wp/wp10502415.jpg"

// ━━━ [1] الأمر الأساسي لبدء الميزة ━━━
let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chat = m.chat
  const input = text?.trim()

  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  if (!input) {
    react('🎙️')
    const helpMsg = 
      `*╔═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
      `> *【🎙️】تحويل الـنـص إلـى صـوت 🔊*\n\n` +
      `> *【🕯️】اكتب الجملة المراد نطقها ✨*\n\n` +
      `*📌 مثال:* \n` +
      `*${usedPrefix + command} هلا والله يا عمر*\n\n` +
      `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╝*`
    
    return conn.sendMessage(chat, { image: { url: VOICE_IMAGE }, caption: helpMsg }, { quoted: m })
  }

  // فتح الجلسة وحفظ النص
  global.voice_sessions[chat] = { step: 1, speechText: input, sender: m.sender }
  react('🔍')

  const step1Msg = 
    `*╔═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╗*\n` +
    `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
    `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
    `> *【🎙️】خـطـوة 1: اخـتـر نـوع الـصـوت 🔊*\n\n` +
    `*1️⃣  صـوت ذكـري (رجل)*\n` +
    `*2️⃣  صـوت أنـثـوي (فتاة)*\n` +
    `*3️⃣  صـوت روـبـوتـي (آلي)*\n\n` +
    `> *【🕯️】اكتب رقم الاختيار في الشات الآن ✨*\n\n` +
    `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
    `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
    `*╚═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╝*`

  await conn.sendMessage(chat, { image: { url: VOICE_IMAGE }, caption: step1Msg }, { quoted: m })
  react('✅')
}

handler.command = /^(احكي|voice|تكلم)$/i
handler.help    = ['احكي <نص>']
handler.tags    = ['ai']

// ━━━ [2] دالة المراقبة المستمرة لالتقاط الأرقام ━━━
handler.all = async function (m) {
  const chat = m.chat
  // التأكد إن فيه جلسة مفتوحة للشات ده، وإن العضو بعت نص، ومش بادئ بنقطة أمر
  if (!global.voice_sessions[chat]) return
  if (!m.text) return
  if (m.text.startsWith('.') || m.text.startsWith('/')) return

  const input = m.text.trim()
  
  const react = async (emoji) => {
    try { await this.sendMessage(chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  // الخطوة 1: اختيار الصوت
  if (global.voice_sessions[chat].step === 1 && /^[1-3]$/.test(input)) {
    const voiceMap = { '1': 'male', '2': 'female', '3': 'robotic' }
    const voice = voiceMap[input]
    
    global.voice_sessions[chat].voice = voice
    global.voice_sessions[chat].step = 2

    react('🔍')
    const step2Msg = 
      `*╔═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
      `> *【🎙️】خـطـوة 2: اخـتـر الـلـهـجـة الـمـطـلـوبـة 🔊*\n\n` +
      `*🎤 الـصـوت الـمـخـتـار:* *${voiceNames[voice]}*\n\n` +
      `*1️⃣  الـفـصـحـى*\n` +
      `*2️⃣  الـخـلـيـجـيـة*\n` +
      `*3️⃣  الـمـصـريـة*\n` +
      `*4️⃣  الـشـامـيـة*\n` +
      `*5️⃣  English*\n\n` +
      `> *【🕯️】اكتب رقم اللهجة الآن في الشات ✨*\n\n` +
      `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
      `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
      `*╚═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╝*`

    await this.sendMessage(chat, { image: { url: VOICE_IMAGE }, caption: step2Msg }, { quoted: m })
    react('✅')
    return
  }

  // الخطوة 2: اختيار اللهجة والتوليد
  if (global.voice_sessions[chat].step === 2 && /^[1-5]$/.test(input)) {
    const dialectMap = { '1': 'fusha', '2': 'khaliji', '3': 'masri', '4': 'shami', '5': 'english' }
    const dialect = dialectMap[input]
    
    const { speechText, voice } = global.voice_sessions[chat]
    delete global.voice_sessions[chat] // تنظيف فوراً

    react('⏳')
    await this.sendMessage(chat, { text: `⏳ (*جـاري تـولـيـد الـصـوت الآن...*)` }, { quoted: m })

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

      const finalMsg = 
        `*╔═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╗*\n` +
        `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
        `*╚═━═━═━ ◦ • ⊰🕸️⊱ • ◦ ━═━═━═╝*\n\n` +
        `> *【🎙️】تـم تـولـيـد الـصـوت بـنـجـاح 🔊*\n\n` +
        `*↫ الـنـوع:* *${voiceNames[voice]}*\n` +
        `*↫ الـلـهـجـة:* *${dialectNames[dialect]}*\n` +
        `*↫ الـنـص:* *${speechText}*\n\n` +
        `*╔═━═━═━ ◦ • ⊰🕷️⊱ • ◦ ━═━═━═╗*\n` +
        `*┃ —̳͟͞͞☁️ 𓆩𝐌𝐄𝐑𝐎𓆪 🕸️⃟🕷️ 𓆩𝐁𝐎𝐓𓆪〈*\n` +
        `*╚═━═━═━ ◦ • ⊰🎙️⊱ • ◦ ━═━═━═╝*`

      await this.sendMessage(chat, { text: finalMsg }, { quoted: m })
      await this.sendMessage(chat, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        fileName: "mero_voice.mp3",
        ptt: false
      }, { quoted: m })

      react('✅')
    } catch (e) {
      console.error(e)
      react('❌')
      this.sendMessage(chat, { text: `❌ (*فـشـل تـولـيـد الـصـوت، تـأكـد مـن الـمـفـتـاح*)` }, { quoted: m })
    }
    return
  }
}

export default handler
                                  
