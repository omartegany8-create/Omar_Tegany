import fetch from 'node-fetch'

let handler = async (m, { conn, text, command, usedPrefix }) => {
    try {
        if (!text) {
            return m.reply(`*Usage:* ${usedPrefix + command} <query>\n*Example:* ${usedPrefix + command} cat`)
        }

        const query = encodeURIComponent(text)
        const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${query}&type=image`

        await m.reply('Searching for images on Pinterest, please wait...')

        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data || !data.status || !Array.isArray(data.data) || data.data.length === 0) {
            return m.reply('❌ No Pinterest images found for your query.')
        }

        // Filter for valid image_urls
        const validImages = data.data.filter(item => item && item.image_url)

        if (validImages.length === 0) {
            return m.reply('❌ No valid Pinterest images found for your query.')
        }

        const maxImagesToSend = 5; // Limit the number of images for carousel
        const imagesToSend = validImages.slice(0, maxImagesToSend);

        await m.reply(`*Pinterest Search Result for:* "${text}"\n\nFound ${validImages.length} images. Sending ${imagesToSend.length} as a carousel...`);

        for (let i = 0; i < imagesToSend.length; i++) {
            const item = imagesToSend[i];
            const imageUrl = item.image_url;
            const description = item.description || '';
            const source = item.pin || 'N/A'; // Assuming 'pin' might be a source or direct link

            const caption = `*Image ${i + 1}/${imagesToSend.length}*\n` +
                            `*Description:* ${description.trim() || 'N/A'}\n` +
                            `*Source:* ${source}`;

            await conn.sendFile(m.chat, imageUrl, 'pinterest.jpg', caption, m);

            // Add a small delay between sending images to prevent flooding/rate limits
            if (i < imagesToSend.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
            }
        }

    } catch (e) {
        console.error("Error in pinterest handler:", e)
        return m.reply("❌ An error occurred while searching Pinterest: " + e.message)
    }
}

handler.help = ['pinterestsearch <query>']
handler.tags = ['internet']
handler.command = ['pinterestsearch', 'pinterest']

export default handler
