import {
    QRCode,
    QRErrorCorrectLevel
} from './qrcode'

// support Chinese
function utf16to8(str) {
    var out, i, len, c
    out = ''
    len = str.length
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i)
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
        }
    }
    return out
}

/**
 * 生成具有可选自定义配置的二维码，包括文本、尺寸、内边距、错误修正级别、颜色以及可选的中心图像。
 *
 * @param {Object} options - 生成二维码的配置选项。
 * @param {string} [options.text=''] - 要编码到二维码中的文本，默认为空字符串。
 * @param {number} [options.width=300] - 二维码的宽度（包括内边距），以像素为单位，默认为260像素。
 * @param {number} [options.height=300] - 二维码的高度（包括内边距），以像素为单位，默认为260像素。
 * @param {number} [options.padding=10] - 二维码周围的内边距，以像素为单位，默认为20像素。
 * @param {number} [options.typeNumber=-1] - 二维码的类型号，如果设置为-1，则自动选择最合适的类型号。
 * @param {QRErrorCorrectLevel} [options.correctLevel=QRErrorCorrectLevel.H] - 二维码的错误修正级别，默认使用高错误修正能力(H)。
 * @param {string} [options.background='#ffffff'] - 二维码的背景颜色，默认为白色。
 * @param {string} [options.foreground='#000000'] - 二维码的前景颜色，默认为黑色。
 * @param {Object} [options.image] - 二维码中心可选图像的设置。
 * @param {string} [options.image.url=''] - 中心图像的资源URL。如果为空字符串，则不显示图像。
 * @param {number} [options.image.width=80] - 中心图像的宽度，以像素为单位，默认为80像素。
 * @param {number} [options.image.height=80] - 中心图像的高度，以像素为单位，默认为80像素。
 * @param {boolean} [options.image.round=true] - 是否将中心图像裁剪为圆形，默认为true。
 *
 * @returns {Promise<string>} 返回一个Promise对象，解析为二维码图像的base64编码字符串。如果生成过程中出现错误，Promise将被拒绝。
 *
 * @example
 * drawQrcode({
 *   text: '你好，世界！',
 *   width: 300,
 *   height: 300,
 *   padding: 30,
 *   background: '#eee',
 *   foreground: '#333',
 *   image: {
 *     url: 'path/to/image.png',
 *     width: 100,
 *     height: 100,
 *     round: false
 *   }
 * }).then(base64 => {
 *   console.log('生成的二维码:', base64);
 * }).catch(error => {
 *   console.error('生成二维码出错:', error);
 * });
 */
function drawQrcode(options = {}) {
    const defaults = {
        text: '',
        width: 300,
        height: 300,
        padding: 10,
        typeNumber: -1,
        correctLevel: QRErrorCorrectLevel.H,
        background: '#ffffff',
        foreground: '#000000',
        image: {
            url: '',
            width: 80,
            height: 80,
            round: true
        }
    };

    // 合并用户选项与默认选项
    const { text, width, height, padding, typeNumber, correctLevel, background, foreground, image } = { ...defaults, ...options };

    return new Promise((resolve, reject) => {
        const qrcode = new QRCode(typeNumber, correctLevel);
        qrcode.addData(utf16to8(text));
        qrcode.make();

        const dpr = wx.getWindowInfo().pixelRatio;
        const canvasWidth = width * dpr;
        const canvasHeight = height * dpr;

        const canvas = wx.createOffscreenCanvas({ type: '2d', width: canvasWidth, height: canvasHeight });
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        const moduleSize = Math.ceil((canvasWidth - padding * 2 * dpr) / qrcode.getModuleCount());

        // 绘制二维码模块
        qrcode.modules.forEach((row, rowIndex) => {
            row.forEach((col, colIndex) => {
                ctx.fillStyle = col ? foreground : background;
                const x = Math.round(colIndex * moduleSize) + padding * dpr;
                const y = Math.round(rowIndex * moduleSize) + padding * dpr;
                ctx.fillRect(x, y, moduleSize, moduleSize);
            });
        });

        if (image.url) {
            const img = canvas.createImage();
            img.src = image.url;
            img.onload = () => {
                const imgWidth = image.width * dpr;
                const imgHeight = image.height * dpr;
                const imgX = (canvasWidth - imgWidth) / 2;
                const imgY = (canvasHeight - imgHeight) / 2;

                if (image.round) {
                    const radius = imgWidth / 2;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(imgX + radius, imgY + radius, radius, 0, Math.PI * 2, true);
                    ctx.clip();
                }

                ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
                ctx.restore();
                resolve(canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, ''));
            };
            img.onerror = reject;
        } else {
            resolve(canvas.toDataURL('image/png').replace(/^data:image\/\w+;base64,/, ''));
        }
    });
}

export default drawQrcode
