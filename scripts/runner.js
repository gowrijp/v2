var Runner = (function() {
    // Holds the Path of the last run Algorithm
    var lastPath = [];
    // Clears the Nodes from the Last Path
    var clearLastPath = function() {
        for (var i = 0; i < lastPath.length; i++) {
            var v = lastPath[i];
            if (v.node.nodeType == NODE_TYPES.FREE) {
                v.node.element.style.background = FREE_NODE_COLOR;
            }
        }
        lastPath = [];
    }

    var BreadthFirstSearch = (function() {
        var performBFS = function(source, destination) {
            // Uses a Map to store the Previously visited Vertices
            var path = new Map();
            // Uses a Queue to order the Vertex visitation
            var Q = new DataStructures.Queue();

            // Sets the Initial Vertex (aka Source)
            path.set(source, null);
            Q.enqueue(source);
            // Loops until the Queue is empty
            while (!Q.isEmpty()) {
                // Gets the next Vertex to process from the Queue
                var vertex = Q.dequeue();
                // Found the destination
                if (vertex == destination) {
                    var prev = path.get(destination);
                    // Quits the animation loop
                    if (prev == source) { Animate.addFinalPathNode(null); }
                    // Traces back through the final path
                    while (prev != source) {
                        if (prev == undefined) { return false; }
                        Animate.addFinalPathNode(prev.node);
                        prev = path.get(prev);
                    }
                    return true;
                }
                // Loops through the Vertex's adjacent Vertices
                for (var i = 0; i < vertex.adjList.length; i++) {
                    // Not visited
                    if (!path.has(vertex.adjList[i])) {
                        // Appends this vertex to the Queue to visit later
                        var adjVertex = vertex.adjList[i];
                        lastPath.push(adjVertex);
                        if (adjVertex != destination) {
                            Animate.addSearchNode(adjVertex.node);
                        }
                        path.set(adjVertex, vertex);
                        Q.enqueue(adjVertex);
                    }
                }
            }
            return false;
        }

        return {
            performBFS: performBFS,
        };

    })();


    var DepthFirstSearch = (function() {
        var performDFS = function(source, destination) {
            // Keeps track of all visited Vertices and holds the Parents
            var path = new Map();
            // Calls the Recursive Algorithm
            path.set(source, null);
            var didFind = DFSUtil(source, destination, path);
            // Did find path
            if (didFind) {
                var prev = path.get(destination);
                // Quits the animation loop
                if (prev == source) { Animate.addFinalPathNode(null); }
                // Traces back through the final path
                while (prev != source) {
                    if (prev == undefined) { return false; }
                    Animate.addFinalPathNode(prev.node);
                    prev = path.get(prev);
                }
                return true;
            }
            // Did NOT find path
            else {
                return false;
            }
        }

        // DFS Helper
        var DFSUtil = function(vertex, destination, path) {
            // Attempts each Vertex adjacent to the parent Vertex
            for (var i = 0; i < vertex.adjList.length; i++) {
                var newVertex = vertex.adjList[i];
                // Checks to make sure Vertex has not been visited
                if (!path.has(newVertex)) {
                    path.set(newVertex, vertex);
                    // Found the Destination
                    if (newVertex == destination) {
                        return true;
                    }
                    lastPath.push(newVertex);
                    Animate.addSearchNode(newVertex.node);
                    if (DFSUtil(newVertex, destination, path)) {
                        return true;
                    }
                }
            }
            return false;
        }

        return {
            performDFS: performDFS,
        };

    })();


    var AStarSearch = (function() {
        var performAStarSearch = function(source, destination) {
            Graph.resetCostValues();
            var openList = []; // Keeps track of possible next vertices
            var closeList = []; // Keeps track of all visited vertices
            var parentMap = new Map(); // Keeps track of the predecessors

            // Adds the source as the start node
            openList.push(source);
            parentMap.set(source, null);

            // loops until the openList is empty
            while (openList.length != 0) {
                // The vertex with the lowest F cost
                var vertex = openList[0];
                for (var i = 0; i < openList.length; i++) {
                    if (openList[i].FCost() < vertex.FCost()) {
                        vertex = openList[i];
                    }
                }
                openList.splice(openList.indexOf(vertex), 1);
                closeList.push(vertex);

                // Animates
                if (vertex != source && vertex != destination) {
                    lastPath.push(vertex);
                    Animate.addSearchNode(vertex.node);
                }

                // Found the destination
                if (vertex == destination) {
                    var prev = parentMap.get(destination);
                    // Quits the animation loop
                    if (prev == source) { Animate.addFinalPathNode(null); }
                    // Traces back through the final path
                    while (prev != source) {
                        if (prev == undefined) { return false; }
                        Animate.addFinalPathNode(prev.node);
                        prev = parentMap.get(prev);
                    }
                    return true;
                }

                // Loops through all of vertex's neighbors
                for (var i = 0; i < vertex.adjList.length; i++) {
                    var newVertex = vertex.adjList[i];
                    // Ensures it is not already in the closeList
                    if (!closeList.includes(newVertex)) {
                        var isInOpenList = openList.includes(newVertex);
                        var newGCost = vertex.GCost + 1;
                        if (!isInOpenList || newGCost < newVertex.GCost) {
                            newVertex.GCost = newGCost;
                            newVertex.HCost = getDistance(newVertex, destination);
                            // Adds / Updates this new vertex to the openList
                            parentMap.set(newVertex, vertex);
                            if (!isInOpenList) {
                                openList.push(newVertex);
                            }
                        }
                    }
                }
            }

            return false;
        }
        var getDistance = function(vertex1, vertex2) {
            // The Heuristic
            var disX = Math.abs(vertex1.node.Xval - vertex2.node.Xval);
            var disY = Math.abs(vertex1.node.Yval - vertex2.node.Yval);
            var min = Math.min(disX, disY);
            var max = Math.max(disX, disY)
            return 2 * min + max;
        }

        return {
            performAStarSearch: performAStarSearch,
        };

    })();


    var GreedyBestFirstSearch = (function() {
        var performGreedyBestFirstSearch = function(source, destination) {
            Graph.resetCostValues();
            // Priority Queue retrieves the next closest vertex
            var open = new DataStructures.PriorityQueue();
            // Set used to check if vertex has been visited
            var closed = new Set();
            // Keeps track of all predecessors
            var parentMap = new Map();

            // Add source to the queue
            open.enqueue(source, 0);
            parentMap.set(source, null);

            while (!open.isEmpty()) {
                // Get the closest vertex (lowest H Cost)
                var vertex = open.dequeue();
                closed.add(vertex);

                // Animates
                if (vertex != source && vertex != destination) {
                    lastPath.push(vertex);
                    Animate.addSearchNode(vertex.node);
                }

                // Found the destination
                if (vertex == destination) {
                    var prev = parentMap.get(destination);
                    // Quits the animation loop
                    if (prev == source) { Animate.addFinalPathNode(null); }
                    // Traces back through the final path
                    while (prev != source) {
                        if (prev == undefined) { return false; }
                        Animate.addFinalPathNode(prev.node);
                        prev = parentMap.get(prev);
                    }
                    return true;
                }

                // Loops through neighbors
                for (var i = 0; i < vertex.adjList.length; i++) {
                    var newVertex = vertex.adjList[i];
                    // make sure it is a new vertex
                    if (!closed.has(newVertex) && !open.has(newVertex)) {
                        newVertex.HCost = getHDistance(newVertex, destination);
                        open.enqueue(newVertex, newVertex.HCost);
                        parentMap.set(newVertex, vertex);
                    }
                }
            }
            return false;
        }
        var getHDistance = function(vertex, destination) {
            // The Heuristic
            var disX = Math.abs(destination.node.Xval - vertex.node.Xval);
            var disY = Math.abs(destination.node.Yval - vertex.node.Yval);
            return disX + disY;
        }


        return {
            performGreedyBestFirstSearch: performGreedyBestFirstSearch,
        };

    })();
    // Bellman Ford Algorithm 
    var BellmanFord = (function() {
        var performBellmanFord = function(source, destination) {
            var vIt = Graph.getAllVerticesIterator();  //Array for all the vertices
            var v = vIt.next();
            var vertexArray  = [];
            while (!v.done) {
                vertexArray.push(v.value);
                v = vIt.next();
            }
            var distanceMap = new Map();  // Distance from the source
            var parentMap = new Map();  // parent of each node


            // Step 1: Initialize the distance of all other Vertices as INFINITY
            for (var i = 0; i < vertexArray.length; i++) {
                distanceMap.set(vertexArray[i], Number.POSITIVE_INFINITY);
            }

            // Set the distace of the source as 0
            distanceMap.set(source, 0);

            // Step 2: Relaxes all Edges V - 1 times (where V is the total number of Vertices)
            // Relaxing: attempting to lower the cost of getting to a Vertex by attempting different Vertices
            // V - 1 times is because the longest (worst case) possible path to get to the destination is V - 1 traversals
            for (var i = 0; i < vertexArray.length-1; i++) {
                for (var j = 0; j < vertexArray.length; j++) {
                    var vertex = vertexArray[j];
                    for (var k = 0; k < vertex.adjList.length; k++) {
                        var adjV = vertex.adjList[k];
                        if (distanceMap.get(vertex) + 1 < distanceMap.get(adjV)) {
                            // Animates
                            if (adjV != destination) {
                                Animate.addSearchNode(adjV.node);
                                lastPath.push(adjV);
                            }
                            distanceMap.set(adjV, distanceMap.get(vertex) + 1);
                            parentMap.set(adjV, vertex);
                        }
                    }
                }
            }

            // Step 3: Check for any Negative Weight Cycles
            // If a shorter path is found, then it means there is a negative wieght cycle
            for (var i = 0; i < vertexArray.length; i++) {
                var vertex = vertexArray[i];
                for (var j = 0; j < vertex.adjList.length; j++) {
                    var adjV = vertex.adjList[j];
                    if (distanceMap.get(vertex) + 1 < distanceMap.get(adjV)) {
                        console.log('Negative Weight Cycle Detected!');
                        return false;
                    }
                }
            }

            // Checks if path to destination was found
            if (parentMap.get(destination) != undefined) {
                var prev = parentMap.get(destination);
                // Quits the animation loop
                if (prev == source) { Animate.addFinalPathNode(null); }
                // Traces back through the final path
                while (prev != source) {
                    if (prev == undefined) { return false; }
                    Animate.addFinalPathNode(prev.node);
                    prev = parentMap.get(prev);
                }
                return true;
            }
            return false;
        }


        return {
            performBellmanFord: performBellmanFord,
        };

    })();

    // Dijkstras
    var Dijkstras = (function() {
        var performDijkstras = function(source, destination) {
            // Converts the vertex map to an array
            var vIt = Graph.getAllVerticesIterator();
            var v = vIt.next();
            var vertexArray  = [];
            while (!v.done) {
                vertexArray.push(v.value);
                v = vIt.next();
            }

            // Priority Queue to get the Vertex with the lowest Distance
            var pq = new DataStructures.PriorityQueue();
            // Holds each Vertex's Distance
            var distanceMap = new Map();
            // Keeps track of all visited Vertices
            var visited = new Set();
            // Keeps track of predecessors
            var parentMap = new Map();

            // Sets all Distances to INFINITY
            for (var i = 0; i < vertexArray.length; i++) {
                distanceMap.set(vertexArray[i], Number.POSITIVE_INFINITY);
            }
            // Ensures that source's Distance stays at 0
            distanceMap.set(source, 0);

            pq.enqueue(source, distanceMap.get(source)); // should be 0
            while (!pq.isEmpty()) {
                // pops and adds the Vertex to the visisted set
                var vertex = pq.dequeue();
                visited.add(vertex);

                // Found destination
                if (vertex == destination) {
                    var prev = parentMap.get(destination);
                    // Quits the animation loop
                    if (prev == source) { Animate.addFinalPathNode(null); }
                    // Traces back through the final path
                    while (prev != source) {
                        if (prev == undefined) { return false; }
                        Animate.addFinalPathNode(prev.node);
                        prev = parentMap.get(prev);
                    }
                    return true;
                }

                // Loops all neighbors
                for (var i = 0; i < vertex.adjList.length; i++) {
                    var newVertex = vertex.adjList[i];
                    if (!visited.has(newVertex)) {
                        // If the new Distance is less than its current Distance
                        if (distanceMap.get(vertex) + 1 < distanceMap.get(newVertex)) {
                            // Animates
                            if (newVertex != destination) {
                                Animate.addSearchNode(newVertex.node);
                                lastPath.push(newVertex);
                            }
                            // Updates the Distance in the pq
                            pq.remove(newVertex);
                            distanceMap.set(newVertex, distanceMap.get(vertex) + 1);
                            pq.enqueue(newVertex, distanceMap.get(newVertex));
                            // Updates the parent
                            parentMap.set(newVertex, vertex);
                        }
                    }
                }
            }
            return false;
        }

        return {
            performDijkstras: performDijkstras,
        };

    })();


    return {
        clearLastPath: clearLastPath,
        BreadthFirstSearch: BreadthFirstSearch,
        DepthFirstSearch: DepthFirstSearch,
        AStarSearch: AStarSearch,
        GreedyBestFirstSearch: GreedyBestFirstSearch,
        BellmanFord: BellmanFord,
        Dijkstras: Dijkstras
    };

})();
