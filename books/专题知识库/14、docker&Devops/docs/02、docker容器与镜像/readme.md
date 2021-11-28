## Docker容器与镜像

目录
- [Docker核心](#class02-01)
- [Docker镜像](#calss02-02)
- [打包自己的一个image](#class02-03)
- [Docker容器: Container](#class02-04)
- [构建自己的镜像](#class02-05)
- [Dockerfile](#class02-06)
- [发布镜像](#class02-07)
- [来一个简单的例子](#class02-08)
- [容器操作](#class02-09)
- [再看一个小栗子 - 打包一个node程序](#class02-10)
- [容器资源限制](#class02-11)


### <div class="class02-01">Docker核心</div>
Docker 的核心组件包括：                         
- Docker 客户端 - Client
- Docker 服务器 - Docker daemon
- Docker 镜像 - Image
- Registry
- Docker 容器 - Container

![1](http://7xo6kd.com1.z0.glb.clouddn.com/upload-ueditor-image-20170425-1493117446353024350.jpg)

虚拟机的启动可以参看 本目录下的 `vagrantfile`和 `setup.sh` 两个文件。启动方式参看第一篇文章


### <div class="calss02-02">Docker镜像</div>
什么是镜像的话，直接看这个文章： [10张图带你深入理解Docker容器和镜像](http://dockone.io/article/783)

#### 镜像的获取
**方式1、Dockerfile**                  

一个简单的 `Dockerfile` 示例
```bash
FROM Debian:8
LABEL maintainer="yanle <331393627@qq.com>"
RUN apt-get update && apt-get install -y redis-server
EXPORT 6379
ENTRYPOUNT ["/usr/bin/redis-server"]
```
然后使用docker 打包命令： `docker build -t yanlele/redis:latest .`

只是一个简单的示范， 后续更多内容接着整理                       



**方式2、pull from Registry**
- [DockerHub:https://hub.docker.com](https://hub.docker.com)

`docker Registry` 是一个类似于GitHub的一个东西， 我们可以从Registry中拉取我们想要的image, 
也可以比我们自己的image 直接push 到 Registry 上去

举一个非常简单的例子， 我们从 `docker Registry` 中拉去一个 `debian` : `sudo docker pull debian:8`                              
拉去完成之后， 就可以看到本地的 `docker image`: `sudo docker image ls`                     
```
[vagrant@docker-host ~]$ sudo docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
debian              8                   7cd9fb1ee74f        10 days ago         129MB
```

我们所有的 `docker Registry` 的镜像都是放置在 [DockerHub:https://hub.docker.com](https://hub.docker.com) 上的。
所有的镜像分为官方镜像和个人镜像， 其他的以后慢慢研究。


### <div class="02-03">打包自己的一个image</div>
#### 这里先看一个简单的一个官方demo                          
- 拉取镜像： `docker pull hello-world`
- 查看当前镜像： `docker image ls`
- 执行拉取到的helloWorld: `docker run hello-world`

#### 如何自己实现一个helloWorld
以为想实现一个纯可执行的， 不需要任何依赖的hello word ， 所以考虑使用 C 语言的hello world                      
~/hello-world/hello.c
```
#include <stdio.h>

int main(){
	printf("hello docker\n");
}
```
然后需要安装编译工具， 先查看自己 极其上是否有编译工具： `yum list|grep gcc` / `yum list |grep glibc`                      
所需要的是工具是： `gcc、glibc-static` 如果没有这两个工具， 直接 yum 安装就可以了。

然后用gcc 编译C 语言， 让其输出一个在Linux 环境下的一个可执行文件： `gcc -static hello.c -o hello`                     
运行之后， 在当前目录多了一个可执行文件。

#### 创建Dockerfile打包
当前目录创建Dockerfile: `vim Dockerfile`                      
```
FROM scratch
ADD hello /
CMD ["/hello"]
```
保存退出之后， 直接进行docker 打包： `docker build -t yanlele/hello-world .`                          
运行过程如下：
```
Sending build context to Docker daemon  860.7kB
Step 1/3 : FROM scratch
 ---> 
Step 2/3 : ADD hello /
 ---> 3cf6370e3b3d
Step 3/3 : CMD ["/hello"]
 ---> Running in 0df423cf29e7
Removing intermediate container 0df423cf29e7
 ---> e436b5b7ed18
Successfully built e436b5b7ed18
Successfully tagged yanlele/hello-world:latest
```
通过 `docker image ls` 就可以查看自己刚才的那个docker 镜像了

运行我们的 docker image: `docker run yanlele/hello-world`



#### 查看docker构建分层
通过`docker image`可以去看docker 分层情况： `docker history [docker image id]`                    
```
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
e436b5b7ed18        7 minutes ago       /bin/sh -c #(nop)  CMD ["/hello"]               0B                  
3cf6370e3b3d        7 minutes ago       /bin/sh -c #(nop) ADD file:0bd91ef318c5fa6bf…   857kB  
```

**注意一点:**                                          
在构建 Dockerfile 里面 `FROM scratch` 表示不base 任何镜像文件， 所以这里不算一层



### <div id="class02-04">Docker容器: Container</div>
基础知识看这个文章 [10张图带你深入理解Docker容器和镜像](http://dockone.io/article/783)

#### `container` 和 `image` 的关系
主要从这三方方面理解                      
- `container` 是通过 `image` 创建的， 实际上就是在 `image layer(只读)`之上建立了的一个 `container layer(可读写)`                    
- 可以把 `container` 和 `image` 的关系 类比于 `类(image)于实例(container)`                      
- `image`负责app的存储和分发 `container` 负责运行app

#### 如何创建 `container`
最简单的方式就是直接通过： `docker run [docker image name]`

列出当前正在运行的容器： `docker container ls`                      
值得注意的地方： 上面运行的 `hello world` 容器， 无论怎么运行， 都不会出现在 `docker container ls` 里面，
这个是因为 `hello world` 容器运行之后， 就退出了， 不会常驻内存里面。

列出当前所有的容器(包括正在运行的和已经退出的)： `docker container ls -a`
```
[vagrant@docker-host hello-word]$ docker container ls -a
CONTAINER ID        IMAGE                 COMMAND             CREATED             STATUS                         PORTS               NAMES
819f91112ba1        yanlele/hello-world   "/hello"            12 minutes ago      Exited (13) 12 minutes ago                         elastic_mclean
2f3f72f34396        hello-world           "/hello"            About an hour ago   Exited (0) About an hour ago                       condescending_swanson
```

#### 看一个比较复杂的`image:CentOs`             
启动： `docker run debian:8`               
之后查看容器： `docker container ls -a`                
```
CONTAINER ID        IMAGE                 COMMAND             CREATED             STATUS                         PORTS               NAMES
fd8ac474c124        debian:8              "bash"              9 seconds ago       Exited (0) 8 seconds ago                           infallible_nobel
819f91112ba1        yanlele/hello-world   "/hello"            16 minutes ago      Exited (13) 16 minutes ago                         elastic_mclean
2f3f72f34396        hello-world           "/hello"            About an hour ago   Exited (0) About an hour ago                       condescending_swanson
```

发现一个问题， debian 也不会常驻内存


#### 交互式运行容器
上面遗留了一个问题： `debian 也不会常驻内存`, 那么如何让debian常驻内存。                       
交互式运行镜像创建容器：  `docker run -it debian:8`                 
这样我们就能直接 debian 容器里面去了

再启动一个terminal窗口， 进入之前的 虚拟机， 运行命令： `docker container ls`
```
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
9e26736a2eeb        debian:8            "bash"              56 seconds ago      Up 56 seconds                           upbeat_allen
```
发现我们的debian 已经常驻内存了


#### 常用命令

命令行 | 作用
:-|:-
`docker container rm [container id]` | 删除容器
`docker ps -a` | `docker container ls -a` 的简写版本
`docker rm [container id]` | `docker container rm [container id]` 的简写版本
`docker rm -f [container id]` | 强制删除（停止容器并且删除）
`docker images` | `docker image ls` 的简写版本
`docker image rm [image id]` | 删除镜像
`docker rmi [image id]` | 删除镜像
`docker container ls -aq` | 列举所有容器的id
`docker image ls -q` | 列举所有的镜像id
`docker rm $(docker container ls -aq)` | 删除所有的容器
`docker contaienr ls -f 'status=exited'` | 列出所有退出的容器
`docker contaienr ls -f 'status=exited' -q` | 列出所有退出的容器的id
`docker contaienr ls -f 'status=exited' -q` | 列出所有退出的容器的id
`docker rm $(docker contaienr ls -f 'status=exited' -q)` | 删除所有已经退出的容器



### <div id="class02-05">构建自己的镜像</div>

#### 创建一个新的镜像的方式
- 通过 `docker container commit` 就可以看到命令行语法：                
`Usage:  docker container commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]] [flags]` 可以简写为 `docker commit`                            
这个就是通过image 创建好 container , 然后对container 做出改变之后， 再把改变后的container重新打包为image

- `docker image build` 可以简写为 `docker build`
`Usage:  docker image build [OPTIONS] PATH | URL | - [flags]`                       
根据一个已有的image , build 一个新的 image

#### 举一个例子 - 通过容器创建镜像
我们交互式运行一个centos的镜像，并且对镜像做出改变： `docker run it centos`                        
然后安装一个vim:  `sudo yum install -y vim`                            

安装成功之后， 我就有了一个vim , 然后退出容器之后， `docker container ls -a` 就可以找到我们已经退出来的容器（这个容器安装了vim）                      
```
[vagrant@docker-host ~]$ docker container ls -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                       PORTS               NAMES
89851b821678        centos              "/bin/bash"         4 minutes ago       Exited (127) 7 seconds ago                       sad_fermi
```

直接运行 `docker commit [contaienr name] [new image name: tag]`
```
[vagrant@docker-host ~]$ docker commit sad_fermi yanlele/centos-vim
sha256:72d96eef3aa846ae2fa7c5e642f87802aa9dc826bc18c11941c41e464496d8d0
```

成功之后就会有一个新的 `docker image`: `docker image ls`
```
[vagrant@docker-host ~]$ docker image ls
REPOSITORY            TAG                 IMAGE ID            CREATED              SIZE
yanlele/centos-vim    latest              72d96eef3aa8        About a minute ago   340MB
yanlele/hello-world   latest              e436b5b7ed18        23 hours ago         857kB
debian                8                   7cd9fb1ee74f        11 days ago          129MB
centos                latest              9f38484d220f        3 weeks ago          202MB
hello-world           latest              fce289e99eb9        3 months ago         1.84kB
```

**两个镜像的关系**                         
```
yanlele/centos-vim    latest              72d96eef3aa8        About a minute ago   340MB
centos                latest              9f38484d220f        3 weeks ago          202MB
```
这两个镜像其实是公用了很多层的， 可以通过 `docker history [image id]` 查看                                                            
比如先看centos 镜像的 层：                         
```
[vagrant@docker-host ~]$ docker history 9f38484d220f
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
9f38484d220f        3 weeks ago         /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B                  
<missing>           3 weeks ago         /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B                  
<missing>           3 weeks ago         /bin/sh -c #(nop) ADD file:074f2c974463ab38c…   202MB  
```

再看 `yanlele/centos-vim` 的层：                         
```
[vagrant@docker-host ~]$ docker history 72d96eef3aa8
IMAGE               CREATED             CREATED BY                                      SIZE                COMMENT
72d96eef3aa8        About an hour ago   /bin/bash                                       139MB               
9f38484d220f        3 weeks ago         /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B                  
<missing>           3 weeks ago         /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B                  
<missing>           3 weeks ago         /bin/sh -c #(nop) ADD file:074f2c974463ab38c…   202MB 
```

**注意**                          
非常不推荐使用这种方式， 以为使用者不知道这个image 里面有什么， 这个镜像是不安全的。


#### 举一个例子 - 通过Dockerfile创建image
创建一个文件夹 `~/docker-centos-vim` 然后进去之后， 创建Dockerfile文件                                                                     
```
FROM centos
RUN yum install -y vim
```
然后运行命令行 `docker build -t yanlele/centos-vim-new .`                          
就可以执行镜像打包了                              


### <div id="class02-06">Dockerfile</div>

#### FROM
```
FROM scratch # 制作base image
FROM centos # 使用base image
FROM ubuntu:14.04 # 使用指定版本的 image
```
**注意**                  
尽量使用官方的image 作为 base image



#### LABEL
```
LABEL maintainer="331393627@qq.com"
LABEL version="1.0"
LABEL description="This is description"
```
**注意**                      
尽量要加上LABEL, 类似于 注释


#### RUN
```
RUN yum update && yum install -y vum \
    python-dev # 反斜杠
```

```
RUN apt-get update && apt-get install -y perl \
    pwgen --no-install-recommends && rm -fe \
    /var/lib/apt/lists/*  # 注意清理cache
```

```
RUN /bin/bash -c 'source $HOME/.bashrc;echo $HOME'
```

**注意**                          
每次运行RUM 都会生成一层， 所以可以 \ 一个run来执行多个命令行， 只生成一层


#### WORKDIR
设定当前工作目录                                
```
WORKDIR /root

WORKDIR /test  # 如果没有目录， 会自动创建test 目录
WORKDIR demo
RUN pwd  # 输出结果应该是 /test/demo
```
**注意**                              
尽量用 `WORKDIR` ， 不要用 `RUN cd`! 尽量使用绝对路径


#### AND/COPY
```
ADD hello /
ADD test.tar.gz /  # 添加到根目录并解压

WORKDIR /root
ADD hello test/  # /root/test/hello

WORKDIR /root
COPY hello test/
```

**注意**                          
ADD 可以接压缩                       
大多数情况下 copy 使用优先级高于 add


#### ENV
```
ENV MYSQL_VERSION 5.6  # 设置常量
RUN apt-get install -node-hello-worldy mysql-version = "${MYSQL_VERSION}"  # 引用常量
RUN rm -rf /var/lib/apt/lists/* 
```
**要常用ENV**



#### 几个重要的执行命令对比                            
**RUN**: 执行命令并且创建新的image layer                          
**CMD**: 设置容器启动后默认执行的命令和参数                              
**ENTRYPOINT**: 设置容器启动时运行的命令                                

#### 两种命令行格式
**shell**:                      
格式                      
```
RUM apt-get install -y vim
CMD echo "hello docker"
ENTRYPOINT echo "hello docker"
```

参数                      
```
FROM centos
NEV name Docker
ENTRYPOINT echo "helloo $name"
```

**exec**：                           
格式                      
```
RUN ["apt-get", "install",  "-y", "vim"]
CMD ["/bin/echo", "hello docker"]
ENTRYPOINT ["/bin/echo", "hello docker"]
```

参数                      
```
FROM centos
ENV name Docker
ENTRYPOINT ["/bin/echo", "hello $name"]
```

问题来了， 我们发现按照这个方式 是没有办法输出 hello Docker 的
```
FROM centos
ENV name Docker
ENTRYPOINT ["/bin/echo", "hello $name"]
```
输出结果： `hello $name`

修改方式1：              
```
FROM centos
ENV name Docker
ENTRYPOINT ["/bin/bash", "-c", "echo hello $name"]
```

#### CMD
- 容器启动时默认执行的命令
- 如果docker run 指定了其他命令， CMD 命令被忽略
- 多个CMD命令， 只执行最后一个

```
FROM centos
ENV name Docker
CMD echo "hello $name"
```

运行：                 
`docker run [image]` 输出 hello Docker

`docker run -it [image] /bin/bash` 不会输出 hello Docker


#### ENTRYPOINT
- 让容器以程序或者服务的方式去运行
- 不会被忽略， 一定执行
- 最佳实践是写一个shell脚本作为`ENTRYPOINT`去执行

```
COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]
EXPOSE 27017
CMD ["mongod"]
```


#### 其他
多余dockerfile 的语法和写法， 可以多多参考这个项目 [https://github.com/docker-library](https://github.com/docker-library)
docker 官方文档： [https://docs.docker.com/](https://docs.docker.com/)




### <div id="class02-07">镜像发布</div>                             
[https://hub.docker.com](https://hub.docker.com) 注册账号和密码

然后回到虚拟机， 通过 `docker login` 登录                           
```
[vagrant@docker-host helloDocker]$ docker login
Login with your Docker ID to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com to create one.
Username: yanlele	
Password: 
Login Succeeded
```
说明就的登录成功了


#### 推送image
`docker push`: `Usage:  docker push [OPTIONS] NAME[:TAG] [flags]`                   
例如我们要push hello-world: `docker push yanlele/hello-world:latest`

就可以等待推送完成了， 想拉取这个镜像， 就就可以这样: `docker pull yanlele/hello-world`

**不推荐**

#### 推送Dockerfile
关联github -> github 项目里面放置Dockerfile -> 自动触发build
**推荐**



#### 搭建私有DockerHub
在docker hub 上面找到 `registry` 这个这个镜像就是帮助构建私有 `docker hub`(没有界面) 仓库的
**需要的时候在研究**




### <div id="class02-08">来一个简单的例子</div>
这里用一个打包一个python flask 服务为例子                             
app.py
```
from flask import Flask
app = Flask(__name__)
@app.route('/')
def hello():
    return "hello docker"
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
```

Dockerfile                  
```Dockerfile
FROM python:2.7
LABEL maintainer="Peng Xiao<xiaoquwl@gmail.com>"
RUN pip install flask
COPY app.py /app/
WORKDIR /app
EXPOSE 5000
CMD ["python", "app.py"]
```

然后运行命令行 `docker build -t yanlele/flask-demo`                        
打包完成之后 `docker run -d -p 5000:5000 --name=flask-demo yanlele/flask-demo`                    
运行容器

**注意**

1、如果希望宿主机器访问， 必须要加上 -p [point]:[point]， 这样可以把容器ip 代理到 宿主机器

2、如果容器打包过程中除了问题， 提议动过查看临时容器ID, 进去查看问题原因， 做调试作用: `docker run -it [temp id] /bin/bash`                    

3、对于服务的话，如何才能后台运行: `dcoker run -d [docker image]`


### <div id="class02-09">容器操作</div>

命令 | 说明
:- | :-
`docker exec -it [container id] [命令]` | 对运行中的容器执行命令， 比如可以 执行 `/bin/bash`、`python`等
`docker [container] stop [container id]` | 停掉运行中的容器
`docker [container] start [container id]` | 启动容器
`docker run -d --name=demo [image]` | 给启动的容器取一个名字（不取名字， 名称随机）
`docker inspect [container id|name]` | 获取到容器信息 


### <div id="class02-10">再看一个小栗子 - 打包一个node程序</div>
server.js
```javascript
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3001, '0.0.0.0');
console.log('Server running at http://127.0.0.1:3001/');
```

Dockerfile
```Dockerfile
FROM node:8.9-alpine
LABEL maintainer="yanlele 331393627@qq.com"

ADD . /app/
WORKDIR /app
EXPOSE 3001

CMD ["node", "start"]
```

执行打包： `docker build -t yanlele/node-demo`                                        
执行docker 容器： `docker run -d -p 3001:3001 --name=node-demo yanlele/node-demo`


### <div id="class02-11">容器资源限制</div>
docker 容器启动是要吃内存的， 如果不做限定， 就会一直吃虚拟机的内存， 没有内存了， 容器就退出了。
`docker run [options] [image]`                      

重要限定参数 | 含义
:- | :-
`--memory` | 内存限制
`--memory-swap` | 也是内存限制， 如果 `--memory-swap`不做限制， 那么内存大小跟 `--memory` 是一样的
`--vm [int]` | 启动进程个数
`--verbose` | 日志输出
`--cpu-shares [int]` | cpu 使用权重

如果内存超过宿主， 那么久直接退出




### 其他补充
我们每次运行 `docker` 命令行的时候， 就需要用到 `sudo`, 那么如何取消这个 `sudo` 呢                         
- 添加一个docker group : `sudo groupadd docker`
- 添加当前用户到group: `sudo gpasswd -a vagrant docker`
- 重启docker服务： `sudo service docker restart`
- 如果还是不行， 尝试重新登录虚拟机


**查看cpu进程使用情况**： `top`

参考文章
- [Docker 架构详解](https://www.cnblogs.com/CloudMan6/p/6763789.html)
- [几张图帮你理解 docker 基本原理及快速入门](https://www.cnblogs.com/SzeCheng/p/6822905.html)
- [10张图带你深入理解Docker容器和镜像](http://dockone.io/article/783)
- [dcoker入门,使用docker部署NodeJs应用](https://www.cnblogs.com/pass245939319/p/8473861.html)
- [Linux（CentOS）安装Node.JS和npm的两种方式（yum安装和源码安装）](https://blog.csdn.net/abcdefg2343/article/details/81355002)



