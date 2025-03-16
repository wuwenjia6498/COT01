require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// 启用 CORS 和静态文件服务
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working' });
});

// 名言 API 路由
app.get('/api/quote', async (req, res) => {
    try {
        console.log('Fetching quote from Qwen API...'); // 调试日志

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                input: {
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
                }
            })
        });

        console.log('API Response status:', response.status); // 调试日志

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // 调试日志

        const quoteData = JSON.parse(data.output.text);
        res.json({ success: true, data: quoteData });

    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({
            success: false,
            error: '获取名言失败',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 