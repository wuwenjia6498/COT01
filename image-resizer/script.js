document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const editorArea = document.getElementById('editor-area');
    const previewImage = document.getElementById('preview-image');
    const originalSizeEl = document.getElementById('original-size');
    const fileSizeEl = document.getElementById('file-size');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const keepRatioCheckbox = document.getElementById('keep-ratio');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('quality-value');
    const formatSelect = document.getElementById('format');
    const resizeButton = document.getElementById('resize-button');
    const downloadButton = document.getElementById('download-button');
    const resetButton = document.getElementById('reset-button');
    
    // 存储原始图片信息
    let originalImage = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 0;
    let resizedImageURL = null;
    
    // 更新质量显示
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
    });
    
    // 处理拖放区域高亮
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // 处理文件拖放
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files);
        }
    }
    
    // 点击上传区域触发文件选择
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 处理文件选择
    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files);
        }
    });
    
    // 处理上传的文件
    function handleFiles(files) {
        const file = files[0];
        
        // 检查是否为图片文件
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }
        
        // 读取文件
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 创建图片对象以获取原始尺寸
            originalImage = new Image();
            originalImage.onload = function() {
                originalWidth = this.width;
                originalHeight = this.height;
                aspectRatio = originalWidth / originalHeight;
                
                // 显示原始尺寸和文件大小
                originalSizeEl.textContent = `原始尺寸: ${originalWidth} x ${originalHeight}`;
                const fileSize = (file.size / 1024).toFixed(2);
                fileSizeEl.textContent = `文件大小: ${fileSize} KB`;
                
                // 设置初始宽高输入值
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                
                // 显示编辑区域
                dropArea.style.display = 'none';
                editorArea.style.display = 'grid';
                
                // 显示预览图
                previewImage.src = e.target.result;
                
                // 重置下载按钮状态
                downloadButton.disabled = true;
                
                // 清除可能存在的之前的调整后的图片URL
                if (resizedImageURL) {
                    URL.revokeObjectURL(resizedImageURL);
                    resizedImageURL = null;
                }
            };
            
            originalImage.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    // 保持宽高比例
    widthInput.addEventListener('input', function() {
        if (keepRatioCheckbox.checked && aspectRatio) {
            heightInput.value = Math.round(this.value / aspectRatio);
        }
    });
    
    heightInput.addEventListener('input', function() {
        if (keepRatioCheckbox.checked && aspectRatio) {
            widthInput.value = Math.round(this.value * aspectRatio);
        }
    });
    
    // 处理预设按钮点击
    document.querySelectorAll('.preset-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            // 处理百分比缩放按钮
            if (this.dataset.scale) {
                const scale = parseFloat(this.dataset.scale);
                widthInput.value = Math.round(originalWidth * scale);
                
                if (keepRatioCheckbox.checked) {
                    heightInput.value = Math.round(originalHeight * scale);
                }
            }
            // 处理预设尺寸按钮
            else if (this.dataset.width && this.dataset.height) {
                widthInput.value = this.dataset.width;
                heightInput.value = this.dataset.height;
            }
        });
    });
    
    // 调整图片尺寸
    resizeButton.addEventListener('click', function() {
        if (!originalImage) return;
        
        const targetWidth = parseInt(widthInput.value) || originalWidth;
        const targetHeight = parseInt(heightInput.value) || originalHeight;
        const quality = parseInt(qualitySlider.value) / 100;
        const format = formatSelect.value;
        
        // 创建画布并调整大小
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        const ctx = canvas.getContext('2d');
        
        // 根据输出格式处理背景
        if (format === 'jpeg') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // 绘制调整大小后的图像
        ctx.drawImage(originalImage, 0, 0, targetWidth, targetHeight);
        
        // 更新预览图
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 
                          format === 'png' ? 'image/png' : 'image/webp';
        
        // 生成调整后的图片
        if (resizedImageURL) {
            URL.revokeObjectURL(resizedImageURL);
        }
        
        canvas.toBlob(function(blob) {
            resizedImageURL = URL.createObjectURL(blob);
            previewImage.src = resizedImageURL;
            
            // 更新文件大小显示
            const resizedFileSize = (blob.size / 1024).toFixed(2);
            fileSizeEl.textContent = `文件大小: ${resizedFileSize} KB`;
            
            // 启用下载按钮
            downloadButton.disabled = false;
        }, mimeType, quality);
    });
    
    // 下载调整后的图片
    downloadButton.addEventListener('click', function() {
        if (!resizedImageURL) return;
        
        const format = formatSelect.value;
        const extension = format === 'jpeg' ? 'jpg' : format;
        
        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.href = resizedImageURL;
        downloadLink.download = `调整尺寸_${Date.now()}.${extension}`;
        
        // 添加到页面并触发点击
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 移除链接
        setTimeout(() => {
            document.body.removeChild(downloadLink);
        }, 100);
    });
    
    // 重新上传按钮
    resetButton.addEventListener('click', function() {
        // 重置界面状态
        editorArea.style.display = 'none';
        dropArea.style.display = 'flex';
        
        // 重置文件输入
        fileInput.value = '';
        
        // 清除图片资源
        if (resizedImageURL) {
            URL.revokeObjectURL(resizedImageURL);
            resizedImageURL = null;
        }
        
        previewImage.src = '';
        originalImage = null;
    });
}); 