import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { uploadToCatbox } from "../../system/utils.js";

const handler = async (m, { conn, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';

  if (!mime) throw '*❲ ❤️ ❳ ~ اعمل ريبلاي علي الصوره او الفيديو أو الصوت ~ ❲ 💙 ❳ *';
  
  const media = await q.download();
  const link = await uploadToCatbox(media);
  
  await conn.sendButton(m.chat, {
    imageUrl: link,
    bodyText: "🗃️ ~ Successful *(catbox.moe)*\n- ```" + link + "```",
    footerText: "VENi ~ VII7",
    buttons: [
      { name: "cta_copy", params: { display_text: "Copy Link", copy_code: link } },
    ],
    mentions: [m.sender],
    newsletter: {
      name: '𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️',
      jid: ''
    },
    interactiveConfig: {
      buttons_limits: 10,
      list_title: "𓆩  𝑴𝑬𝑹𝑶 𝑨𝑰 𓆪 🕷️",
      button_title: "Click Here",
      canonical_url: ""
    }
  }, m);
};

handler.usage = ["لرابط2"];
handler.category = "tools";
handler.command = ['لرابط2', 'image2url2'];

export default handler;
