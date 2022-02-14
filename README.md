## 本插件为学习项目

在 [Thief-Book-VSCode](https://github.com/cteamx/Thief-Book-VSCode) 及 [shadow-reader](https://github.com/igzhang/shadowReader) 的基础上做了一些修改。

## 功能

- 支持状态栏显示
- 支持本地文本阅读
- 其他编码格式自动转码为 **UTF-8**
- 网络下载书籍(目前书源: [采墨阁](https://www.caimoge.net/))

## 安装

vscode 插件市场，搜索 `vscrebook`，安装

## 快速开始

### 主菜单

1. 按下 `Ctrl + Shift + P`，搜索 `start` ，或按下启动快捷键(默认为 `Ctrl + Alt + ;` / `Command + ;`)

### 新增书籍

1. 选择 `添加书籍`
2. 选择 `本地书籍` 或 `网络书籍`
3. `本地书籍`: 选择文件，并起一个名字
4. `网络书籍`: 输入搜索关键字，选择要下载的书名，下载完成后自动添加

### 开始阅读

1. 在主菜单选择 `选择书籍` ，选择已添加的书名
2. 使用快捷键，上一页 `Ctrl + Alt + ,` / `Command + ,`，下一页 `Ctrl + Alt + .` / `Command + .`，老板键 `Ctrl + Alt + /` / `Command + /`
3. 按下老板键自动切换小说文字为随机 `Hello, World!` 代码，再次按下恢复小说文字
4. 按下 自动翻页 `Ctrl + Alt + m` 

### 删除书籍

1. 在主菜单选择`删除书籍`，选择书名，即可删除

### 自动老板键

1. 若长时间不操作，会自动使用老板键，当前显示文本为Hello World
2. 再次使用老板键，可返回原文本

## 扩展设置

- `vscrebook.pageSize`：每次最多显示字数（默认 25）
- `vscrebook.lineBreak`: 用来替换换行符的字符
- `vscrebook.downloadPath`: 下载小说的目录
- 修改快捷键：首选项 -- 键盘快捷方式(`Ctrl + K Ctrl + S`)

## 未来功能

- 优化显示(针对代码)
- 书籍部分加载
- 搜索
- 更多在线书籍书源
- 其他格式支持(比如.epub)
- 其他隐藏显示手段

## 功能对比

|   功能   | Thief-Book-VSCode |              shadow reader               |                Vscre Book                |
| :------: | :---------------: | :--------------------------------------: | :--------------------------------------: |
|  大文件  |     全部加载      |                 部分加载                 |           全部加载，代码内存储           |
| 支持编码 |       utf8        |               GB\Big5\UTF                |                 常见编码                 |
| 转换编码 |      不支持       |                UTF-32 LE                 |                  UTF-8                   |
| 支持书量 |       1 本        |                   多本                   |                   多本                   |
| 全文搜索 |      不支持       |                   向后                   |                  不支持                  |
| 在线书籍 |      不支持       | 支持([笔趣阁](https://www.biqugee.com/)) | 支持([采墨阁](https://www.caimoge.net/)) |
| 更新时间 |     2019.8.7      |                2021.12.20                |                2022.2.13                 |
