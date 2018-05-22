function splitWord(word) {
    let array = word.split('');
    return array;
}

function getWordsFromDictionary() {
    return words = ['рука', 'река', 'речь', 'шап', 'шапка', 'шуба', 'азбука'];
}

class Graph {
    constructor() {
        this.data = {
            letter: '#',
            childCount: 33,
            childNodes:{} 
        };
        this.words = [];
        this.idSplitter = '::';
        this.endOfWordMark = '#';
        this.viewConfig = {
            container: '#view',
            width: 5000,
            height: 1000,
            endOfWordMark: this.endOfWordMark,
        }
    }
    /*
        this.data = {
            childNodes: {
                'A': {
                    type: 'node',
                    letter: 'A',
                    childCount: 1,
                    childNodes: {
                        'eow' {
                            type: 'leaf,
                            letter: 'eow',
                            word: 'A',
                        }
                },
                'B' {}
            }
        }
    */

    hasWord(word) {
        return this.words.includes(word);
    }

    addChild(id, child) {
        // id = 'a::';
        let keys = id.split(this.idSplitter);
        // keys = ['a', ''];
        keys = keys.slice(0, keys.length - 1);
        let c = this.data.childNodes;
        let k;
        for (let i = 0, l = keys.length; i < l; i++) {
            k = keys[i];
            if(c.hasOwnProperty(k)) {
                c = c[k].childNodes;
            } else {
                c[k] = child;
            }
        }
    }

    addWord(word) {
        this.words.push(word);
    }

    updateView() {
        this.treeView = new TreeView(this.viewConfig, this.data);
    }

}

var words = getWordsFromDictionary();
var graph = new Graph();

function start() {
    for (let i = 0, l = words.length, word; i < l; i++) {
        word = words[i];
        if (!graph.hasWord(word))  {
            let letters = splitWord(word);
            letters[letters.length + 1] = graph.endOfWordMark;
            let id = '';
            letters.forEach((l) => {
                id += l + graph.idSplitter;
                let childNode = {
                    id: id,
                    letter: l,
                }
                if (l == graph.endOfWordMark) {
                    childNode.word = word;
                    childNode.type = 'leaf';
                    graph.addWord(word); // TODO killme
                } else {
                    childNode.type = 'node';
                    childNode.childNodes = {};
                    childNode.childCount = 33;
                }
                graph.addChild(id, childNode);
            });
        }
    }
    graph.updateView();
    console.dir(graph.data);
}

start();


