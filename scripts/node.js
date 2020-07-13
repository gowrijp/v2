var NodeHandler = (function() {

    // A class for Node objects
    var Node = class {
        constructor(element, Xval, Yval, nodeType) {
            this.element = element;
            this.Xval = Xval;
            this.Yval = Yval;
            this.nodeType = nodeType;
        }
    }

    // Generates all of the Nodes and Elements in a grid format
    var mouseDownElement; // Keeps track of the first element when Mouse Down
    var createNodeGrid = function() {
        var pathfindingContainer = document.getElementById('pathfinding-container');
        pathfindingContainer.innerHTML = '';
        for (var i = 0; i < GRID_SIZE_Y; i++) {
            var nodeContainer = document.createElement('div');
            nodeContainer.className = 'node-container';
            pathfindingContainer.appendChild(nodeContainer);
            for (var j = 0; j < GRID_SIZE_X; j++) {
                var nodeElement = document.createElement('a');

                nodeElement.onclick = function(e) {
                    if (CURRENT_STATE == STATES.READY) {
                        var mouseNode = getNodeFromElement(this);
                        if (mouseNode.nodeType == NODE_TYPES.WALL &&
                            mouseDownElement != this) {
                            mouseIsDownInNode = false;
                            colorNodeElement(this, FREE_NODE_COLOR);
                            Graph.reconnectVertex(Graph.getVertex(mouseNode));
                        }
                        mouseDownElement = null;
                    }
                }
                nodeElement.onmousedown = function(e) {
                    if (CURRENT_STATE == STATES.READY) {
                        stopDefault(e);
                        var mouseNode = getNodeFromElement(this);
                        if (mouseNode.nodeType == NODE_TYPES.FREE ||
                            mouseNode.nodeType == NODE_TYPES.WALL) {
                            mouseIsDownInNode = true;
                            if (mouseNode.nodeType == NODE_TYPES.FREE) {
                                mouseDownElement = this;
                                colorNodeElement(this, WALL_NODE_COLOR);
                            }
                        }
                        else if (mouseNode.nodeType == NODE_TYPES.START) {
                            mouseIsDownInStartNode = true;
                        }
                        else if (mouseNode.nodeType == NODE_TYPES.END) {
                            mouseIsDownInEndNode = true;
                        }
                    }
                }
                nodeElement.onmouseover = function(e) {
                    if (CURRENT_STATE == STATES.READY) {
                        mouseDownElement = null;
                        if (mouseIsDownInNode) {
                            colorNodeElement(this, WALL_NODE_COLOR);
                        }
                        else if (mouseIsDownInStartNode) {
                            var mouseNode = getNodeFromElement(this);
                            if (mouseNode.nodeType == NODE_TYPES.FREE) {
                                moveStartNode(mouseNode.Xval, mouseNode.Yval);
                            }
                        }
                        else if (mouseIsDownInEndNode) {
                            var mouseNode = getNodeFromElement(this);
                            if (mouseNode.nodeType == NODE_TYPES.FREE) {
                                moveEndNode(mouseNode.Xval, mouseNode.Yval);
                            }
                        }
                    }
                }

                nodeElement.className = 'node';
                nodeElement.id = j + ',' + i;
                nodeContainer.appendChild(nodeElement);
                nodesArrays[i][j] = new Node(nodeElement, j, i, NODE_TYPES.FREE);
                // Adds each Vertex from each Node
                Graph.addVertex(nodesArrays[i][j]);
            }
        }
        // Colors the starting and ending nodes
        moveStartNode(startNodeX, startNodeY);
        moveEndNode(endNodeX, endNodeY);

        // Adds all Edges in the Graph
        for (var i = 0; i < GRID_SIZE_Y; i++) {
            for (var j = 0; j < GRID_SIZE_X; j++) {
                if (i-1 >= 0) {
                    Graph.addEdge(nodesArrays[i][j], nodesArrays[i-1][j]);
                }
                if (j+1 < GRID_SIZE_X) {
                    Graph.addEdge(nodesArrays[i][j], nodesArrays[i][j+1]);
                }
                if (i+1 < GRID_SIZE_Y) {
                    Graph.addEdge(nodesArrays[i][j], nodesArrays[i+1][j]);
                }
                if (j-1 >= 0) {
                    Graph.addEdge(nodesArrays[i][j], nodesArrays[i][j-1]);
                }
            }
        }
    }

    // Colors the Node HTML element
    var colorNodeElement = function(nodeElement, color) {
        nodeID = nodeElement.id.split(',');
        nodeX = nodeID[0];
        nodeY = nodeID[1];
        if (startNodeX == nodeX && startNodeY == nodeY) {
            return;
        }
        if (endNodeX == nodeX && endNodeY == nodeY) {
            return;
        }
        colorNodeAt(nodeX, nodeY, color);
        // Updates the Node's type
        switch (color) {
            case WALL_NODE_COLOR:
                var node = getNodeFromElement(nodeElement);
                node.nodeType = NODE_TYPES.WALL;
                Graph.disconnectVertex(Graph.getVertex(node));
                break;
            case FREE_NODE_COLOR:
                var node = getNodeFromElement(nodeElement);
                node.nodeType = NODE_TYPES.FREE;
                break;
            case START_NODE_COLOR:
                getNodeFromElement(nodeElement).nodeType = NODE_TYPES.START;
                break;
            case END_NODE_COLOR:
                getNodeFromElement(nodeElement).nodeType = NODE_TYPES.END;
                break;
        }
    }

    // Updates the Starting Node to a new position
    var moveStartNode = function(x, y) {
        clearPath();
        var node;
        // Updates the old Start Node
        node = getNodeAt(startNodeX, startNodeY);
        node.element.style.cursor = 'default';
        node.nodeType = NODE_TYPES.FREE;
        colorNodeAt(startNodeX, startNodeY, FREE_NODE_COLOR);

        // Updates the new Start Node
        startNodeX = x;
        startNodeY = y;
        node = getNodeAt(startNodeX, startNodeY);
        colorNodeAt(startNodeX, startNodeY, START_NODE_COLOR);
        node.nodeType = NODE_TYPES.START;
        node.element.style.cursor = 'grab';
    }

    // Updates the Ending Node to a new position
    var moveEndNode = function(x, y) {
        clearPath();
        Runner.clearLastPath();
        var node;
        // Updates the old End Node
        node = getNodeAt(endNodeX, endNodeY);
        node.element.style.cursor = 'default';
        node.nodeType = NODE_TYPES.FREE;
        colorNodeAt(endNodeX, endNodeY, FREE_NODE_COLOR);

        // Updates the new End Node
        endNodeX = x;
        endNodeY = y;
        node = getNodeAt(endNodeX, endNodeY);
        colorNodeAt(endNodeX, endNodeY, END_NODE_COLOR);
        node.nodeType = NODE_TYPES.END;
        node.element.style.cursor = 'grab';
    }

    // Colors the Node at the specified position
    var colorNodeAt = function(x, y, color) {
        getNodeAt(x, y).element.style.background = color;
    }

    // Retrieves the Node at the specified position form the NodesArrays
    var getNodeAt = function(x, y) {
        return nodesArrays[y][x];
    }

    // Retrives the Node object from given element
    var getNodeFromElement = function(element) {
        nodeID = element.id.split(',');
        nodeX = nodeID[0];
        nodeY = nodeID[1];
        return getNodeAt(nodeX, nodeY);
    }

    return {
        createNodeGrid: createNodeGrid,
        colorNodeElement: colorNodeElement,
        colorNodeAt: colorNodeAt,
        getNodeAt: getNodeAt,
    };

})();

// Enum to keep track of what state each Node is in
const NODE_TYPES = {
    FREE: 0,
    WALL: 1,
    START: 2,
    END: 3
}
