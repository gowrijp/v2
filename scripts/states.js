// Constant Values
let GRID_SIZE_X = 45;
let GRID_SIZE_Y = 20;
let MAX_PATH_SPEED = 10;

// Constant Colors
let WALL_NODE_COLOR = '#00223d';
let START_NODE_COLOR = '#00a82d';
let END_NODE_COLOR = '#d9001d';
let FREE_NODE_COLOR = '#ededed';
let SEARCH_SOFT_COLOR = '#f5e500';
let SEARCH_HARD_COLOR = '#eda200';
let PATH_SOFT_COLOR = '#40e300';
let PATH_HARD_COLOR = '#00c234';

// Positions of Start Node and End Node
var startNodeX = 10;
var startNodeY = 10;
var endNodeX = 33;
var endNodeY = 10;

// 2D Array to hold Nodes
var nodesArrays = Array.from(Array(GRID_SIZE_Y), () => new Array(GRID_SIZE_X));

// Enum to keep track of the App State
const STATES = {
    READY: 'ready',
    PATHFINDING: 'pathfinding'
}

var CURRENT_STATE = STATES.READY;
nodesArrays = Array.from(Array(GRID_SIZE_Y), () => new Array(GRID_SIZE_X));
Graph.clearGraph();
NodeHandler.createNodeGrid();

// Enum to keep track of the Selected Algorithm
const ALGOS = {
    BREADTH_FIRST_SEARCH: 'Breadth-First Search',
    DEPTH_FIRST_SEARCH: 'Depth-First Search',
    A_STAR_SEARCH: 'A* Search',
    GREEDY_BEST_FIRST_SEARCH: 'Greedy Best-First Search',
    BELLMAN_FORD: 'Bellman-Ford',
    DIJKSTRAS: 'Dijkstra\'s'
}
var SELECTED_ALGO = ALGOS.BREADTH_FIRST_SEARCH;

// Handles global events
var mouseIsDownInNode = false;
var mouseIsDownInStartNode = false;
var mouseIsDownInEndNode = false;
window.onmouseup = function(e) {
    mouseIsDownInNode = false;
    mouseIsDownInStartNode = false;
    mouseIsDownInEndNode = false;
}

// Stops the default HTML/CSS events from occuring
// Used to stop mouse highlighting within the Node Container
function stopDefault(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    else {
        window.event.returnValue = false;
    }
    return false;
}

// When the window is clicked
window.onclick = function(event) {
    // When clicked outside dropdown
    if (!event.target.matches('.dropdown-button')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
    }
}

// Handles the Speed Slider input
var pathSpeedSlider = document.getElementById('path-speed-slider');
var pathSpeedSliderLabel = document.getElementById('path-speed-slider-label');
var currentPathSpeed = 6;
pathSpeedSlider.value = currentPathSpeed;
pathSpeedSliderLabel.innerText = pathSpeedSlider.value + 'x';
pathSpeedSlider.oninput = function() {
    // Will return if the change is less than the increment
    var newVal = pathSpeedSlider.value;
    if (newVal != 1) {
        newVal = Math.round(pathSpeedSlider.value / 2) * 2;
    }
    currentPathSpeed = newVal;
    pathSpeedSlider.value = newVal;
    pathSpeedSliderLabel.innerText = newVal + 'x';
}

// Handles Algo Drop Down Button
function dropdownClick() {
    document.getElementById('pathfinding-dropdown-content').classList.toggle('show');
}

// Handles Drop Down Item selection
Runner.BreadthFirstSearch.setDetails();
function algoSelected(ref) {
    // Ensures that the selected one is not the current one
    if (ref.innerText == SELECTED_ALGO) {
        return;
    }

    // Sets up the new selected algorithm
    clearPath();
    SELECTED_ALGO = ref.innerText;
    document.getElementsByClassName('dropdown-button')[0].innerText = ref.innerText;

    // Updates the Details Section
    switch (SELECTED_ALGO) {
        case ALGOS.BREADTH_FIRST_SEARCH:
            Runner.BreadthFirstSearch.setDetails();
            break;
        case ALGOS.DEPTH_FIRST_SEARCH:
            Runner.DepthFirstSearch.setDetails();
            break;
        case ALGOS.A_STAR_SEARCH:
            Runner.AStarSearch.setDetails();
            break;
        case ALGOS.GREEDY_BEST_FIRST_SEARCH:
            document.getElementsByClassName('dropdown-button')[0].innerText = 'Greedy Best-First S';
            Runner.GreedyBestFirstSearch.setDetails();
            break;
        case ALGOS.BELLMAN_FORD:
            Runner.BellmanFord.setDetails();
            break;
        case ALGOS.DIJKSTRAS:
            Runner.Dijkstras.setDetails();
            break;
        default:
            Runner.BreadthFirstSearch.setDetails();
            break;
    }
}

// Clears everything in the grid
function clearAll() {
    CURRENT_STATE = STATES.READY;
    nodesArrays = Array.from(Array(GRID_SIZE_Y), () => new Array(GRID_SIZE_X));
    Graph.clearGraph();
    NodeHandler.createNodeGrid();
}
/*function RandomGrid() {
    //CURRENT_STATE = STATES.READY;
    //Graph.clearGraph();
    //NodeHandler.createNodeGrid();
    var ranstart=1;
    var ranstop=1;
    var node_my = NodeHandler.getNodeAt(ranstart,ranstop);
    node_my.nodeType = NODE_TYPES.WALL;
    NodeHandler.colorNodeElement(node_my,WALL_NODE_COLOR);
    //
}*/

// Clears the path of the last run algorithm
function clearPath() {
    CURRENT_STATE = STATES.READY;
    Runner.clearLastPath();
}


// Begins the Pathfinding Algorithm
var FSSearchQueue;
var FSFinalPathQueue;
function startFindingPath() {
    if (CURRENT_STATE == STATES.READY) {
        clearPath();
        CURRENT_STATE = STATES.PATHFINDING;
        FSSearchQueue = new DataStructures.Queue();
        FSFinalPathQueue = new DataStructures.Queue();

        var startVertex = Graph.getVertex(NodeHandler.getNodeAt(startNodeX, startNodeY));
        var endVertex = Graph.getVertex(NodeHandler.getNodeAt(endNodeX, endNodeY));
        switch (SELECTED_ALGO) {
            case ALGOS.BREADTH_FIRST_SEARCH:
                Runner.BreadthFirstSearch.performBFS(startVertex, endVertex);
                break;
            case ALGOS.DEPTH_FIRST_SEARCH:
                Runner.DepthFirstSearch.performDFS(startVertex, endVertex);
                break;
            case ALGOS.A_STAR_SEARCH:
                Runner.AStarSearch.performAStarSearch(startVertex, endVertex);
                break;
            case ALGOS.GREEDY_BEST_FIRST_SEARCH:
                Runner.GreedyBestFirstSearch.performGreedyBestFirstSearch(startVertex, endVertex);
                break;
            case ALGOS.BELLMAN_FORD:
                Runner.BellmanFord.performBellmanFord(startVertex, endVertex);
                break;
            case ALGOS.DIJKSTRAS:
                Runner.Dijkstras.performDijkstras(startVertex, endVertex);
                break;
            default:
                Runner.BreadthFirstSearch.performBFS(startVertex, endVertex);
                break;
        }
    }
}

// Creates the Grid initial grid
NodeHandler.createNodeGrid();
