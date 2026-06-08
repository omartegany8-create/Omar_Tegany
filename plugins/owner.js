let handler = async (m, { conn, bot }) => {
  let watermark = '𓆩𝑴𝑬𝑹𝑶𓆪 🕷️';
  
  let quoted = {
    key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
    message: { conversation: '𓆩𝑴𝑬𝑹𝑶 𝑨𝑰𓆪 🕷️' }
  };
  const num = bot.config.owners[0].jid.split("@")[0];
  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:${watermark}
TEL;type=CELL;waid=${num}:+${num}
END:VCARD`;

  let img = 'https://accounts.google.com/SignOutOptions?hl=ar&continue=https://myaccount.google.com/%3Fhl%3Dar%26utm_source%3DOGB%26utm_medium%3Dact%26gar%3DWzJd&ec=GBRAwAE';
  
  await conn.sendMessage(m.chat, {
    contacts: { displayName: watermark, contacts: [{ vcard }] },
    contextInfo: {
      forwardingScore: 2023,
      externalAdReply: {
        title: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
        body: watermark,
        sourceUrl: 'https://whatsapp.com/channel/0029Vb3UUKz3QxS3bgWmTc3x',
        thumbnailUrl: img,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted })
};

handler.command = /^(owner|مطور|المطور)$/i;

export default handler;
