
在 [VSCode 插件](https://github.com/cteamx/Thief-Book-VSCode) [hub.fastgit.org](https://hub.fastgit.org/cteamx/Thief-Book-VSCode)  的基础上做了一些修改。

1. 优化翻页响应速度(将小说缓存，并只在手动刷新或配置中小说路径更改时才重新读取)

2. 变成手动刷新(比原来更弱了，因为原来是每个操作都重新读取配置，并重新读取小说文件)

3. 增强跳转页功能

4. 修改默认每页字数为 25 (原 50)

5. 删除是否为英文

6. 老板键新增 `Kotlin`, `Groovy`, `C#`, `JavaScript`, `TypeScript`, `ReScript`, `PureScript`, `Scala.js` 等语言的 `Hello, World!` 及 弹出运行和运行失败信息

7. 修改默认快捷键为: 

	|按键名称| Windows | Mac |
	:-:|:-:|:-:
    |老板键 | Ctrl + Alt + / | Command + / |
	| 跳转 | Ctrl + Alt + ' | Command + ' |
	| 下一页 | Ctrl + Alt + . | Command + . |
	| 上一页 | Ctrl + Alt + , | Command + , |
	| 刷新 | Ctrl + Alt + ; | Command + ; |

8. 搜索增加 `划水` 关键字