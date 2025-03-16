// 本地名言数据（作为后备）
const localQuotes = [
    { text: "生活中不是缺少美，而是缺少发现美的眼睛。", author: "罗丹" },
    { text: "把事情做对很重要，但把正确的事情做更重要。", author: "彼得·德鲁克" },
    { text: "简单是最终的复杂。", author: "达芬奇" },
    { text: "优秀的设计是让复杂的东西变得简单。", author: "乔布斯" }
];

// 获取名言的函数
async function fetchQuote() {
    try {
        console.log('开始获取名言...');
        const response = await fetch('/api/quote');
        console.log('API响应状态:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('获取的数据:', result);

        if (!result.success) {
            throw new Error(result.error);
        }

        return result.data;
    } catch (error) {
        console.error('获取名言失败:', error);
        // 错误处理后返回默认名言
        return { 
            text: "生活中不是缺少美，而是缺少发现美的眼睛。", 
            author: "罗丹" 
        };
    }
}

// 更新名言显示
async function updateQuote() {
    const quoteText = document.querySelector('.quote-text');
    const quoteAuthor = document.querySelector('.quote-author');
    const refreshButton = document.querySelector('.refresh-quote svg');

    // 添加加载状态
    quoteText.style.opacity = '0.5';
    quoteText.textContent = '正在获取新的名言...';
    quoteAuthor.style.opacity = '0';
    refreshButton.style.transform = 'rotate(360deg)';

    try {
        const quote = await fetchQuote();
        
        // 更新显示
        setTimeout(() => {
            quoteText.textContent = quote.text;
            quoteAuthor.textContent = `— ${quote.author}`;
            quoteText.style.opacity = '1';
            quoteAuthor.style.opacity = '1';
        }, 300);

    } catch (error) {
        console.error('更新名言失败:', error);
        quoteText.textContent = '加载失败，请重试';
        quoteAuthor.textContent = '';
        quoteText.style.opacity = '1';
    } finally {
        // 重置刷新按钮动画
        setTimeout(() => {
            refreshButton.style.transform = 'rotate(0deg)';
        }, 300);
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    // 初始显示一条名言
    updateQuote();

    // 为刷新按钮添加防抖的点击事件
    const refreshButton = document.querySelector('.refresh-quote');
    if (refreshButton) {
        const debouncedUpdate = debounce(updateQuote, 1000);
        refreshButton.addEventListener('click', debouncedUpdate);
    }
}); 