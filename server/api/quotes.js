const express = require('express');
const router = express.Router();
const { generateQuote } = require('../services/qwenService');

// 添加缓存机制
const quoteCache = {
    quotes: [],
    maxSize: 5,
    lastUpdateTime: null,
    cacheLifetime: 1000 * 60 * 60 // 1小时缓存
};

router.get('/random', async (req, res) => {
    try {
        let quote;
        const now = Date.now();
        
        // 检查缓存是否过期
        if (quoteCache.lastUpdateTime && 
            (now - quoteCache.lastUpdateTime) > quoteCache.cacheLifetime) {
            quoteCache.quotes = [];
        }
        
        // 如果缓存中有名言，随机返回一条
        if (quoteCache.quotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * quoteCache.quotes.length);
            quote = quoteCache.quotes.splice(randomIndex, 1)[0];
        } else {
            // 缓存为空时，生成新的名言并缓存
            quote = await generateQuote();
            // 后台补充缓存
            setTimeout(async () => {
                try {
                    const newQuotes = await Promise.all(
                        Array(quoteCache.maxSize - 1).fill().map(() => generateQuote())
                    );
                    quoteCache.quotes.push(...newQuotes);
                    quoteCache.lastUpdateTime = Date.now();
                } catch (error) {
                    console.error('补充缓存失败:', error);
                }
            }, 0);
        }

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('获取名言失败:', error);
        res.status(500).json({
            success: false,
            error: '获取名言失败，请稍后重试'
        });
    }
});

module.exports = router; 