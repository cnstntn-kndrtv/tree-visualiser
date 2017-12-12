function splitWord(word) {
    let array = word.split('');
    return array;
}

function getWordsFromDictionary() {
    let words = ['йцукенгшщзхъфывапролджэёячсмитьбю', 'абвгд', 'бвгд', 'вгд', 'гд', 'абв'];

    let abc = 'йцукенгшщзхъфывапролджэёячсмитьбю';
    let words2 = [];
    let words3 = [];
    for(let i = 0; i < abc.length; i++) {
        let word = abc.slice(i);
        words2.push(word);
        let j = Math.round(Math.random() * 10);
        for(; j > 0; j--) {
            let endIndex = Math.round(Math.random() * word.length);
            words3.push(abc.slice(i, endIndex))
        }
    }
    return words3;
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
            height: 3000,
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

var i = 10;
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

let treeData = {
    letter: "#",
    childNodes: {
        '1': {
            letter: '1',
            childNodes: {
                '1-1': {
                    letter: '1-1',
                    childNodes: {
                        '1-1-1': {
                            letter: '1-1-1'
                        }
                    }
                },
                '1-2': {
                    letter: '1-2'
                }
            }
        },
        '2': {
            letter: '2',
            childNodes: {
                '2-1': {
                    letter: '2-1'
                }
            }
        }
    }
}

let treeData2 = {
    // letter: "#",
    childNodes: {
    }
}

// let treeView = new TreeView('#view', treeData2);


