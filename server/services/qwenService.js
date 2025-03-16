const { OpenAI } = require('openai');

const client = new OpenAI({
    apiKey: 'sk-e56da60218db4e7bad17f5353ec71c7c',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

async function generateQuote() {
    try {
        const completion = await client.chat.completions.create({
            model: 'qwen-plus',
            messages: [
                {
                    role: 'system',
                    content: '你是一个智慧的名言生成器。请生成一句富有哲理、激励人心的中文名言，并注明作者。格式为 JSON：{text: "名言内容", author: "作者名"}。名言要简短有力，不超过30个字。'
                },
                {
                    role: 'user',
                    content: '请生成一句新的名言'
                }
            ]
        });

        // 解析返回的内容
        const quote = JSON.parse(completion.choices[0].message.content);
        return quote;
    } catch (error) {
        console.error('通义千问 API 调用错误:', error);
        throw error;
    }
}

module.exports = { generateQuote }; 