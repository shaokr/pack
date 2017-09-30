# 前端打包构建工具

## 功能 

安装cnpm: ```npm run cnpm```

安装eslint的相关内容: ```npm run eslint```

安装依赖 : ```cnpm i```

开启服务 : ```npm run g```

开启压缩服务 : ```npm run gb```

开启编译非压缩和压缩 : ```npm run ga```

使用只使用webpack编译(默认压缩代码):

```npm run b -- --env.path=项目地址```

```npm run b -- --env.path=项目地址 --output-path 输出到的目录```

```npm run b -- --env.path=项目地址 --env.dev=true``` (非压缩模式)

## 设置 

在```gulp-config.js```文件里进行目录的设置
在每个项目中的```packconf/config.js```里也可以进行单项目设置

# js编码风格(eslint)
.eslintrc.json
jsconfig.json

# demo代码说明(前端构建基本框架)

## 目录文件说明
```
.
demo
├── doc/: 项目相关文件(比如ui，流程图
├── src/: 生产环境
│   ├── img/: 图片
│   ├── js/
│   │   ├── entry/: 入口(在此目录的文件会产出到产出环境
│   │   │   ├── config.js: 异步加载主要配置文件
│   │   │   ├── index.html: build的时候生成的页面
│   │   │   └── main.js: 主入口
│   │   ├── component/: 项目react组件
│   │   ├── mock-dome/: 模拟接口数据工具
│   │   ├── mobx-data/
│   │   │   ├── store-main.js: 所有 数据、计算、操作 统一出口
│   │   │   ├── store/: 数据
│   │   │   ├── action/: 操作
│   │   │   └── computed/: 计算
│   │   ├── helpers/: 业务相关的方法
│   │   ├── config/: 配置目录(语言等
│   │   │   ├── lang/: 多语言
│   │   │   │   ├── data: 语言包
│   │   │   │   └── index.js: 主要实现
│   │   │   ├── cdn-host.js: cdn的路径配置
│   │   │   └── env.js: 环境配置
│   │   ├── util/: 其他代码库
│   │   │   ├── log.js: 打印数据方法
│   │   │   ├── devtools.js: 追踪store数据调试工具
│   │   │   ├── param.js: 获取url参数
│   │   │   ├── time-deal.js: 时间相关方法
│   │   │   ├── validate-form.js: 验证数据
│   │   │   ├── storage.js: h5存储
│   │   │   ├── create-url-params.js: 把对象变成url参数
│   │   │   ├── client.js: 客户端信息
│   │   │   ├── guid.js: guid
│   │   │   └── widget/: 第三方代码
│   │   └── webpack-set/: webpack的一些自定义设置
│   ├── less/: 样式
│   ├── pages/: html
│   └── static/: 静态样式
│
│        
├── dist: 产出代码
│    └── min 压缩后代码
└── packconf/: 项目打包配置

```
## 其他说明

目录 src/js/entry 支持含目录格式 如：src/js/entry/1.0.0

如果在 src/js/entry 中含有html, 压缩模式编译的时候不会编译 pages 目录中的html
