function changeCSSVar(properties) {
  let r = document.querySelector(":root");
  for (const key in properties) {
    r.style.setProperty(`--${key}`, `${properties[key]}`);
  }
}
let propertiesToBeChanged = {
  gridSize: 5,
  width: "70vw",
};

let selectedTiles = [];
let currentlyFlipped = [];

let currentDifficulty;
let levelDataArray;
let currentLevel;
let useHintOnce;
let levelData;

let gameCompleted = false;

let initSettings = {
  easy: {
    maxValue: 3,
    width: "40vw",
    tiles: 9,
  },
  hard: {
    maxValue: 5,
    width: "70vw",
    tiles: 15,
  },
};

// UI element which will show the correct no of pairs made in the current level
let currentPairMade = document.querySelector("#currentPairMade");
let currentDifficultyUI = document.querySelector("#currentDifficultyUI");
let currentPairMadeCount;

const lives = document.querySelector("#lives");
const levelInfo = document.querySelector("#levelInfo");
const backToHome = document.querySelector("#backToHome");
const helpBitbucket = document.querySelector("#helpBitbucket");

const levelTitles = [
  "1: Start with basics",
  "2: Onto the next one",
  "3: Getting hard",
  "4. 5X3 showdown",
  "5: Beat if you can",
];

const backImages = [
  "./img/dsa.png",
  "./img/dbms.jpg",
  "./img/os.jpg",
  "./img/electroneum.png",
  "./img/js.png",
];

const colorShades = {
  bit1: "#83d32c",
  bit2: "#045b7c",
  bit3: "#04b3cb",
  bit4: "#13335b",
  bit5: "#ec1b4b",
};

// object for showing the overall scores in the PLAYER's personal house
let personalHomeStats = {
  easyBitPair: 0,
  hardBitPair: 0,
  wrongBitPair: 0,
  runOutOfTime: 0,
};

const questionsAns = {
  // there will be a total of 5 levels (level 1 to 3 will be easy and 4,5 will be dificult)
  easy: {
    // Important: everything should be in lowercase characters and no '-' should be used

    // In a single level, there are 9 tiles needed, and say all of them are related to forge (assume), then a total of 6 maps will be needed for the processing
    // for the entire 3 levels, 18 maps will be needed for a single case (the worst case scenario)

    // dsa
    1: {
      value: "dsaImage.linked list.linear",
      isVisited: false,
      brief: {
        reasoning:
          "A linked list is a linear data structure where elements are not stored at contiguous location. Instead the elements are linked using pointers.",
        metadata:
          '<a target="_blank" href="https://www.codecademy.com/learn/linear-data-structures-java/modules/singly-linked-lists-java/cheatsheet">Resource Page</a>',
      },
    },
    2: {
      value: "dsaImage.insertion.rear",
      isVisited: false,
      brief: {
        reasoning:
          "Elements in queue are always added to the back and removed from the front. Think of it as a line of people waiting for a bus.",
        metadata:
          '<a target="_blank" href="https://www.hackerearth.com/practice/data-structures/queues/basics-of-queues/tutorial/">Resource Page</a>',
      },
    },
    3: {
      value: "dsaImage.delete.front",
      isVisited: false,
      brief: {
        reasoning:
          "Elements in queue are always added to the back and removed from the front. Think of it as a line of people waiting for a bus.",
        metadata:
          '<a target="_blank" href="https://www.hackerearth.com/practice/data-structures/queues/basics-of-queues/tutorial/">Resource Page</a>',
      },
    },
    4: {
      value: "dsaImage.dequeue.front",
      isVisited: false,
      brief: {
        reasoning:
          "Deque is a linear data structure where the insertion and deletion operations are performed from both ends.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/ds-deque">Resource Page</a>',
      },
    },
    5: {
      value: "dsaImage.circular queue.ring buffer",
      isVisited: false,
      brief: {
        reasoning:
          "a circular buffer, circular queue, cyclic buffer or ring buffer is a data structure that uses a single, fixed-size buffer as if it were connected end-to-end.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/circular-queue">Resource Page</a>',
      },
    },
    6: {
      value: "dsaImage.garbage collection.java",
      isVisited: false,
      brief: {
        reasoning:
          "When objects are no longer needed, the garbage collector finds and tracks these unused objects and deletes them to free up space.",
        metadata:
          '<a target="_blank" href="https://newrelic.com/blog/best-practices/java-garbage-collection">Resource Page</a>',
      },
    },
    7: {
      value: "dsaImage.lifo.stack",
      isVisited: false,
      brief: {
        reasoning:
          "In programming terms, putting an item on top of the stack is called push and removing an item is called pop.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/stack">Resource Page</a>',
      },
    },
    8: {
      value: "dsaImage.mst.prim's algo",
      isVisited: false,
      brief: {
        reasoning:
          "Prim's algorithm is a minimum spanning tree algorithm that takes a graph as input and finds the subset of the edges of that graph",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/prim-algorithm">Resource Page</a>',
      },
    },
    9: {
      value: "dsaImage.queue.scheduling",
      isVisited: false,
      brief: {
        reasoning:
          "A queue is natural data structure for a system serving incoming requests. Most of the process scheduling or disk scheduling algorithms in operating systems use queues.",
        metadata:
          '<a target="_blank" href="https://learn.saylor.org/mod/page/view.php?id=18844">Resource Page</a>',
      },
    },
    // dbms
    10: {
      value: "dbmsImage.mysql.oracle",
      isVisited: false,
      brief: {
        reasoning: "Database examples are Mysql & ORACLE",
        metadata:
          '<a target="_blank" href="https://byjus.com/gate/difference-between-oracle-and-mysql/">Resource Page</a>',
      },
    },
    11: {
      value: "dbmsImage.er diagram.system model",
      isVisited: false,
      brief: {
        reasoning:
          "An Entity Relationship (ER) Diagram is a type of flowchart that illustrates how “entities” such as people, objects or concepts relate to each other within a system.",
        metadata:
          '<a target="_blank" href="https://www.lucidchart.com/pages/er-diagrams">Resource Page</a>',
      },
    },
    12: {
      value: "dbmsImage.row.tuple",
      isVisited: false,
      brief: {
        reasoning:
          "A table row contained in a table in the tablespace is known as a tuple.",
        metadata:
          '<a target="_blank" href="https://www.knowledgehut.com/blog/database/tuple-in-dbms">Resource Page</a>',
      },
    },
    13: {
      value: "dbmsImage.column.attribute",
      isVisited: false,
      brief: {
        reasoning:
          "In a database management system (DBMS), an attribute refers to a database component, such as a table.",
        metadata:
          '<a target="_blank" href="https://www.techopedia.com/definition/1164/attribute-database-systems">Resource Page</a>',
      },
    },
    14: {
      value: "dbmsImage.cardinality.#rows",
      isVisited: false,
      brief: {
        reasoning: "Number of rows in a table is known as Cardinality",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/cardinality-in-dbms/">Resource Page</a>',
      },
    },
    15: {
      value: "dbmsImage.degree.#columns",
      isVisited: false,
      brief: {
        reasoning:
          "Degree of a table refers to the number of attributes/columns in a table.",
        metadata:
          '<a target="_blank" href="https://www.teachoo.com/16582/3759/Question-2/category/Past-Year---1-Mark-Questions">Resource Page</a>',
      },
    },
    16: {
      value: "dbmsImage.partial key.composite key",
      isVisited: false,
      brief: {
        reasoning:
          "A key refers to an attribute/a set of attributes that help us identify a row (or tuple) uniquely in a table (or relation).",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/partial-unique-secondary-composite-and-surrogate-keys-in-dbms/">Resource Page</a>',
      },
    },
    17: {
      value: "dbmsImage.unique.primary key",
      isVisited: false,
      brief: {
        reasoning:
          "As primary key helps to distinguish a row with another roe, it has to be a unique attribute",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/partial-unique-secondary-composite-and-surrogate-keys-in-dbms/">Resource Page</a>',
      },
    },
    18: {
      value: "dbmsImage.db description.schema",
      isVisited: false,
      brief: {
        reasoning:
          "A database schema defines how data is organized within a relational database",
        metadata:
          '<a target="_blank" href="https://www.ibm.com/in-en/topics/database-schema">Resource Page</a>',
      },
    },
    // os
    19: {
      value: "osImage.main memory.hardware",
      isVisited: false,
      brief: {
        reasoning:
          "RAM (random access memory) is the main memory of a computer",
        metadata:
          '<a target="_blank" href="https://www.techwalla.com/articles/what-is-main-memory-in-a-computer">Resource Page</a>',
      },
    },
    20: {
      value: "osImage.system program.compiler",
      isVisited: false,
      brief: {
        reasoning:
          "A complier is a program that converts the programming language code to a machine readable format.",
        metadata:
          '<a target="_blank" href="https://www.careerride.com/os-compiler.aspx#:~:text=A%20complier%20is%20a%20program,compiler%20will%20throw%20an%20error.">Resource Page</a>',
      },
    },
    21: {
      value: "osImage.interrupt.isr",
      isVisited: false,
      brief: {
        reasoning:
          "An interrupt service routine (ISR) is a software routine that hardware invokes in response to an interrupt.",
        metadata:
          '<a target="_blank" href="https://www.sciencedirect.com/topics/engineering/interrupt-service-routine#:~:text=An%20interrupt%20service%20routine%20(ISR,kernel%20with%20a%20return%20value.">Resource Page</a>',
      },
    },
    22: {
      value: "osImage.mode bit = 0.kernel",
      isVisited: false,
      brief: {
        reasoning:
          "The mode bit is set to 0 in the kernel mode. It is changed from 0 to 1 when switching from kernel mode to user mode.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/User-Mode-vs-Kernel-Mode#:~:text=The%20mode%20bit%20is%20set%20to%200%20in%20the%20kernel,kernel%20mode%20to%20user%20mode.&text=In%20the%20above%20image%2C%20the,bit%20is%20set%20to%20zero.">Resource Page</a>',
      },
    },
    23: {
      value: "osImage.pcb.info process",
      isVisited: false,
      brief: {
        reasoning:
          "A process control block (PCB) is a data structure used by computer operating systems to store all the information about a process. ",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Process_control_block#:~:text=A%20process%20control%20block%20(PCB,a%20corresponding%20process%20control%20block.">Resource Page</a>',
      },
    },
    24: {
      value: "osImage.fork().child process",
      isVisited: false,
      brief: {
        reasoning:
          "System call fork() is used to create processes. It takes no arguments and returns a process ID.",
        metadata:
          '<a target="_blank" href="https://www.csl.mtu.edu/cs4411.ck/www/NOTES/process/fork/create.html#:~:text=System%20call%20fork()%20is,the%20fork()%20system%20call.">Resource Page</a>',
      },
    },
    25: {
      value: "osImage.semaphore.wait()",
      isVisited: false,
      brief: {
        reasoning:
          "The sem_wait() function decrements by one the value of the semaphore. The semaphore will be decremented when its value is greater than zero.",
        metadata:
          '<a target="_blank" href="https://www.ibm.com/docs/ssw_ibm_i_71/apis/ipcsemw.htm#:~:text=The%20sem_wait()%20function%20decrements,value%20becomes%20greater%20than%20zero.">Resource Page</a>',
      },
    },
    26: {
      value: "osImage.disk scheduling.cscan",
      isVisited: false,
      brief: {
        reasoning:
          "The circular SCAN (C-SCAN) scheduling algorithm is a modified version of the SCAN disk scheduling algorithm that deals with the inefficiency of the SCAN algorithm by servicing the requests more uniformly.",
        metadata:
          '<a target="_blank" href="https://www.gatevidyalay.com/c-scan-disk-scheduling-disk-scheduling/">Resource Page</a>',
      },
    },
    27: {
      value: "osImage.round robin.time sharing",
      isVisited: false,
      brief: {
        reasoning:
          "To schedule processes fairly, a round-robin scheduler generally employs time-sharing, giving each job a time slot or quantum (its allowance of CPU time), and interrupting the job if it is not completed by then.",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Round-robin_scheduling#:~:text=To%20schedule%20processes%20fairly%2C%20a,is%20assigned%20to%20that%20process.">Resource Page</a>',
      },
    },
    // electroneum
    28: {
      value: "electroneumImage.block.consecutive groups",
      isVisited: false,
      brief: {
        reasoning:
          "Block refers to data and state being stored in consecutive groups known as 'blocks'. If you send ETN to someone, the transaction data needs to be added to a block to be successful.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=consecutive%20groups">Resource Page</a>',
      },
    },
    29: {
      value: "electroneumImage.etn sc.ibft",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum Smart Chain (ETN-SC) uses the Istanbul Byzantine Fault Tolerance (IBFT) consensus mechanism. Blocks produced by IBFT are strongly protected against tampering through the collection of signatures from the proposer and the voting validators.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=Istanbul%20Byzantine%20Fault%20Tolerance">Resource Page</a>',
      },
    },
    30: {
      value: "electroneumImage.geth.ethereum protocol",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum Smart Chain is a blockchain with a computer embedded in it, based in the Geth (Go) implementation of the Ethereum protocol. It is the foundation for building apps and organisations in a decentralized, permissionless, censorship-resistant way.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=based%20in%20the%20Geth%20(Go)">Resource Page</a>',
      },
    },
    31: {
      value: "electroneumImage.canonical computer.evm",
      isVisited: false,
      brief: {
        reasoning:
          "In the Electroneum universe, there is a single, canonical computer (called the Electroneum Virtual Machine, or EVM) whose state everyone on the Electroneum network agrees on.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=called%20the%20Electroneum%20Virtual%20Machine">Resource Page</a>',
      },
    },
    32: {
      value: "electroneumImage.transaction.requests",
      isVisited: false,
      brief: {
        reasoning:
          "Requests for computation are called transaction requests; the record of all transactions and the EVM's present state gets stored on the blockchain, which in turn is stored and agreed upon by all nodes.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=transaction%20requests">Resource Page</a>',
      },
    },
    33: {
      value: "electroneumImage.etn.cryptocurrency",
      isVisited: false,
      brief: {
        reasoning:
          "ETN is the native cryptocurrency of Electroneum. The purpose of ETN is to allow for a market for computation. Such a market provides an economic incentive for participants to verify and execute transaction requests and provide computational resources to the network.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-the-electroneum-smart-chain#:~:text=native%20cryptocurrency">Resource Page</a>',
      },
    },
    34: {
      value: "electroneumImage.minting.ledger",
      isVisited: false,
      brief: {
        reasoning:
          "Minting is the process in which new ETN gets created on the Electroneum ledger. The underlying Electroneum protocol creates the new ETN, and it is not possible for a user to create ETN.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/intro-to-etn#:~:text=ETN%20gets%20created">Resource Page</a>',
      },
    },
    35: {
      value: "electroneumImage.nonce.counter",
      isVisited: false,
      brief: {
        reasoning:
          "A counter that indicates the number of transactions sent from an externally-owned account or the number of contracts created by a contract account. Only one transaction with a given nonce can be executed for each account, protecting against replay attacks where signed transactions are repeatedly broadcast and re-executed.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/accounts#:~:text=indicates%20the%20number%20of%20transactions">Resource Page</a>',
      },
    },
    36: {
      value: "electroneumImage.storage root.merkle tree",
      isVisited: false,
      brief: {
        reasoning:
          "Sometimes known as a storage hash. A 256-bit hash of the root node of a Merkle Patricia trie that encodes the storage contents of the account (a mapping between 256-bit integer values), encoded into the trie as a mapping from the Keccak 256-bit hash of the 256-bit integer keys to the RLP-encoded 256-bit integer values.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/foundational-topics/accounts#:~:text=Sometimes%20known%20as%20a%20storage%20hash">Resource Page</a>',
      },
    },
    // js
    37: {
      value: "jsImage.scripting.language",
      isVisited: false,
      brief: {
        reasoning:
          "JavaScript is not a programming language in strict sense. Instead, it is a scripting language because it uses the browser to do most of the work.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">Resource Page</a>',
      },
    },
    38: {
      value: "jsImage.react.framework",
      isVisited: false,
      brief: {
        reasoning:
          "React makes it painless to create interactive UIs. Design simple views for each state in app, and React will efficiently update & render just the right components when data changes.",
        metadata:
          '<a target="_blank" href="https://reactjs.org/">Resource Page</a>',
      },
    },
    39: {
      value: "jsImage.mocha.livescript",
      isVisited: false,
      brief: {
        reasoning:
          "The original LiveScript was the name for what we now know as JavaScript, renamed in 1995 after Sun endorsed it. Before being named LiveScript, the programming language was called Mocha.",
        metadata:
          '<a target="_blank" href="https://auth0.com/blog/a-brief-history-of-javascript/">Resource Page</a>',
      },
    },
    40: {
      value: "jsImage.1997.ecma script",
      isVisited: false,
      brief: {
        reasoning:
          "JavaScript was invented by Brendan Eich in 1995, and became an ECMA standard in 1997.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_versions.asp">Resource Page</a>',
      },
    },
    41: {
      value: "jsImage.es6.current edition",
      isVisited: false,
      brief: {
        reasoning: "ECMAScript 2015 is also known as ES6 and ECMAScript 6.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_es6.asp">Resource Page</a>',
      },
    },
    42: {
      value: "jsImage.click.event",
      isVisited: false,
      brief: {
        reasoning:
          "The onclick event occurs when the user clicks on an HTML element.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/jsref/event_onclick.asp">Resource Page</a>',
      },
    },
    43: {
      value: "jsImage.maps.sets",
      isVisited: false,
      brief: {
        reasoning: "Maps & sets are very crucial part of Javascript data types",
        metadata:
          '<a target="_blank" href="https://javascript.info/map-set">Resource Page</a>',
      },
    },
    44: {
      value: "jsImage.strict mode.literal expression",
      isVisited: false,
      brief: {
        reasoning:
          'JavaScript\'s strict mode is a way to opt in to a restricted variant of JavaScript, thereby implicitly opting-out of "sloppy mode". ',
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode">Resource Page</a>',
      },
    },
    45: {
      value: "jsImage.global scope.function scope",
      isVisited: false,
      brief: {
        reasoning:
          "Scope determines the accessibility of variables, objects, and functions from different parts of the code.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_scope.asp">Resource Page</a>',
      },
    },
  },
  hard: {
    // dsa
    1: {
      value: "dsaImage.height.leaf node",
      isVisited: false,
      brief: {
        reasoning:
          "The height of a node is the number of edges from the node to the deepest leaf. The height of a tree is a height of the root.",
        metadata:
          '<a target="_blank" href="https://www.andrew.cmu.edu/course/15-121/lectures/Trees/trees.html#:~:text=The%20height%20of%20a%20node,a%20height%20of%20the%20root.">Resource Page</a>',
      },
    },
    2: {
      value: "dsaImage.depth.root node",
      isVisited: false,
      brief: {
        reasoning:
          'In the tree, the total number of edges from the root node to the leaf node in the longest path is known as "Depth of Tree".',
        metadata:
          '<a target="_blank" href="https://www.simplilearn.com/tutorials/data-structure-tutorial/trees-in-data-structure#:~:text=In%20the%20tree%2C%20the%20total,as%20%22Depth%20of%20Tree%22.">Resource Page</a>',
      },
    },
    3: {
      value: "dsaImage.rotation.lr",
      isVisited: false,
      brief: {
        reasoning:
          "A left-right rotation is a combination of left rotation followed by right rotation done in AVL trees",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/data_structures_algorithms/avl_tree_algorithm.htm#:~:text=A%20left%2Dright%20rotation%20is,rotation%20followed%20by%20right%20rotation.&text=A%20node%20has%20been%20inserted,to%20perform%20left%2Dright%20rotation.">Resource Page</a>',
      },
    },
    4: {
      value: "dsaImage.avl.height balanced",
      isVisited: false,
      brief: {
        reasoning:
          "AVL Tree can be defined as height balanced binary search tree in which each node is associated with a balance factor.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/avl-tree#:~:text=AVL%20Tree%20can%20be%20defined,of%20its%20left%20sub%2Dtree.">Resource Page</a>',
      },
    },
    5: {
      value: "dsaImage.root left right.preorder",
      isVisited: false,
      brief: {
        reasoning:
          "Root node is traversed at the start for the PREORDER traversal",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/tree-traversal">Resource Page</a>',
      },
    },
    6: {
      value: "dsaImage.left root right.inorder",
      isVisited: false,
      brief: {
        reasoning: "Left Root Right is the traversal order",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/tree-traversal">Resource Page</a>',
      },
    },
    7: {
      value: "dsaImage.left right root.postorder",
      isVisited: false,
      brief: {
        reasoning:
          "Root node is traversed at the end for the POSTORDER traversal",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/tree-traversal">Resource Page</a>',
      },
    },
    8: {
      value: "dsaImage.non linear.tree",
      isVisited: false,
      brief: {
        reasoning:
          "A tree is a nonlinear data structure, compared to arrays, linked lists, stacks and queues which are linear data structures.",
        metadata:
          '<a target="_blank" href="https://www.cs.cmu.edu/~clo/www/CMU/DataStructures/Lessons/lesson4_1.htm#:~:text=A%20tree%20is%20a%20nonlinear,or%20one%20or%20more%20subtrees.">Resource Page</a>',
      },
    },
    9: {
      value: "dsaImage.perfect b Tree.2 childs",
      isVisited: false,
      brief: {
        reasoning:
          "A perfect binary tree is a type of binary tree in which every internal node has exactly two child nodes and all the leaf nodes are at the same level.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/perfect-binary-tree">Resource Page</a>',
      },
    },
    10: {
      value: "dsaImage.dfs.stack",
      isVisited: false,
      brief: {
        reasoning:
          "Depth First Search is a recursive algorithm for searching all the vertices of a graph or tree data structure & is implemented by STACK",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/graph-dfs">Resource Page</a>',
      },
    },
    11: {
      value: "dsaImage.bfs.queue",
      isVisited: false,
      brief: {
        reasoning: "Breadth First Search is implemented by a queue",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/graph-bfs">Resource Page</a>',
      },
    },
    12: {
      value: "dsaImage.shortest path.dijkstra's algo",
      isVisited: false,
      brief: {
        reasoning:
          "Dijkstra's algorithm allows us to find the shortest path between any two vertices of a graph. It differs from the minimum spanning tree because the shortest distance between two vertices might not include all the vertices of the graph.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/dijkstra-algorithm">Resource Page</a>',
      },
    },
    13: {
      value: "dsaImage.negative weight.bellman ford algo",
      isVisited: false,
      brief: {
        reasoning:
          "Dijkstra's algorithm allows us to find the shortest path between any two vertices of a graph. ",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/dijkstra-algorithm">Resource Page</a>',
      },
    },
    14: {
      value: "dsaImage.bst.sorted inorder",
      isVisited: false,
      brief: {
        reasoning:
          "InOrder traversal prints nodes of a binary search tree in the sorted order but only if a given tree is a binary search tree.",
        metadata:
          '<a target="_blank" href="https://medium.com/javarevisited/how-to-print-nodes-of-a-binary-search-tree-in-sorted-order-8a4e52eb8856#:~:text=The%20inOrder()%20the%20method,is%20a%20binary%20search%20tree.">Resource Page</a>',
      },
    },
    15: {
      value: "dsaImage.full btree.0/2 child",
      isVisited: false,
      brief: {
        reasoning:
          "A full Binary tree is a special type of binary tree in which every parent node/internal node has either two or no children.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/full-binary-tree">Resource Page</a>',
      },
    },
    16: {
      value: "dsaImage.degree.no of children",
      isVisited: false,
      brief: {
        reasoning:
          "The total number of children of a node is called a Degree of that Node.",
        metadata:
          '<a target="_blank" href="https://www.thedshandbook.com/trees/#:~:text=Degree%3A%20The%20total%20number%20of,bottom%20is%20called%20a%20Level.">Resource Page</a>',
      },
    },
    17: {
      value: "dsaImage.postfix.reverse polish",
      isVisited: false,
      brief: {
        reasoning:
          "RPN is a method for representing expressions in which the operator symbol is placed after the arguments being operated on.",
        metadata:
          '<a target="_blank" href="https://mathworld.wolfram.com/ReversePolishNotation.html#:~:text=Reverse%20Polish%20notation%20(RPN)%20is,the%20Polish%20mathematician%20Jan%20Lucasiewicz.">Resource Page</a>',
      },
    },
    18: {
      value: "dsaImage.n^(n-2).total spanning trees",
      isVisited: false,
      brief: {
        reasoning: "",
        metadata: '<a target="_blank" href="">Resource Page</a>',
      },
    },
    19: {
      value: "dsaImage.ford fulkerson algo.source & sink",
      isVisited: false,
      brief: {
        reasoning:
          "A complete graph can have maximum n^(n-2) number of spanning trees.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/data_structures_algorithms/spanning_tree.htm#:~:text=Spanning%20tree%20has%20n%2D1,2%20number%20of%20spanning%20trees.">Resource Page</a>',
      },
    },
    20: {
      value: "dsaImage.chaining.hashing",
      isVisited: false,
      brief: {
        reasoning:
          "In chaining, if a hash function produces the same index for multiple elements, these elements are stored in the same index by using a doubly-linked list.",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/hash-table">Resource Page</a>',
      },
    },
    21: {
      value: "dsaImage.ab+.postfix",
      isVisited: false,
      brief: {
        reasoning:
          "In postfix notation, the operator appears after the operands, i.e., the operator between operands is taken out & is attached after operands.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/what-is-postfix-notation#:~:text=In%20postfix%20notation%2C%20the%20operator,%2B%20c)%20into%20Postfix%20form.&text=Example2%20%E2%88%92%20Convert%20a%20%2B%20(b,c)%20is%20in%20Postfix%20form.">Resource Page</a>',
      },
    },
    22: {
      value: "dsaImage.-*cda.prefix",
      isVisited: false,
      brief: {
        reasoning:
          "In prefix notation, operator is prefixed to operands, i.e. operator is written ahead of operands.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/prefix-and-postfix-expressions-in-data-structure#:~:text=Prefix%20Notation,also%20known%20as%20Polish%20Notation.">Resource Page</a>',
      },
    },
    23: {
      value: "dsaImage.pivot.quick sort",
      isVisited: false,
      brief: {
        reasoning:
          "Quicksort picks an element as pivot, and then it partitions the given array around the picked pivot element.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/quick-sort#:~:text=Quicksort%20picks%20an%20element%20as,are%20greater%20than%20the%20pivot.">Resource Page</a>',
      },
    },
    24: {
      value: "dsaImage.binary search.o(log n)",
      isVisited: false,
      brief: {
        reasoning:
          "The time complexity of the binary search algorithm is O(log n).",
        metadata:
          '<a target="_blank" href="https://www.upgrad.com/blog/binary-search-algorithm/#:~:text=The%20time%20complexity%20of%20the,values%20not%20in%20the%20list.">Resource Page</a>',
      },
    },
    25: {
      value: "dsaImage.selection sort.o(n^2)",
      isVisited: false,
      brief: {
        reasoning:
          "In selection sort, there are 2 loops so the complexity is n*n = n2 .",
        metadata:
          '<a target="_blank" href="https://www.programiz.com/dsa/selection-sort#:~:text=Selection%20Sort%20Complexity&text=There%20are%202%20loops%20so,n*n%20%3D%20n2%20.&text=If%20we%20want%20to%20sort,then%2C%20the%20worst%20case%20occurs.&text=It%20occurs%20when%20the%20elements,(neither%20ascending%20nor%20descending).">Resource Page</a>',
      },
    },
    // dbms
    26: {
      value: "dbmsImage.ddl.alter",
      isVisited: false,
      brief: {
        reasoning:
          "The ALTER command is a DDL command to modify the structure of existing tables in the database by adding, modifying, renaming, or dropping columns and constraints.  ",
        metadata:
          '<a target="_blank" href="https://www.tutorialsteacher.com/sql/sql-alter-table#:~:text=The%20ALTER%20command%20is%20a,columns%20using%20the%20ALTER%20command.">Resource Page</a>',
      },
    },
    27: {
      value: "dbmsImage.dcl.grant",
      isVisited: false,
      brief: {
        reasoning:
          "REVOKE is a DCL command that is used to revoke the permissions/access that was granted via the GRANT command.",
        metadata:
          '<a target="_blank" href="https://www.scaler.com/topics/dcl/#:~:text=REVOKE%3A%20REVOKE%20is%20a%20DCL,to%20carry%20out%20specific%20tasks.">Resource Page</a>',
      },
    },
    28: {
      value: "dbmsImage.dml.insert",
      isVisited: false,
      brief: {
        reasoning:
          "The insert command is used for inserting one or more rows into a database table with specified table column values.",
        metadata:
          '<a target="_blank" href="https://www.techopedia.com/definition/5126/insert-sql#:~:text=Insert%20is%20a%20widely%2Dused,with%20specified%20table%20column%20values.">Resource Page</a>',
      },
    },
    29: {
      value: "dbmsImage.tcl.savepoint",
      isVisited: false,
      brief: {
        reasoning:
          "The SAVEPOINT command in TCL is basically used to temporarily save a transaction so that we can roll back to that point (saved point) whenever required.",
        metadata:
          '<a target="_blank" href="https://www.scaler.com/topics/tcl-commands-in-sql/#:~:text=The%20SAVEPOINT%20command%20in%20TCL,(saved%20point)%20whenever%20required.">Resource Page</a>',
      },
    },
    30: {
      value: "dbmsImage.select operator.select rows",
      isVisited: false,
      brief: {
        reasoning:
          "A selection operator (σ) is a unary operator in relational algebra. We use it to select the relation's records or rows that satisfy its condition(s).",
        metadata:
          '<a target="_blank" href="https://www.educative.io/answers/what-is-the-selection-operation-in-dbms#:~:text=A%20selection%20operator%20(%CF%83)%20is,satisfy%20its%20condition(s).">Resource Page</a>',
      },
    },
    31: {
      value: "dbmsImage.projection operator.select columns",
      isVisited: false,
      brief: {
        reasoning:
          "Projection operation (represented by π ) belongs to relational algebra, which displays the specific column of a table mentioned in the query.",
        metadata:
          '<a target="_blank" href="https://www.educative.io/answers/what-is-projection-operation-in-dbms#:~:text=Projection%20operation%20(represented%20by%20%CF%80,with%20certain%20attributes%20left%20out.">Resource Page</a>',
      },
    },
    32: {
      value: "dbmsImage.aggregate func.count()",
      isVisited: false,
      brief: {
        reasoning:
          "The COUNT() function returns the number of rows that matches a specified criterion.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/sql/sql_count_avg_sum.asp">Resource Page</a>',
      },
    },
    33: {
      value: "dbmsImage.join.outer",
      isVisited: false,
      brief: {
        reasoning:
          "Outer joins are joins that return matched values and unmatched values from either or both tables.",
        metadata:
          '<a target="_blank" href="https://mode.com/sql-tutorial/sql-outer-joins/#:~:text=Outer%20joins%20are%20joins%20that,matched%20rows%20in%20both%20tables.">Resource Page</a>',
      },
    },
    34: {
      value: "dbmsImage.as clause.renaming",
      isVisited: false,
      brief: {
        reasoning:
          "AS clause in SQL is used to give a new name to a column or a table in a database. ",
        metadata:
          '<a target="_blank" href="https://www.scaler.com/topics/as-clause-is-used-in-sql-for/#:~:text=We%20use%20the%20AS%20clause,the%20duration%20of%20the%20query.">Resource Page</a>',
      },
    },
    35: {
      value: "dbmsImage.dual.system table",
      isVisited: false,
      brief: {
        reasoning:
          "Dual is a table that is automatically created by Oracle Database along with the data dictionary.",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/dual-table-in-sql/">Resource Page</a>',
      },
    },
    36: {
      value: "dbmsImage.not null.primary key",
      isVisited: false,
      brief: {
        reasoning:
          "When a PRIMARY KEY is defined then the database server also silently creates a NOT NULL constraint on the same column.",
        metadata:
          '<a target="_blank" href="https://www.ibm.com/docs/SSGU8G_14.1.0/com.ibm.sqls.doc/ids_sqs_0515.htm#:~:text=When%20you%20define%20a%20PRIMARY,specify%20the%20NOT%20NULL%20constraint.">Resource Page</a>',
      },
    },
    37: {
      value: "dbmsImage.mysql.rdbms",
      isVisited: false,
      brief: {
        reasoning:
          "RDBMS is the basis for all modern database systems such as MySQL, Microsoft SQL Server, Oracle, and Microsoft Access.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/mysql/mysql_rdbms.asp#:~:text=RDBMS%20is%20a%20program%20used,the%20data%20in%20the%20database.">Resource Page</a>',
      },
    },
    38: {
      value: "dbmsImage.no sql.mongodb",
      isVisited: false,
      brief: {
        reasoning:
          "MongoDB is an open source NoSQL database management program.",
        metadata:
          '<a target="_blank" href="https://www.techtarget.com/searchdatamanagement/definition/MongoDB#:~:text=MongoDB%20is%20an%20open%20source,large%20sets%20of%20distributed%20data.">Resource Page</a>',
      },
    },
    39: {
      value: "dbmsImage.view.virtual table",
      isVisited: false,
      brief: {
        reasoning:
          "Views in SQL are considered as a virtual table. A view also contains rows and columns.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/dbms-sql-view">Resource Page</a>',
      },
    },
    40: {
      value: "dbmsImage.olap.data warehouse",
      isVisited: false,
      brief: {
        reasoning:
          "Online Analytical Processing Server (OLAP) is based on the multidimensional database model.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/dwh/dwh_olap.htm">Resource Page</a>',
      },
    },
    41: {
      value: "dbmsImage.database.oltp",
      isVisited: false,
      brief: {
        reasoning:
          "OLTP (Online Transactional Processing) is a type of data processing that executes transaction-focused tasks.",
        metadata:
          '<a target="_blank" href="https://www.snowflake.com/data-cloud-glossary/oltp/#:~:text=OLTP%20(Online%20Transactional%20Processing)%20is,entry%2C%20retail%20sales%20and%20CRM.">Resource Page</a>',
      },
    },
    42: {
      value: "dbmsImage.clustering.k-means",
      isVisited: false,
      brief: {
        reasoning:
          "K-means clustering is the most common partitioning algorithm.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/what-is-k-means-clustering#:~:text=Data%20MiningDatabaseData%20Structure,measure%20of%20distance%20or%20similarity.">Resource Page</a>',
      },
    },
    43: {
      value: "dbmsImage.apriori algo.market-basket analysis",
      isVisited: false,
      brief: {
        reasoning:
          "Apriori Algorithm is a widely-used and well-known Association Rule algorithm and is a popular algorithm used in market basket analysis.",
        metadata:
          '<a target="_blank" href="https://towardsdatascience.com/data-mining-market-basket-analysis-with-apriori-algorithm-970ff256a92c">Resource Page</a>',
      },
    },
    44: {
      value: "dbmsImage.kdd.mining process",
      isVisited: false,
      brief: {
        reasoning:
          "KDD is the systematic process of identifying valid, practical, and understandable patterns in massive and complicated data sets.",
        metadata:
          '<a target="_blank" href="https://www.naukri.com/learning/articles/kdd-in-data-mining/">Resource Page</a>',
      },
    },
    45: {
      value: "dbmsImage.dbscan.clustering",
      isVisited: false,
      brief: {
        reasoning:
          "DBSCAN stands for Density-Based Spatial Clustering of Applications with Noise.",
        metadata:
          '<a target="_blank" href="https://towardsdatascience.com/dbscan-clustering-explained-97556a2ad556">Resource Page</a>',
      },
    },
    46: {
      value: "dbmsImage.like%e.niceGame",
      isVisited: false,
      brief: {
        reasoning:
          "The LIKE command is used in a WHERE clause to search for a specified pattern in a column.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/sql/sql_like.asp">Resource Page</a>',
      },
    },
    47: {
      value: "dbmsImage.backend.utility",
      isVisited: false,
      brief: {
        reasoning:
          "A database management system (DBMS) is software to create and manage databases ie backend functions",
        metadata:
          '<a target="_blank" href="https://www.techtarget.com/searchdatamanagement/definition/database-management-system">Resource Page</a>',
      },
    },
    48: {
      value: "dbmsImage.select sysdate.from DUAL",
      isVisited: false,
      brief: {
        reasoning:
          "SYSDATE is an Oracle built-in function that returns the current date and time.",
        metadata:
          '<a target="_blank" href="https://www.oreilly.com/library/view/oracle-sqlplus-the/0596007469/ch07s02.html#:~:text=COLUMN%20SYSDATE%20NEW_VALUE%20report_date%20SELECT,always%20contains%20exactly%20one%20column.">Resource Page</a>',
      },
    },
    49: {
      value: "dbmsImage.bcnf.normalization",
      isVisited: false,
      brief: {
        reasoning:
          "Boyce-Codd Normal Form (BCNF): Boyce–Codd Normal Form (BCNF) is based on functional dependencies that take into account all candidate keys",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/boyce-codd-normal-form-bcnf/">Resource Page</a>',
      },
    },
    50: {
      value: "dbmsImage.12 rules.ef codd",
      isVisited: false,
      brief: {
        reasoning:
          "EF Codd's rules are designed to define what is required from a database management system in order for it to be considered relational",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/dbms/dbms_codds_rules.htm">Resource Page</a>',
      },
    },
    // os
    51: {
      value: "osImage.context switching.dispatcher",
      isVisited: false,
      brief: {
        reasoning:
          "Dispatcher resides at main memory. It plays a role in context switching. It switches the process from kernel mode to user mode.",
        metadata:
          '<a target="_blank" href="https://mycareerwise.com/content/context-switch-and-dispatcher/content/exam/gate/computer-science#:~:text=It%20is%20a%20small%20program,kernel%20mode%20to%20user%20mode.">Resource Page</a>',
      },
    },
    52: {
      value: "osImage.traps.synchronous",
      isVisited: false,
      brief: {
        reasoning:
          "A trap is a synchronous interrupt triggered by an exception in a user process to execute functionality.",
        metadata:
          '<a target="_blank" href="https://www.baeldung.com/cs/os-trap-vs-interrupt#:~:text=A%20trap%20is%20a%20synchronous,OS%20to%20a%20kernel%20routine.">Resource Page</a>',
      },
    },
    53: {
      value: "osImage.belady's anomaly.fifo",
      isVisited: false,
      brief: {
        reasoning:
          "Belady’s anomaly is the name given to the phenomenon where increasing the number of page frames results in an increase in the number of page faults",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/beladys-anomaly-in-page-replacement-algorithms/">Resource Page</a>',
      },
    },
    54: {
      value: "osImage.jitter.delay",
      isVisited: false,
      brief: {
        reasoning:
          "Jitter is the interference experienced by an application because of the scheduling of background daemon processes and the handling of asynchronous events like interrupts.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/latency-vs-jitter#:~:text=What%20is%20Jitter%3F,via%20the%20network%20is%20delayed.">Resource Page</a>',
      },
    },
    55: {
      value: "osImage.thread.msdos",
      isVisited: false,
      brief: {
        reasoning: "MS-DOS OS supports one thread, one process approach.",
        metadata:
          '<a target="_blank" href="https://www.tutorialspoint.com/what-is-a-multithreading-model-in-os#:~:text=One%20process%2C%20one%20thread%20%E2%88%92%20It,into%20a%20number%20of%20threads.">Resource Page</a>',
      },
    },
    56: {
      value: "osImage.scheduling algo.gannt chart",
      isVisited: false,
      brief: {
        reasoning:
          "A Gantt chart is a visual representation of scheduled activities within a defined time interval. ",
        metadata:
          '<a target="_blank" href="https://www.techtarget.com/searchsoftwarequality/definition/Gantt-chart#:~:text=A%20Gantt%20chart%20is%20a,track%20tasks%20in%20a%20project.">Resource Page</a>',
      },
    },
    57: {
      value: "osImage.preemptive.srtf",
      isVisited: false,
      brief: {
        reasoning:
          "SRTF, is a scheduling method that is a preemptive version of shortest job next scheduling.",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Shortest_remaining_time#:~:text=Shortest%20remaining%20time%2C%20also%20known,completion%20is%20selected%20to%20execute.">Resource Page</a>',
      },
    },
    58: {
      value: "osImage.non preemptive.sjf",
      isVisited: false,
      brief: {
        reasoning:
          "SJF is a Scheduling Algorithm where the process are executed in ascending order of their burst time.",
        metadata:
          '<a target="_blank" href="https://prepinsta.com/operating-systems/shortest-job-first-scheduling-non-preemptive/#:~:text=Shortest%20Job%20First%20(SJF)%20%E2%80%93%20Non%20Preemptive&text=Shortest%20Job%20First%20(SJF)%20is,of%20each%20process%20in%20advance.">Resource Page</a>',
      },
    },
    59: {
      value: "osImage.fcfs.highest priority",
      isVisited: false,
      brief: {
        reasoning:
          "FCFS algorithm has the highest priority among all other scheduling algorothms",
        metadata:
          '<a target="_blank" href="https://www.guru99.com/fcfs-scheduling.html">Resource Page</a>',
      },
    },
    60: {
      value: "osImage.aging.avoid starvation",
      isVisited: false,
      brief: {
        reasoning:
          "Aging is used to ensure that jobs with lower priority will eventually complete their execution.",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Aging_(scheduling)#:~:text=Aging%20is%20used%20to%20ensure,waits%20in%20the%20ready%20queue.">Resource Page</a>',
      },
    },
    61: {
      value: "osImage.deadlock.rag",
      isVisited: false,
      brief: {
        reasoning:
          "RAG is a directed graph that can be used to illustrate the state of a system graphically.",
        metadata:
          '<a target="_blank" href="https://byjus.com/gate/deadlock-detection-using-rag-notes/#:~:text=In%20computer%20operating%20systems%2C%20RAG,to%20describe%20deadlocks%20more%20precisely.">Resource Page</a>',
      },
    },
    62: {
      value: "osImage.banker's algo.deadlock avoidance",
      isVisited: false,
      brief: {
        reasoning:
          "The banker's algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety.",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/bankers-algorithm-in-operating-system-2/">Resource Page</a>',
      },
    },
    63: {
      value: "osImage.logical address.virtual address",
      isVisited: false,
      brief: {
        reasoning:
          "Since a logical address does not physically exists it is also known as a virtual address.",
        metadata:
          '<a target="_blank" href="https://eng.libretexts.org/Courses/Delta_College/Operating_System%3A_The_Basics/07%3A_Memory/7.5%3A_Logical_vs_Physical_Address#:~:text=A%20logical%20address%20is%20generated,the%20actual%20physical%20memory%20location.">Resource Page</a>',
      },
    },
    64: {
      value: "osImage.light weight process.thread",
      isVisited: false,
      brief: {
        reasoning:
          "Threads are called lightweight processes because they have their own stack but can access shared data.",
        metadata:
          '<a target="_blank" href="https://www.backblaze.com/blog/whats-the-diff-programs-processes-and-threads/#:~:text=Some%20people%20call%20threads%20lightweight,to%20communicate%20between%20the%20threads.">Resource Page</a>',
      },
    },
    65: {
      value: "osImage.real time os.atc",
      isVisited: false,
      brief: {
        reasoning: "Air Traffic Control is an example of real time OS",
        metadata:
          '<a target="_blank" href="https://ran-bajra.medium.com/real-time-system-introduction-1825317b3761#:~:text=Typical%20examples%20of%20real%2Dtime,%2C%20games%2Cstock%20market%20etc.">Resource Page</a>',
      },
    },
    66: {
      value: "osImage.swapping.process switching",
      isVisited: false,
      brief: {
        reasoning:
          "Swapping is a memory management method in which the processes are switched from the RAM to the secondary memory.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/swapping-vs-context-switching#:~:text=What%20is%20Swapping%3F,the%20utilization%20of%20main%20memory.">Resource Page</a>',
      },
    },
    67: {
      value: "osImage.volatile.main memory",
      isVisited: false,
      brief: {
        reasoning:
          "RAM is volatile memory used to hold instructions and data of currently running programs.",
        metadata:
          '<a target="_blank" href="https://www.sciencedirect.com/topics/computer-science/volatile-memory#:~:text=RAM%20is%20volatile%20memory%20used,integrity%20after%20loss%20of%20power.">Resource Page</a>',
      },
    },
    68: {
      value: "osImage.paging.frames",
      isVisited: false,
      brief: {
        reasoning:
          "Paging is a storage mechanism used in OS to retrieve processes from secondary storage to the main memory as pages.",
        metadata:
          '<a target="_blank" href="https://byjus.com/gate/paging-in-operating-system-notes/#:~:text=Paging%20in%20OS-,What%20is%20Paging%20in%20the%20OS%3F,also%20be%20separated%20into%20frames.">Resource Page</a>',
      },
    },
    69: {
      value: "osImage.tlb.cache buffer",
      isVisited: false,
      brief: {
        reasoning:
          "TLB is a memory cache that stores the recent translations of virtual memory to physical memory. ",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Translation_lookaside_buffer#:~:text=A%20translation%20lookaside%20buffer%20(TLB,%2Dmanagement%20unit%20(MMU).">Resource Page</a>',
      },
    },
    70: {
      value: "osImage.fragmentation.compaction",
      isVisited: false,
      brief: {
        reasoning:
          "Compaction is another method for removing external fragmentation.",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/fragmentation-in-operating-system#:~:text=Compaction%20is%20another%20method%20for,requirements%20of%20the%20new%20processes.">Resource Page</a>',
      },
    },
    71: {
      value: "osImage.thrashing.page fault",
      isVisited: false,
      brief: {
        reasoning:
          "Thrashing occurs when a computer's virtual memory resources are overused, leading to a constant state of paging and page faults.",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/Thrashing_(computer_science)#:~:text=In%20computer%20science%2C%20thrashing%20occurs,computer%20to%20degrade%20or%20collapse.">Resource Page</a>',
      },
    },
    72: {
      value: "osImage.fat.indexed allocation",
      isVisited: false,
      brief: {
        reasoning:
          "FAT is an index table stored on the device to identify chains of data storage areas associated with a file, the File Allocation Table (FAT)",
        metadata:
          '<a target="_blank" href="https://en.wikipedia.org/wiki/File_Allocation_Table#:~:text=The%20file%20system%20uses%20an,contiguous%20area%20of%20disk%20storage.">Resource Page</a>',
      },
    },
    73: {
      value: "osImage.platters.hard disk",
      isVisited: false,
      brief: {
        reasoning:
          "A platter is a circular magnetic plate that is used for storing data in a hard disk.",
        metadata:
          '<a target="_blank" href="https://www.techopedia.com/definition/31320/platter#:~:text=A%20platter%20is%20a%20circular,mounted%20on%20the%20same%20spindle.">Resource Page</a>',
      },
    },
    74: {
      value: "osImage.raid.7 levels",
      isVisited: false,
      brief: {
        reasoning:
          'RAID is an acronym for "Redundant Array of Inexpensive Disks".',
        metadata:
          '<a target="_blank" href="https://www.fujitsu.com/global/products/computing/storage/eternus/glossary/raid/feature.html#:~:text=What%20is%20RAID%3F,HDDs%20into%20a%20single%20HDD.%22">Resource Page</a>',
      },
    },
    75: {
      value: "osImage.android.windows",
      isVisited: false,
      brief: {
        reasoning: "Android and windows, both are operaing systems",
        metadata:
          '<a target="_blank" href="https://www.javatpoint.com/android-vs-windows-os">Resource Page</a>',
      },
    },
    // electroneum
    76: {
      value: "electroneumImage.transportation.bridges",
      isVisited: false,
      brief: {
        reasoning:
          "Bridges offer a way for isolated blockchain environments to connect with each other. They establish a transportation route between blockchains where tokens, messages, arbitrary data, and even smart contract calls can be transferred from one chain to another.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/bridges#:~:text=transportation%20route%20between%20blockchains">Resource Page</a>',
      },
    },
    77: {
      value: "electroneumImage.burn.mint",
      isVisited: false,
      brief: {
        reasoning:
          "Burn assets on the source chain and mint assets on the destination chain. It is one of the ways to  facilitate the cross-chain transfer of assets ",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/bridges#:~:text=Burn%20assets%20on%20the%20source%20chain%20and%20mint%20assets%20on%20the%20destination%20chain">Resource Page</a>',
      },
    },
    78: {
      value: "electroneumImage.fraud proofs.nomad",
      isVisited: false,
      brief: {
        reasoning:
          "Generalised message passing bridges excel with security and the ability to transfer more complex data across chains. Nomad is an optimistic bridge that use fraud proofs.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/bridges#:~:text=optimistic%20bridges%20(ex:%20Nomad)%20that%20use%20fraud%20proofs">Resource Page</a>',
      },
    },
    79: {
      value: "electroneumImage.oracles.data feeds",
      isVisited: false,
      brief: {
        reasoning:
          "Oracles are data feeds that bring data from off the blockchain (off-chain) data sources and puts it on the blockchain (on-chain) for smart contracts to use.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/oracles#:~:text=data%20feeds%20that%20bring%20data%20from%20off%20the%20blockchain">Resource Page</a>',
      },
    },
    80: {
      value: "electroneumImage.deterministic.systme",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum is deterministic. A deterministic system↗ is one that always produces the same results given an initial state and a particular input—there is no randomness or variation in the process of computing outputs from inputs.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/oracles#:~:text=always%20produces%20the%20same%20results%20given%20an%20initial%20state%20and%20a%20particular%20input">Resource Page</a>',
      },
    },
    81: {
      value: "electroneumImage.oracle.problem",
      isVisited: false,
      brief: {
        reasoning:
          "The so-called “oracle problem” demonstrates the issues that come with using blockchain oracles to send inputs to smart contracts. It is critical to make sure that data from an oracle is correct or smart contract execution will produce erroneous results. Also important is the need for trustlessness—having to ‘trust’ oracle operators",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/advanced/oracles#:~:text=oracle%20is%20correct%20or%20smart%20contract%20execution%20will%20produce%20erroneous%20results">Resource Page</a>',
      },
    },
    82: {
      value: "electroneumImage.mainnet.52014",
      isVisited: false,
      brief: {
        reasoning:
          "The chain ID is an integer that defines which EVM compatible network to connect to. Electroneum Smart Chain mainnet has chain ID 52014.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/getting-started/introduction#:~:text=Electroneum%20Smart%20Chain%20mainnet%20has%20chain%20ID%2052014">Resource Page</a>',
      },
    },
    83: {
      value: "electroneumImage.clef.mgmt tool",
      isVisited: false,
      brief: {
        reasoning:
          "Clef is recommended as an external account management and signing tool. It can be run decoupled from Etn-sc and can even be run on dedicated secure external hardware such as a VM or a secure USB drive.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/security#:~:text=external%20account%20management%20and%20signing%20tool">Resource Page</a>',
      },
    },
    84: {
      value: "electroneumImage.sync mode.catch up",
      isVisited: false,
      brief: {
        reasoning:
          "Syncing is the process by which Etn-sc catches up to the latest Electroneum block and current global state. There are several ways to sync a Etn-sc node that differ in their speed, storage requirements and trust assumptions",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/sync-modes#:~:text=catches%20up%20to%20the%20latest%20Electroneum%20block">Resource Page</a>',
      },
    },
    85: {
      value: "electroneumImage.128 block.snap",
      isVisited: false,
      brief: {
        reasoning:
          "Snap sync starts from a relatively recent block and syncs from there to the head of the chain, keeping only the most recent 128 block states in memory. Between the initial sync block and the 128 most recent blocks, the node stores occasional snapshots that can be used",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/sync-modes#:~:text=keeping%20only%20the%20most%20recent%20128%20block%20states%20in%20memory">Resource Page</a>',
      },
    },
    86: {
      value: "electroneumImage.full block.sync",
      isVisited: false,
      brief: {
        reasoning:
          "A full block-by-block sync generates the current state by executing every block starting from the genesis block. A full sync independently verifies block provenance as well as all state transitions by re-executing the transactions in the entire historical sequence of blocks.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/sync-modes#:~:text=generates%20the%20current%20state%20by%20executing%20every%20block%20starting%20from%20the%20genesis%20block">Resource Page</a>',
      },
    },
    87: {
      value: "electroneumImage.light node.only headers",
      isVisited: false,
      brief: {
        reasoning:
          "A light node syncs very quickly and stores the bare minimum of blockchain data. Light nodes only process block headers, not entire blocks. This greatly reduces the computation time, storage and bandwidth required relative to a full node.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/sync-modes#:~:text=stores%20the%20bare%20minimum%20of%20blockchain%20data">Resource Page</a>',
      },
    },
    88: {
      value: "electroneumImage.clef.master seed",
      isVisited: false,
      brief: {
        reasoning:
          "The first time Clef is used it needs to be initialised with a master seed that unlocks Clef's secure vault and a path where the vault should be located.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/account-management#:~:text=initialised%20with%20a%20master%20seed">Resource Page</a>',
      },
    },
    89: {
      value: "electroneumImage.freezer.database",
      isVisited: false,
      brief: {
        reasoning:
          "Etn-sc divides its database into two parts. Recent blocks and state data are kept in quick-access storage, but older blocks and receipts ('ancients') are stored in a 'freezer' database. The point of this separation is to minimise the dependency on expensive, sensitive SSDs, and instead push the less frequently-accessed data into a database",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/databases#:~:text=older%20blocks%20and%20receipts">Resource Page</a>',
      },
    },
    90: {
      value: "electroneumImage.pruning.80% disk space",
      isVisited: false,
      brief: {
        reasoning:
          "To prune a Etn-sc node at least 40 GB of free disk space is recommended. This means pruning cannot be used to save a hard drive that has been completely filled. A good rule of thumb is to prune before the node fills ~80% of the available disk space.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/pruning#:~:text=before%20the%20node%20fills">Resource Page</a>',
      },
    },
    91: {
      value: "electroneumImage.pruning.snapshots",
      isVisited: false,
      brief: {
        reasoning:
          "Pruning uses snapshots of the state database as an indicator to determine which nodes in the state trie can be kept and which ones are stale and can be discarded.",
        metadata:
          '<a target="_blank" href="https://developer.electroneum.com/etn-sc-client/fundamentals/pruning#:~:text=an%20indicator%20to%20determine%20which%20nodes%20in%20the%20state%20trie%20can%20be%20kept">Resource Page</a>',
      },
    },
    92: {
      value: "electroneumImage.por.validator nodes",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum uses Proof of Responsibility (PoR) instead of traditional Proof of Work. Validator nodes are run by trusted NGOs and institutions, ensuring stability, energy efficiency, and compliance.",
      },
    },
    93: {
      value: "electroneumImage.atomic swaps.cross chain",
      isVisited: false,
      brief: {
        reasoning:
          "Atomic swaps allow direct ETN exchanges between different blockchains without a third party. This enhances decentralization and interoperability, improving liquidity across networks.",
      },
    },
    94: {
      value: "electroneumImage.smart contracts.evm",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum supports smart contracts by integrating an Ethereum Virtual Machine (EVM) layer. This enables compatibility with Ethereum-based dApps while keeping ETN’s blockchain lightweight.",
      },
    },
    95: {
      value: "electroneumImage.off chain scaling.payment channels",
      isVisited: false,
      brief: {
        reasoning:
          "Off-chain scaling solutions like payment channels allow ETN transactions to occur instantly without requiring full blockchain validation. This reduces congestion and transaction fees.",
      },
    },
    96: {
      value: "electroneumImage.oracle.data feeds",
      isVisited: false,
      brief: {
        reasoning:
          "Oracles enable Electroneum smart contracts to access external real-world data, such as currency exchange rates, making blockchain applications more dynamic and functional.",
      },
    },
    97: {
      value: "electroneumImage.sidechains.custom blockchain",
      isVisited: false,
      brief: {
        reasoning:
          "Sidechains allow separate blockchains to run alongside Electroneum's main network, offering custom smart contract execution and faster, specialized transaction processing.",
      },
    },
    98: {
      value: "electroneumImage.ring signatures.transaction privacy",
      isVisited: false,
      brief: {
        reasoning:
          "Ring signatures obscure the sender in ETN transactions by mixing their signature with others. This enhances privacy while keeping transactions verifiable.",
      },
    },
    99: {
      value: "electroneumImage.instant payment system.zero confirmation",
      isVisited: false,
      brief: {
        reasoning:
          "Electroneum’s Instant Payment System allows merchants to accept ETN payments instantly, even before on-chain confirmation, reducing wait times and improving usability.",
      },
    },
    100: {
      value: "electroneumImage.hybrid consensus.combining por pos",
      isVisited: false,
      brief: {
        reasoning:
          "A hybrid consensus model that blends Proof of Responsibility (PoR) with Proof of Stake (PoS) could enhance Electroneum’s network security, decentralization, and energy efficiency by allowing stakers to participate alongside trusted validators.",
      },
    },
    // js
    101: {
      value: "jsImage.hoisting.declarations at top",
      isVisited: false,
      brief: {
        reasoning:
          "Hoisting is JavaScript's default behavior of moving declarations to the top.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_hoisting.asp">Resource Page</a>',
      },
    },
    102: {
      value: "jsImage.let.const",
      isVisited: false,
      brief: {
        reasoning:
          "Scopes & the ability of re-declarations are the major difference between LET & CONST in javascript",
        metadata:
          '<a target="_blank" href="https://www.freecodecamp.org/news/var-let-and-const-whats-the-difference/">Resource Page</a>',
      },
    },
    103: {
      value: "jsImage.===.strict equality",
      isVisited: false,
      brief: {
        reasoning:
          "The strict equality (===) operator checks whether its two operands are equal, returning a Boolean result.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality">Resource Page</a>',
      },
    },
    104: {
      value: "jsImage.modules.seperate files",
      isVisited: false,
      brief: {
        reasoning:
          "JavaScript modules allow you to break up your code into separate files. This makes it easier to maintain a code-base.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_modules.asp">Resource Page</a>',
      },
    },
    105: {
      value: "jsImage.falsy value.undefined",
      isVisited: false,
      brief: {
        reasoning:
          "A falsy (sometimes written falsey) value is a value that is considered false when encountered in a Boolean context.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/Falsy">Resource Page</a>',
      },
    },
    106: {
      value: "jsImage.json.key value pair",
      isVisited: false,
      brief: {
        reasoning:
          "JavaScript Object Notation (JSON) is a standard text-based format for representing structured data based on JavaScript object syntax.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON">Resource Page</a>',
      },
    },
    107: {
      value: "jsImage.dev console.ctrl+shift+i",
      isVisited: false,
      brief: {
        reasoning:
          "The Developer Console is an integrated development environment (more typically called an IDE) where you can create, debug, and test apps in your org.",
        metadata:
          '<a target="_blank" href="https://www.digitalocean.com/community/tutorials/how-to-use-the-javascript-developer-console">Resource Page</a>',
      },
    },
    108: {
      value: "jsImage.iife.(fun())",
      isVisited: false,
      brief: {
        reasoning:
          "An IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Glossary/IIFE">Resource Page</a>',
      },
    },
    109: {
      value: "jsImage.arrow func.anonymous",
      isVisited: false,
      brief: {
        reasoning:
          "An arrow function expression is a compact alternative to a traditional function expression, with some semantic differences and deliberate limitations in usage",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions">Resource Page</a>',
      },
    },
    110: {
      value: "jsImage.array.bind method",
      isVisited: false,
      brief: {
        reasoning:
          "The bind() method creates a new function that, when called, has its this keyword set to the provided value.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Function/bind">Resource Page</a>',
      },
    },
    111: {
      value: "jsImage.closure.outer scope",
      isVisited: false,
      brief: {
        reasoning:
          "A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures">Resource Page</a>',
      },
    },
    112: {
      value: "jsImage.inline.function",
      isVisited: false,
      brief: {
        reasoning:
          "An inline function is a special type of anonymous function which is assigned to a variable, or in other words, an anonymous function with a name",
        metadata:
          '<a target="_blank" href="https://www.geeksforgeeks.org/what-is-the-inline-function-in-javascript/">Resource Page</a>',
      },
    },
    113: {
      value: "jsImage.dom.manipultaion",
      isVisited: false,
      brief: {
        reasoning:
          "Done by using the Document Object Model (DOM), a set of APIs for controlling HTML and styling information that makes heavy use of the Document object.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Manipulating_documents">Resource Page</a>',
      },
    },
    114: {
      value: "jsImage.eventlisteners.callback func",
      isVisited: false,
      brief: {
        reasoning:
          "The callback function itself has the same parameters and return value as the handleEvent() method; that is, the callback accepts a single parameter.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_event_listener_callback">Resource Page</a>',
      },
    },
    115: {
      value: "jsImage.this.keyword",
      isVisited: false,
      brief: {
        reasoning:
          "The value of this is determined by how a function is called (runtime binding). It can't be set by assignment during execution, and it may be different each time the function is called.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this">Resource Page</a>',
      },
    },
    116: {
      value: "jsImage.async.await",
      isVisited: false,
      brief: {
        reasoning:
          "The async function declaration declares an async function where the await keyword is permitted within the function body.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function">Resource Page</a>',
      },
    },
    117: {
      value: "jsImage.resolve.reject",
      isVisited: false,
      brief: {
        reasoning:
          "The Promise object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">Resource Page</a>',
      },
    },
    118: {
      value: "jsImage.browser.object model",
      isVisited: false,
      brief: {
        reasoning:
          'The Browser Object Model (BOM) allows JavaScript to "talk to" the browser.',
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_window.asp">Resource Page</a>',
      },
    },
    119: {
      value: "jsImage.window.innerheight",
      isVisited: false,
      brief: {
        reasoning:
          "The read-only innerHeight property of the Window interface returns the interior height of the window in pixels, including the height of the horizontal scroll bar, if present.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight">Resource Page</a>',
      },
    },
    120: {
      value: "jsImage.web.api",
      isVisited: false,
      brief: {
        reasoning:
          "Client-side JavaScript, in particular, has many APIs available to it — these are not part of the JavaScript language itself, rather they are built on top of the core JavaScript language.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Introduction#apis_in_client-side_javascript">Resource Page</a>',
      },
    },
    121: {
      value: "jsImage.web worker.background",
      isVisited: false,
      brief: {
        reasoning:
          "A web worker is a JavaScript that runs in the background, independently of other scripts, without affecting the performance of the page.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/html/html5_webworkers.asp">Resource Page</a>',
      },
    },
    122: {
      value: "jsImage.jquery.dom",
      isVisited: false,
      brief: {
        reasoning:
          "jQuery was created in 2006 by John Resig. It was designed to handle Browser Incompatibilities and to simplify HTML DOM Manipulation, Event Handling, Animations, and Ajax.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_jquery_dom.asp">Resource Page</a>',
      },
    },
    123: {
      value: "jsImage.canvas.graphs",
      isVisited: false,
      brief: {
        reasoning:
          "Chart.js is an free JavaScript library for making HTML-based charts. It is one of the simplest visualization libraries for JavaScript.",
        metadata:
          '<a target="_blank" href="https://www.w3schools.com/js/js_graphics_chartjs.asp">Resource Page</a>',
      },
    },
    124: {
      value: "jsImage.regex.pattern",
      isVisited: false,
      brief: {
        reasoning:
          "Regular expressions are patterns used to match character combinations in strings. In JavaScript, regular expressions are also objects.",
        metadata:
          '<a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">Resource Page</a>',
      },
    },
    125: {
      value: "jsImage.just in time.compilation",
      isVisited: false,
      brief: {
        reasoning:
          "Just-in-time compilation is a method for improving the performance of interpreted programs.",
        metadata:
          '<a target="_blank" href="https://www.freecodecamp.org/news/just-in-time-compilation-explained/">Resource Page</a>',
      },
    },
  },
};

// helper functions
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function isDuplicate(el) {
  let flag = false;
  currentlyFlipped.forEach((div) => {
    if (div == el) flag = true;
  });
  return flag;
}

function findIndex(arr, el) {
  let ans = "";
  ans = arr.findIndex((data) => data == el);
  return ans;
}

function populateLevelData() {
  // choose a random image from the backImages
  let imageType = backImages[randomNumber(0, 5)].split("/")[2].split(".")[0];

  let existsInObj = false;
  for (data in levelData) {
    if (data == imageType) {
      existsInObj = true;
      break;
    }
  }

  if (!existsInObj) levelData[imageType] = { value: 0 };

  for (questions in questionsAns[currentDifficulty]) {
    let randomIndex;
    switch (imageType) {
      case "dsa":
        randomIndex =
          currentDifficulty === "easy"
            ? randomNumber(1, 10)
            : randomNumber(1, 26);
        break;
      case "dbms":
        randomIndex =
          currentDifficulty === "easy"
            ? randomNumber(10, 19)
            : randomNumber(26, 51);
        break;
      case "os":
        randomIndex =
          currentDifficulty === "easy"
            ? randomNumber(19, 28)
            : randomNumber(51, 76);
        break;
      case "electroneum":
        randomIndex =
          currentDifficulty === "easy"
            ? randomNumber(28, 37)
            : randomNumber(76, 101);
        break;
      case "js":
        randomIndex =
          currentDifficulty === "easy"
            ? randomNumber(37, 46)
            : randomNumber(101, 126);
        break;
    }
    let curr = questionsAns[currentDifficulty][randomIndex];
    if (!curr.isVisited && curr.value.includes(imageType)) {
      curr.isVisited = true;

      levelData[imageType][levelData[imageType].value++] =
        curr.value.split(".")[1];
      levelData[imageType][levelData[imageType].value++] =
        curr.value.split(".")[2];

      break;
    }
  }
}

// populating the LEVELDATA array according to the tileset and other attributes
function populateLevelDataArray() {
  for (data in levelData) {
    for (let j = 0; j < levelData[data].value; j++) {
      levelDataArray.push(levelData[data][j]);
    }
    for (let j = 0; j < levelData[data].value / 2; j++) {
      switch (data) {
        case "dsa":
          levelDataArray.push("./img/dsa.png");
          break;
        case "dbms":
          levelDataArray.push("./img/dbms.jpg");
          break;
        case "os":
          levelDataArray.push("./img/os.jpg");
          break;
        case "electroneum":
          levelDataArray.push("./img/electroneum.png");
          break;
        case "js":
          levelDataArray.push("./img/js.png");
          break;
      }
    }
  }
}

function findEleIndex(str) {
  return correctOrderAnsArray.findIndex((el) => el.includes(str));
}

let arrayForHints = [];
let correctOrderAnsArray = [];

function makeHintsArray() {
  let imageIndex = findEleIndex("./img");

  switch (imageIndex) {
    case 2:
      if (correctOrderAnsArray[5].includes("./img")) {
        arrayForHints.push(
          `${correctOrderAnsArray[0]}-${correctOrderAnsArray[1]}-${correctOrderAnsArray[2]}`
        );
        arrayForHints.push(
          `${correctOrderAnsArray[3]}-${correctOrderAnsArray[4]}-${correctOrderAnsArray[5]}`
        );
        arrayForHints.push(
          `${correctOrderAnsArray[6]}-${correctOrderAnsArray[7]}-${correctOrderAnsArray[8]}`
        );
      } else {
        arrayForHints.push(
          `${correctOrderAnsArray[0]}-${correctOrderAnsArray[1]}-${correctOrderAnsArray[2]}`
        );
        arrayForHints.push(
          `${correctOrderAnsArray[3]}-${correctOrderAnsArray[4]}-${correctOrderAnsArray[7]}`
        );
        arrayForHints.push(
          `${correctOrderAnsArray[5]}-${correctOrderAnsArray[6]}-${correctOrderAnsArray[8]}`
        );
      }
      break;

    case 4:
      arrayForHints.push(
        `${correctOrderAnsArray[0]}-${correctOrderAnsArray[1]}-${correctOrderAnsArray[4]}`
      );
      arrayForHints.push(
        `${correctOrderAnsArray[2]}-${correctOrderAnsArray[3]}-${correctOrderAnsArray[5]}`
      );
      arrayForHints.push(
        `${correctOrderAnsArray[6]}-${correctOrderAnsArray[7]}-${correctOrderAnsArray[8]}`
      );
      break;

    case 6:
      arrayForHints.push(
        `${correctOrderAnsArray[0]}-${correctOrderAnsArray[1]}-${correctOrderAnsArray[6]}`
      );
      arrayForHints.push(
        `${correctOrderAnsArray[2]}-${correctOrderAnsArray[3]}-${correctOrderAnsArray[7]}`
      );
      arrayForHints.push(
        `${correctOrderAnsArray[4]}-${correctOrderAnsArray[5]}-${correctOrderAnsArray[8]}`
      );
      break;
  }
}

// the magic section: where the UI will be populated accordingly
function updateUI() {
  const bitbucketGameDiv = document.querySelector("#bitbucketGameDiv");
  if (currentDifficulty == "easy") {
    correctOrderAnsArray = [...levelDataArray];
    makeHintsArray();
  }

  levelDataArray = shuffle(shuffle(levelDataArray));

  for (let k = 0; k < levelDataArray.length; k++) {
    const randomNo = randomNumber(1, 6);
    const bitbucketGameDiv = document.querySelector("#bitbucketGameDiv");

    const bitCard = document.createElement("div");
    bitCard.classList.add("bitCard");
    bitbucketGameDiv.appendChild(bitCard);

    const bitCardInner = document.createElement("div");
    bitCardInner.classList.add("bit-card-inner");
    bitCardInner.setAttribute("id", `card${k}`);
    bitCard.appendChild(bitCardInner);

    const bitCardFront = document.createElement("div");
    bitCardFront.classList.add("bit-card-front");
    bitCardInner.appendChild(bitCardFront);

    const image = document.createElement("img");
    image.src = `./img/bit${randomNo}.png`;
    bitCardFront.appendChild(image);

    const bitCardBack = document.createElement("div");
    bitCardBack.classList.add("bit-card-back");
    bitCardBack.style.backgroundColor = colorShades[`bit${randomNo}`];
    bitCardInner.appendChild(bitCardBack);

    if (levelDataArray[k].includes("./")) {
      const mainContent = document.createElement("img");
      mainContent.width = 160;
      mainContent.height = 160;
      mainContent.src = levelDataArray[k];
      bitCardBack.appendChild(mainContent);
    } else {
      const mainContent = document.createElement("h3");
      mainContent.innerHTML = levelDataArray[k];
      bitCardBack.appendChild(mainContent);
    }
  }
}

// in case the matched pairs are wrong, then do reverse the UI changes
function resetSelections() {
  // totalLives = 3
  selectedTiles.forEach((divNo) => {
    let div = document.querySelector(`#card${divNo}`);

    div.style.border = "none";

    div.firstElementChild.classList.add("bit-card-front");
    div.firstElementChild.classList.remove("bit-card-back");
    div.lastElementChild.classList.remove("bit-card-front");
    div.lastElementChild.classList.add("bit-card-back");
    div.style.pointerEvents = "all";
  });
  selectedTiles = [];
  currentlyFlipped = [];
}

function resetImpVariables() {
  arrayForHints = [];
  selectedTiles = [];
  currentlyFlipped = [];
  correctOrderAnsArray = [];
}

function initializeUISelection() {
  document.querySelectorAll(".bit-card-inner").forEach((node) => {
    node.addEventListener("click", async () => {
      node.style.borderRadius = "10px";
      node.style.border = "5px dashed orange";

      // ensuring that it allows to click till the point all the tiles are not matched
      if (
        currentlyFlipped.length <= 2 &&
        !isDuplicate(node.id) &&
        currentPairMadeCount < initSettings[currentDifficulty].maxValue
      ) {
        // check whether the lastElementChild is having an img or not
        if (node.lastElementChild.firstElementChild.src !== undefined) {
          let imageType;
          if (node.lastElementChild.firstElementChild.src.includes("dsa.png")) {
            imageType = "dsaImage";
          } else if (
            node.lastElementChild.firstElementChild.src.includes("dbms.jpg")
          ) {
            imageType = "dbmsImage";
          } else if (
            node.lastElementChild.firstElementChild.src.includes("js.png")
          ) {
            imageType = "jsImage";
          } else if (
            node.lastElementChild.firstElementChild.src.includes(
              "electroneum.png"
            )
          ) {
            imageType = "electroneumImage";
          } else if (
            node.lastElementChild.firstElementChild.src.includes("os.jpg")
          ) {
            imageType = "osImage";
          }
          currentlyFlipped.push(imageType);
          // alert("iMAGE URL IS: " + node.lastElementChild.firstElementChild.src)
        } else {
          currentlyFlipped.push(
            node.lastElementChild.firstElementChild.innerHTML.toLowerCase()
          );
          // alert("TEXT CONTENT IS: " + node.lastElementChild.firstElementChild.innerHTML.toLowerCase())
        }
        // gives the card number that is being clicked on
        selectedTiles.push(node.id.split("d")[1]);
        // alert(selectedTiles)
        // alert(currentlyFlipped)

        // swapping the front and back of the card
        node.firstElementChild.classList.remove("bit-card-front");
        node.firstElementChild.classList.add("bit-card-back");
        node.lastElementChild.classList.add("bit-card-front");
        node.lastElementChild.classList.remove("bit-card-back");
        node.style.pointerEvents = "none";

        // first item is being pushed,so make the help section visible so that the user can get the answer
        if (
          currentlyFlipped.length == 1 &&
          currentDifficulty == "easy" &&
          useHintOnce
        ) {
          helpBitbucket.style.pointerEvents = "all";

          helpBitbucket.addEventListener("click", async () => {
            let traverseUIElements = document.querySelectorAll(".bitCard");
            let cardID = -1;
            for (
              let el = 0;
              el < traverseUIElements.length && useHintOnce;
              el++
            ) {
              let text = "";
              for (let k = 0; k < currentlyFlipped.length; k++) {
                if (currentlyFlipped[k].includes("Image"))
                  text = `${text}-${currentlyFlipped[k].split("I")[0]}`;
                else text = text + "-" + currentlyFlipped[k];
              }

              let split = text.split("-");

              let hintText = "";
              let hintTextArray = [];

              // arrayForHints: [ "b2-c2-./img/bitbucket.png", "b4-c4-./img/bitbucket.png", "j3-k3-./img/jira.png" ]
              let res = false;
              for (let x = 0; x < arrayForHints.length; x++) {
                if (arrayForHints[x].includes(split[1])) {
                  res = true;
                  hintText += arrayForHints[x];
                  break;
                }
              }

              hintTextArray = hintText.split("-");
              let hintContent = "";
              for (let i = 0; i < hintTextArray.length; i++) {
                if (hintTextArray[i].includes(split[1])) {
                  if (i == 0) hintContent = hintTextArray[1];
                  else if (i == 1) hintContent = hintTextArray[0];
                  else hintContent = hintTextArray[0];
                }
                if (hintContent != "") break;
              }
              let childNode =
                traverseUIElements[el].firstChild.lastChild.firstChild;
              if (
                (childNode.src == undefined &&
                  childNode.innerHTML === hintContent) ||
                (childNode.src != undefined &&
                  childNode.src.includes(hintContent))
              ) {
                if (judgeMode) {
                  document.querySelector(
                    `#${traverseUIElements[el].firstChild.id}`
                  ).style.border = "5px solid pink";
                  return;
                }

                purchaseCall(
                  "0.000005",
                  `Getting a hint for  Level-${currentLevel} Triplet-${
                    currentPairMadeCount + 1
                  }`,
                  "",
                  traverseUIElements[el].firstChild.id
                );

                // if (purchaseRes.success)
                purchase = true;

                cardID = traverseUIElements[el].firstChild.id.split("d")[1];
              }
            }

            useHintOnce = false;
            // disabling the help icon as it can be only used once in a level by the player
            helpBitbucket.style.pointerEvents = "none";
          });
        } else {
          helpBitbucket.style.pointerEvents = "none";
        }

        // third item is being pushed, to check for the correctness of the 3 pairs
        if (currentlyFlipped.length == 3) {
          let match = 0;

          for (key in questionsAns[currentDifficulty]) {
            for (let i = 0; i < currentlyFlipped.length; i++) {
              if (
                questionsAns[currentDifficulty][key].value.includes(
                  currentlyFlipped[i]
                )
              ) {
                match++;
              } else {
                match = 0;
                break;
              }
            }
            if (match == 3) {
              // increase the score by 10
              currentDifficulty == "easy"
                ? personalHomeStats.easyBitPair++
                : personalHomeStats.hardBitPair++;
              currentDifficulty == "easy" ? incScore("5") : incScore("10");
              populateModal(
                "Know why that was right?",
                [questionsAns[currentDifficulty][key].brief.reasoning],
                questionsAns[currentDifficulty][key].brief.metadata
              );
              toggleClasses.forEach((el) => el.classList.toggle("hidden"));
              currentPairMadeCount++;
              currentPairMade.innerHTML = `Pairs made: ${currentPairMadeCount}`;
              break;
            }
          }
          if (match) {
            // updating the arrayForHints array to provide accurate hints to the player
            if (currentDifficulty == "easy") {
              let compareVar = "";
              let index = -1;
              for (let k = 0; k < currentlyFlipped.length; k++) {
                if (currentlyFlipped[k].includes("Image"))
                  compareVar = `${compareVar}-${
                    currentlyFlipped[k].split("I")[0]
                  }`;
                else compareVar = compareVar + "-" + currentlyFlipped[k];
              }

              let splitArray = compareVar.split("-");
              let result = true;
              for (let a = 0; a < arrayForHints.length; a++) {
                for (let y = 1; y < splitArray.length; y++) {
                  if (!arrayForHints[a].includes(splitArray[y])) {
                    result = false;
                    break;
                  } else result = true;
                }
                if (result) {
                  index = a;
                  break;
                }
              }
              if (result) {
                // deleting the required array element that has been correctly selected by the player
                arrayForHints = arrayForHints
                  .slice(0, index)
                  .concat(arrayForHints.slice(index + 1, arrayForHints.length));
              }
            }

            // selecting the correct divs and turning the color to green to indicate the correctness
            selectedTiles.forEach((divNo) => {
              let node = document.querySelector(`#card${divNo}`);
              node.style.border = "5px solid #13ed8f";
            });

            currentlyFlipped = [];
            selectedTiles = [];
          } else {
            personalHomeStats.wrongBitPair++;
            if (
              parseInt(document.querySelector("#overAllScore").innerHTML) - 3 >=
              0
            ) {
              incScore("-3");
            } else {
              document.querySelector("#overAllScore").innerHTML = 0;
            }
            lives.removeChild(lives.firstElementChild);
            // this will run when the last life is also exhausted
            if (!lives.childElementCount) {
              resetSelections();
              bitbucketGameDiv.style.display = "none";
              document.querySelector("#gameContainer").style.display = "none";
              bitbucketGameDiv.innerHTML = "";
              document.querySelector("#leftSideDiv").style.display = "none";
              document.querySelector("#rightSideDiv").style.display = "none";
              document.querySelector("#levelsCompletedDiv").innerHTML =
                gameCompleted === true
                  ? "Hooray 🥳, you have completed all of the levels for this week. <b>Congrats on that</b> & wait for the next week challenges<br><br><u>Click here to return to the village</u>"
                  : "Lives exhausted!! Click here to return to the village. Your lives will be restored back";
              document.querySelector(
                "#levelsCompletedDiv"
              ).style.backgroundColor = "red";
              document.querySelector("#levelsCompletedDiv").style.display =
                "block";
            } else resetSelections();
          }
        }
      }

      if (currentPairMadeCount == initSettings[currentDifficulty].maxValue) {
        bitGameSong.pause();
        claps.play();

        signupResult.flipLevel++;

        // update the level in the backend
        if (!judgeMode)
          callBackend(
            {
              wallet: changeAddress,
              game: "flipLevel",
              level: signupResult.flipLevel,
            },
            "updateLevel"
          );

        if (streak >= 3) {
          paying = true;
          document.querySelector("#backToHome").style.display = "none";
          await payUser(
            0.000007,
            `Flip the bucket Game Level ${currentLevel} completion reward`
          );
          document.querySelector("#backToHome").style.display = "block";
        }

        paying = false;

        setTimeout(() => {
          bitGameSong.play();
        }, claps._duration * 1000);

        // check whether player has completed the last level or not?
        if (currentLevel == 5) gameCompleted = true;

        bitbucketGameDiv.innerHTML = "";
        resetImpVariables();
        initializeLevel({ level: signupResult.flipLevel });
      }
    });
  });
}

let totalLives = 3;

// very first function that will run initially
function initializeLevel({
  difficulty = "easy",
  level = 1,
  levelDataObj = {},
  levelDatArr = [],
  reloadProgress = false,
  allowHint = true,
}) {
  currentDifficulty = difficulty;
  currentLevel = level;
  levelData = levelDataObj;
  (levelDataArray = levelDatArr), (useHintOnce = allowHint);

  // not all of the levels are completed
  if (!gameCompleted) {
    let restoreLives = 0;
    document.querySelector("#gameContainer").style.display = "block";
    document.querySelector("#levelsCompletedDiv").style.display = "none";
    bitbucketGameDiv.style.display = "grid";

    restoreLives = lives.childElementCount;

    // restoring the lives back to 3 for each new level
    while (totalLives - restoreLives > 0) {
      let image = document.createElement("img");
      image.src = "./img/life.png";
      image.height = "45";
      image.width = "45";
      image.style.paddingLeft = "3px";
      lives.appendChild(image);
      restoreLives++;
    }

    if (reloadProgress) retrieveProgress = true;

    if (currentLevel == 4 || currentLevel == 5) {
      currentDifficulty = "hard";
      changeCSSVar(propertiesToBeChanged);
    }

    levelInfo.innerHTML = levelTitles[currentLevel - 1];
    for (let itr = 0; itr < initSettings[currentDifficulty].maxValue; itr++)
      populateLevelData();

    currentPairMadeCount = 0;
    currentPairMade.innerHTML = `Pairs made: ${currentPairMadeCount}`;
    currentDifficultyUI.innerHTML = currentDifficulty.toUpperCase();

    currentDifficulty === "easy"
      ? (currentDifficultyUI.style.color = "green")
      : (currentDifficultyUI.style.color = "red");

    populateLevelDataArray();

    //checking whether the user has traversed all the quetsions or not?
    if (levelDataArray.length < initSettings[currentDifficulty].tiles) {
      document.querySelector("#gameContainer").style.display = "none";
      document.querySelector("#leftSideDiv").style.display = "none";
      document.querySelector("#rightSideDiv").style.display = "none";
      document.querySelector("#levelsCompletedDiv").innerHTML =
        "Player, you have gone through all of the questions for the current difficulty level. Revisit the game again to check whether new questions have been added or not! <br><br>Click here to go back to the game";
      document.querySelector("#levelsCompletedDiv").style.display = "block";
    } else {
      updateUI();
      initializeUISelection();
    }
  }
  // completed all of the levels
  else {
    document.querySelector("#gameContainer").style.display = "none";
    document.querySelector("#leftSideDiv").style.display = "none";
    document.querySelector("#rightSideDiv").style.display = "none";
    document.querySelector("#levelsCompletedDiv").innerHTML =
      gameCompleted === true
        ? "You have completed all of the levels. <b>Congrats on that </b> <br><u>Click in this div to return to the village</u>"
        : "Lives exhausted";
    document.querySelector("#levelsCompletedDiv").style.display = "block";
  }
}

let paying = false;

backToHome.addEventListener("click", () => {
  if (paying == false) {
    bitGameSong.stop();
    controlMainSong(mainSong, "play");
    totalLives = lives.childElementCount;
    bitbucketGameDiv.innerHTML = "";
    resetImpVariables();

    // the variable 'atlassianBitbucketGame' & 'currentActiveGame' is coming off from the script.js file
    currentActiveGame = "";
    document.querySelector("body").style = "";
    atlassianJiraGame.style.display = "none";
    atlassianBitbucketGame.style.display = "none";
    detailsDiv.style.display = "block";
    CANVAS.style.display = "block";

    document.querySelector(".musicOptions").style.display = "block";
  }
});

document.querySelector("#levelsCompletedDiv").addEventListener("click", () => {
  bitGameSong.stop();
  controlMainSong(mainSong, "play");
  totalLives = 3;
  currentActiveGame = "";
  CANVAS.style.display = "block";
  gameCanvas.style.display = "block";
  detailsDiv.style.display = "block";
  document.querySelector("body").style = "";
  atlassianBitbucketGame.style.display = "none";
  document.querySelector("#username").style.display = "block";

  document.querySelector("#leftSideDiv").style.display = "flex";
  document.querySelector("#rightSideDiv").style.display = "flex";
});
