## 本插件为学习项目

参考
1. [Thief-Book-VSCode](https://github.com/cteamx/Thief-Book-VSCode)
2. [shadow-reader](https://github.com/igzhang/shadowReader)

## 注意! ! !

## 功能

- 支持状态栏显示
- 支持本地文本阅读
- 其他编码格式自动转码为 **UTF-8**
- 网络下载书籍(目前书源: [采墨阁](https://www.caimoge.net/), [58小说网](http://www.wbxsw.com/), [爱下书小说网](https://www.aixiawx.com/), [醉读](https://www.maxreader.la/))
- 导入导出 书籍列表 / 设置

## 安装

vscode 插件市场，搜索 `vscrebook`，安装

## 快速开始

### 主菜单

1. 按下 `Ctrl + Shift + P` / `F1`，搜索 `menu` ，或按下启动快捷键(默认为 `Ctrl + Alt + ;` / `Command + ;`)

### 新增书籍

1. 选择 `添加书籍`
2. 选择 `本地书籍` 或 `网络书籍`
3. `本地书籍`: 选择文件，并起一个名字
4. `网络书籍`: 输入搜索关键字，选择要下载的书名，下载完成后自动添加

### 导入/导出

1. 选择 `导入/导出`
2. 选择 `导入书籍列表` / `导出书籍列表` / `导入设置` / `导出设置`

### 开始阅读

+ 按下 `Ctrl + Alt + ;` / `Command + ;` 打开 **主菜单**
+ 在主菜单选择 `选择书籍` ，选择已添加的书名
+ 使用快捷键，上一页 `Ctrl + Alt + ,` / `Command + ,`，下一页 `Ctrl + Alt + .` / `Command + .`，老板键 `Ctrl + Alt + /` / `Command + /`
+ 按下老板键自动切换小说文字为随机 `Hello, World!` 代码，再次按下恢复小说文字
+ 按下 `Ctrl + Alt + m` / `Command + m` **自动翻页**
+ 按下 `Ctrl + Alt + l` / `Command + l` **搜索内容**

### 删除书籍

1. 在主菜单选择`删除书籍`，选择书名，即可删除

### 自动老板键

1. 若长时间不操作，会自动使用老板键，当前显示文本为Hello World
2. 再次使用老板键，可返回原文本

### 防止长按

连续翻页 50 次及以上，并且如果每两次翻页时间间隔过短($ \le 50ms$)，将会阻止翻页

## 扩展设置

1. 打开扩展的菜单
2. 选择设置
3. 选择想要设置的项
4. 进行修改

- `vscrebook.pageSize`：每次最多显示字数(默认 25)
- `vscrebook.downloadPath`: 下载小说的目录(默认 (linux) ~\downloads\\ (windows) %USER_PROFILE%/Downloads/ )
- `vscrebook.autoFlipTime`: 每次自动翻页的时长(默认 3000 (ms))
- `vscrebook.displayMode`: 显示小说文字的方式
- `vscrebook.showMoreInfo`: 设置网络书籍中是否显示书籍更多信息
- `vscrebook.downloadSettings`: 网络书籍下载设置
- `vscrebook.bossTexts`: 老板键随机显示的文本
- 修改快捷键：首选项 -- 键盘快捷方式(`Ctrl + K Ctrl + S`)

## Tips

按下 `Esc` 键(标准键盘左上角 **退出** 键) 可以隐藏通知

## 未来功能

- 书籍部分加载
- 模糊搜索
- 更多在线书籍书源
- 其他格式支持(比如.epub)
- 其他阅读方式
- 更加个性化的设置

## 功能对比

|    功能    | Thief-Book-VSCode |                                shadow reader                                 |                Vscre Book                |
| :--------: | :---------------: | :--------------------------------------------------------------------------: | :--------------------------------------: |
|   大文件   |     全部加载      |                                   部分加载                                   |           全部加载，代码内存储           |
|  支持编码  |       utf8        |                                 GB\Big5\UTF                                  |                 常见编码                 |
|  转换编码  |      不支持       |                                  UTF-32 LE                                   |                  UTF-8                   |
|  支持书量  |       1 本        |                                     多本                                     |                   多本                   |
|  全文搜索  |      不支持       |                                     向后                                     |                 支持(全文精确搜索)                 |
|  在线书籍  |      不支持       | 支持([笔趣阁](https://www.biqugee.com/), [采墨阁](https://www.caimoge.net/)) | 支持([采墨阁](https://www.caimoge.net/), [58小说网](http://www.wbxsw.com/), [爱下书小说网](https://www.aixiawx.com/), [醉读](https://www.maxreader.la/)) |
| 自动老板键 |      不支持       |                                     支持                                     |                   支持                   |
|  自动翻页  |      不支持       |                                    不支持                                    |                   支持                   |
|  阅读方式  |      状态栏       |                                    状态栏                                    |             状态栏, 弹出信息             |
|  更新时间  |     2019.8.7      |                                  2022.7.14                                   |                2022.9.17                 |
