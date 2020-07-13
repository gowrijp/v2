var Graph = (function() {

    // Models a Vertex
    var Vertex = class {
        constructor(node) {
            this.node = node;
            this.adjList = [];

            //Used for A* Search
            this.GCost = 0;
            this.HCost = 0;
            this.FCost = function() { return this.GCost + this.HCost; }
        }
    }

    // Models an Edge
    var Edge = class {
        constructor(source, destination) {
            this.source = source;
            this.destination = destination;
        }
    }

    // A HashTable containing all Vertices from each Nod
    var vertexMap = new Map();

    // Adds a new Vertex to the Map with a Node as the Key
    var addVertex = function(key) {
        vertexMap.set(key, new Vertex(key));
    }

    // Creates an Edge using the source and destination Key
    var addEdge = function(sourceKey, destinationKey) {
        var source = vertexMap.get(sourceKey);
        var destination = vertexMap.get(destinationKey);
        if (destination == undefined) {
            destination = new Vertex(destination);
        }
        source.adjList.push(destination);
    }

    // Disconnects the given Vertex from all other Neighbors
    var disconnectVertex = function(vertex) {
        for (var i = 0; i < vertex.adjList.length; i++) {
            for (var j = 0; j < vertex.adjList[i].adjList.length; j++) {
                if (vertex.adjList[i].adjList[j] == vertex) {
                    vertex.adjList[i].adjList.splice(j, 1);
                }
            }
        }
    }

    // Reconnects the given Vertex to its Neighbors
    var reconnectVertex = function(vertex) {
        // Refreshes the AdjList of all Neighbors of Vertex
        var refreshAdjList = function(v) {
            var vx = v.node.Xval;
            var vy = v.node.Yval;
            v.adjList = [];
            if (vy-1 >= 0) {
                var n = NodeHandler.getNodeAt(vx, vy-1);
                if (n.nodeType != NODE_TYPES.WALL) {
                    v.adjList.push(getVertex(n));
                }
            }
            if (vx+1 < GRID_SIZE_X) {
                var n = NodeHandler.getNodeAt(vx+1, vy);
                if (n.nodeType != NODE_TYPES.WALL) {
                    v.adjList.push(getVertex(n));
                }
            }
            if (vy+1 < GRID_SIZE_Y) {
                var n = NodeHandler.getNodeAt(vx, vy+1);
                if (n.nodeType != NODE_TYPES.WALL) {
                    v.adjList.push(getVertex(n));
                }
            }
            if (vx-1 >= 0) {
                var n = NodeHandler.getNodeAt(vx-1, vy);
                if (n.nodeType != NODE_TYPES.WALL) {
                    v.adjList.push(getVertex(n));
                }
            }
        }
        // Updates all Neigbors of Vertex
        // And updates Vertex's adjlist
        var x = vertex.node.Xval;
        var y = vertex.node.Yval;
        vertex.adjList = [];
        if (y-1 >= 0) {
            var n = NodeHandler.getNodeAt(x, y-1);
            if (n.nodeType != NODE_TYPES.WALL) {
                vertex.adjList.push(getVertex(n));
            }
            refreshAdjList(getVertex(n));
        }
        if (x+1 < GRID_SIZE_X) {
            var n = NodeHandler.getNodeAt(x+1, y);
            if (n.nodeType != NODE_TYPES.WALL) {
                vertex.adjList.push(getVertex(n));
            }
            refreshAdjList(getVertex(n));
        }
        if (y+1 < GRID_SIZE_Y) {
            var n = NodeHandler.getNodeAt(x, y+1);
            if (n.nodeType != NODE_TYPES.WALL) {
                vertex.adjList.push(getVertex(n));
            }
            refreshAdjList(getVertex(n));
        }
        if (x-1 >= 0) {
            var n = NodeHandler.getNodeAt(x-1, y);
            if (n.nodeType != NODE_TYPES.WALL) {
                vertex.adjList.push(getVertex(n));
            }
            refreshAdjList(getVertex(n));
        }
    }

    // Resets the Graph
    var clearGraph = function() {
        vertexMap.clear();
    }

    // Returns the Vertex from the given Key
    var getVertex = function(key) {
        return vertexMap.get(key);
    }

    // Resets A* cost values
    var resetCostValues = function() {
        vertexMap.forEach(function(value, key, vertexMap) {
            value.GCost = 0;
            value.HCost = 0;
        });
    }

    // Returns all Vertices from the vertexMap
    var getAllVerticesIterator = function() {
        return vertexMap.values();
    }

    return {
        addVertex: addVertex,
        addEdge: addEdge,
        disconnectVertex: disconnectVertex,
        reconnectVertex: reconnectVertex,
        clearGraph: clearGraph,
        getVertex: getVertex,
        resetCostValues: resetCostValues,
        getAllVerticesIterator: getAllVerticesIterator
    };

})();

// Animates the Pathfinding Algorithms
var Animate = (function() {

    var finishedLoop = function() {
        CURRENT_STATE = STATES.READY;
    }

    // Adds a search vertex to the search queue
    var addSearchNode = function(node) {
        FSSearchQueue.enqueue(node);
        if (FSSearchQueue.getLength() == 1) {
            startPathfindLoop();
        }
    }

    // Adds a path vertex to the path queue
    var addFinalPathNode = function(node) {
        if (node == null) {
            finishedLoop();
            return;
        }
        FSFinalPathQueue.enqueue(node);
    }

    // Begins the First Serach Loop
    var startPathfindLoop = function() {
        // Controls the Change in Path Speed
        var pathSpeedAtStart = currentPathSpeed;
        var getTickRate = function() {
            return (currentPathSpeed < MAX_PATH_SPEED) ? (250 / currentPathSpeed) : 10;
        }

        // Main Function
        var node = null;
        var loopFunc = function() {
            // Quits when reached End or State changed
            if ((FSFinalPathQueue.getLength() == 0 && FSSearchQueue.getLength() == 0) ||
                CURRENT_STATE != STATES.PATHFINDING) {
                clearInterval(FSLoop);
                CURRENT_STATE = STATES.READY;
                return;
            }
            // Checks if Path Speed changed
            if (pathSpeedAtStart != currentPathSpeed) {
                pathSpeedAtStart = currentPathSpeed;
                clearInterval(FSLoop);
                FSLoop = setInterval(loopFunc, getTickRate());
            }
            // Updates the Search Elements
            if (FSSearchQueue.getLength() > 0) {
                if (node != null) {
                    node.element.style.background = SEARCH_SOFT_COLOR;
                }
                node = FSSearchQueue.dequeue();
                if (!FSSearchQueue.isEmpty()) {
                    node.element.style.background = SEARCH_HARD_COLOR;
                } else {
                    node.element.style.background = SEARCH_SOFT_COLOR;
                    node = null;
                }
            }
            // Updates the Path Elements
            else if (FSFinalPathQueue.getLength() > 0) {
                if (node != null) {
                    node.element.style.background = PATH_SOFT_COLOR;
                }
                node = FSFinalPathQueue.dequeue();
                if (!FSFinalPathQueue.isEmpty()) {
                    node.element.style.background = PATH_HARD_COLOR;
                } else {
                    node.element.style.background = PATH_SOFT_COLOR;
                    node = null;
                }
            }
        }
        var FSLoop = setInterval(loopFunc, getTickRate());
    }


    return {
        addSearchNode: addSearchNode,
        addFinalPathNode: addFinalPathNode
    };

})();
