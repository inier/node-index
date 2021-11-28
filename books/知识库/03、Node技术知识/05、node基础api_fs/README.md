# fs 模块
所有的返回信息第一个参数都是异常error,第二个参数就是返回的读取信息

## 基础api
- readFile读取文件，第一个参数是必选的，为路径名；第二个可选参数是读取文件的编码格式，如果没有，默认buffer；第三个参数返回一个function，function第一个参数为error，第二个参数为读取文件的内容；
- writeFile 写入文件，第一个参数是写入文件的路径名和文件名；第二个参数是写入文件的内容，可以是字符串也可以是buffer；第三个是可选参数，是个对象，里面放置写入文件的一些相关参数内容，比如encodeing;最后一个参数是回调函数，回调函数接受参数第一个是err；
- stat 获取文件信息，第一个参数为文件路径名；第二个参数为回调函数，函数第一个参数为error对象，第二个参数为stats信息对象。
- rename 更换文件名字，第一个参数是文件路径名；第二个参数是更改后的文件路经过，第三个参数是error回调函数。
- unlink 删除文件
- readdir 读取路径下面的文件和文件夹目录名字，第二个参数是一个回调函数，函数第一个参数是error，第二个参数是数组包裹的文件或者文件夹名字
- mkdir 创建文件夹，第二个参数是一个回调函数，接受第一个参数是error
- watch 监听文件和文件夹的变化，第一个参数为路径；第二个入参为可配置参数；第三个入参为回调函数，函数第一个参数是eventType,第二个是发生变化的文件名filename.

## stream
- readstream 使用方法：fs.createReadStream('./10、readstream.js');
- writestream 使用方法：fs.createWriteStream('./test.txt');  ws.write(num+''); ws.end();

## 通过promise 解决回调地狱
- [promisify](./12、promisify.js)