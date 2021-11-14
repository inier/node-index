let Dictionary = require('../07、字典和散列表/01、字典/index');
let Queue = require('../04章、队列/02、优先队列/index');

class Graph {
    constructor() {
        this.vertices = [];
        this.adjList = new Dictionary();
        this.time = 0;
    }

    // 一个用来向图中添加一个新的顶点（因为图实例化后是空的）
    addVertex(v) {
        this.vertices.push(v);
        this.adjList.set(v, []);
    }

    // 用来添加顶点之间的边
    addEdge(v, w) {
        this.adjList.get(v).push(w);
        this.adjList.get(w).push(v);
    }

    // 广度优先遍历算法
    bfs(v, callback) {
        let color = this.initializeColor(), queue = new Queue();
        queue.enqueue(v);
        while (!queue.isEmpty()) {
            let u = queue.dequeue(), neighbors = this.adjList.get(u);
            color[u] = 'grey';
            for (let i = 0; i < neighbors.length; i++) {
                let w = neighbors[i];
                if (color[w] === 'white') {
                    color[w] = 'grey';
                    queue.enqueue(w);
                }
            }
            color[u] = 'black';
            if (callback) {
                callback(u);
            }
        }
    }

    // 使用BFS寻找最短路径
    BFS(v) {
        let color = this.initializeColor(),
            queue = new Queue(),
            d = [], //{1}
            pred = []; //{2}
        queue.enqueue(v);
        for (let i = 0; i < this.vertices.length; i++) { //{3}
            d[this.vertices[i]] = 0; //{4}
            pred[this.vertices[i]] = null; //{5}
        }
        while (!queue.isEmpty()) {
            let u = queue.dequeue(),
                neighbors = this.adjList.get(u);
            color[u] = 'grey';
            for (let i = 0; i < neighbors.length; i++) {
                let w = neighbors[i];
                if (color[w] === 'white') {
                    color[w] = 'grey';
                    d[w] = d[u] + 1; //{6}
                    pred[w] = u; //{7}
                    queue.enqueue(w);
                }
            }
            color[u] = 'black';
        }
        return { //{8}
            distances: d,
            predecessors: pred
        };
    }

    // 深度优先算法实现
    dfs(callback) {
        let color = this.initializeColor();
        for (let i = 0; i < this.vertices.length; i++) {
            if (color[this.vertices[i]] === 'white') {
                this.dfsVisit(this.vertices[i], color, callback);
            }
        }
    }

    // 深度优先算法的优化
    DFS() {
        let color = this.initializeColor(), d = [], f = [], p = [];
        this.time = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            f[this.vertices[i]] = 0;
            d[this.vertices[i]] = 0;
            p[this.vertices[i]] = null;
        }

        for (let i = 0; i < this.vertices.length; i++) {
            if (color[this.vertices[i]] === 'white') {
                this.DFSVisit(this.vertices[i], color, d, f, p);
            }
        }

        return {
            discovery: d,
            finished: f,
            predecessors: p
        }
    }

    DFSVisit(u, color, d, f, p) {
        console.log('discovered ' + u);
        color[u] = 'grey';
        d[u] = ++this.time;
        let neighbors = this.adjList.get(u);
        for (let i = 0; i < neighbors.length; i++) {
            let w = neighbors[i];
            if (color[w] === 'white') {
                p[w] = u;
                this.DFSVisit(w, color, d, f, p);
            }
        }
        color[u] = 'black';
        f[u] = ++this.time;
        console.log('explored ' + u);
    }

    toString() {
        let s = '';
        for (let i = 0; i < this.vertices.length; i++) {
            s += this.vertices[i] + ' -> ';
            let neighbors = this.adjList.get(this.vertices[i]);
            for (let j = 0; j < neighbors.length; j++) {
                s += neighbors[j] + ' ';
            }
            s += '\n';
        }
        return s;
    }

    initializeColor() {
        let color = [];
        for (let i = 0; i < this.vertices.length; i++) {
            color[this.vertices[i]] = 'white';
        }
        return color;
    }

    dfsVisit(u, color, callback) {
        color[u] = 'grey';
        if (callback) {
            callback(u);
        }
        let neighbors = this.adjList.get(u);
        for (let i = 0; i < neighbors.length; i++) {
            let w = neighbors[i];
            if (color[w] === 'white') {
                this.dfsVisit(w, color, callback);
            }
        }
        color[u] = 'black';
    }
}

module.exports = Graph;