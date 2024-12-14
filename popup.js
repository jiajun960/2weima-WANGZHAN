document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 获取当前标签页信息
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
            throw new Error('无法获取当前页面信息');
        }

        const url = tab.url;
        const title = tab.title || '未知网页';

        // 更新网站信息
        const favicon = document.getElementById('favicon');
        const siteName = document.getElementById('site-name');
        
        if (tab.favIconUrl) {
            favicon.src = tab.favIconUrl;
        } else {
            favicon.style.display = 'none';
        }
        siteName.textContent = title;

        // 生成二维码
        const qrcodeContainer = document.getElementById('qrcode');
        if (!qrcodeContainer) {
            throw new Error('找不到二维码容器元素');
        }

        // 清空容器
        qrcodeContainer.innerHTML = '';

        // 使用qrcode.js生成二维码
        new QRCode(qrcodeContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });

        // 如果有favicon，等待二维码生成完成后绘制到中心
        if (tab.favIconUrl) {
            setTimeout(() => {
                const canvas = qrcodeContainer.querySelector('canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    const favicon = new Image();
                    favicon.crossOrigin = 'anonymous';
                    favicon.onload = () => {
                        const size = 40;
                        const x = (canvas.width - size) / 2;
                        const y = (canvas.height - size) / 2;

                        // 绘制白色背景
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(x - 5, y - 5, size + 10, size + 10);

                        // 绘制favicon
                        ctx.drawImage(favicon, x, y, size, size);
                    };
                    favicon.onerror = () => {
                        console.error('Favicon加载失败');
                    };
                    favicon.src = tab.favIconUrl;
                }
            }, 100); // 给二维码生成一点时间
        }

    } catch (error) {
        console.error('发生错误:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = `错误: ${error.message}`;
            errorMessage.style.display = 'block';
        }
    }
});

// 添加全局错误处理
window.onerror = function(msg, url, line, col, error) {
    console.error('全局错误:', {msg, url, line, col, error});
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = `发生错误: ${msg}`;
        errorMessage.style.display = 'block';
    }
    return false;
}; 