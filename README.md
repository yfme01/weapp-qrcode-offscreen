# weapp-qrcode-offscreen
- 小程序使用离屏生成二维码，目前使用离屏canvas实现
- 在小程序中直接返回 base64 png 无需挂载页面节点


## 使用方式
```
import drawQrcode from '/qrcode/index.js'

const base64 = await drawQrcode({ text: "hello world!" })
 ```


## 参数

| 参数名         | 类型                         | 默认值             | 描述                                   |
|----------------|------------------------------|--------------------|----------------------------------------|
| `text`         | `string`                     | `''`               | 要编码到二维码中的文本。                |
| `width`        | `number`                     | `300`              | 二维码的宽度（包括内边距），以像素为单位。 |
| `height`       | `number`                     | `300`              | 二维码的高度（包括内边距），以像素为单位。 |
| `padding`      | `number`                     | `10`               | 二维码周围的内边距，以像素为单位。       |
| `typeNumber`   | `number`                     | `-1`               | 二维码的类型号，自动选择最合适的类型号。 |
| `correctLevel` | `QRErrorCorrectLevel`        | `QRErrorCorrectLevel.H` | 二维码的错误修正级别，使用高错误修正能力(H)。|
| `background`   | `string`                     | `'#ffffff'`        | 二维码的背景颜色。允许不透明度。                     |
| `foreground`   | `string`                     | `'#000000'`        | 二维码的前景颜色。不允许不透明度。                     |
| `image`        | `Object`                     | See below          | 二维码中心可选图像的设置。              |

**`image`对象参数：**

| 参数名   | 类型      | 默认值     | 描述                                 |
|----------|-----------|------------|--------------------------------------|
| `url`    | `string`  | `''`       | 中心图像的资源URL。如果为空字符串，则不显示图像。|
| `width`  | `number`  | `80`       | 中心图像的宽度，以像素为单位。        |
| `height` | `number`  | `80`       | 中心图像的高度，以像素为单位。        |
| `round`  | `boolean` | `true`     | 是否将中心图像裁剪为圆形。            |


## 参考
本项目参考了 [weapp-qrcode-canvas-2d](https://github.com/DoctorWei/weapp-qrcode-canvas-2d)