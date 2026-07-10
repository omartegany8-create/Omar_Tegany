export default {
    name: 'echo_fixed',
    command: ['echo', 'say'],
    category: 'utility',
    desc: 'Echoes the user\'s message content, demonstrating the fix for WebMessageInfo type errors.',
    async exec({ sock, m }) {
        // The error likely occurred because 'm' (WebMessageInfo object) was passed directly
        // to a function expecting a string or a specific content object structure.
        // For example, if one mistakenly wrote:
        // await sock.sendMessage(m.chat, m, { quoted: m });

        // The correct way to send the message's text content is to use 'm.text'
        // within the content object expected by sock.sendMessage.
        if (m.text) {
            await sock.sendMessage(m.chat, { text: `You said: ${m.text}` }, { quoted: m });
        } else {
            // Handle cases where the message might not have direct text content (e.g., image message without caption)
            await sock.sendMessage(m.chat, { text: 'I received a message, but it \'s not a text message or has no readable text content.' }, { quoted: m });
        }
    }
};