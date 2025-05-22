import { Position, CellType } from "@/types/game";

/**
 * A* Pathfinding Algorithm
 * 
 * This implementation finds the shortest path from a start position to a target position
 * on a grid, avoiding walls and other obstacles.
 */

// Node for A* algorithm
interface PathNode {
  position: Position;
  g: number; // Cost from start to current node
  h: number; // Heuristic (estimated cost from current to goal)
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

// Calculate Manhattan distance between two positions (heuristic function)
function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Check if a position is within the grid bounds
function isInBounds(pos: Position, grid: CellType[][]): boolean {
  return pos.x >= 0 && pos.x < grid[0].length && pos.y >= 0 && pos.y < grid.length;
}

// Check if a position is walkable (empty cell)
function isWalkable(pos: Position, grid: CellType[][]): boolean {
  return grid[pos.y][pos.x] === 'empty';
}

// Get the key for a position (for use in maps)
function positionKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

/**
 * Find the shortest path from start to target using A* algorithm
 * 
 * @param start Starting position
 * @param target Target position
 * @param grid The game grid
 * @returns Array of positions representing the path, or null if no path exists
 */
export function findPath(start: Position, target: Position, grid: CellType[][]): Position[] | null {
  // If start or target is out of bounds, return null
  if (!isInBounds(start, grid) || !isInBounds(target, grid)) {
    return null;
  }

  // If target is not walkable, return null
  if (!isWalkable(target, grid)) {
    return null;
  }

  // Initialize open and closed sets
  const openSet: Map<string, PathNode> = new Map();
  const closedSet: Set<string> = new Set();

  // Create start node
  const startNode: PathNode = {
    position: start,
    g: 0,
    h: heuristic(start, target),
    f: heuristic(start, target),
    parent: null
  };

  // Add start node to open set
  openSet.set(positionKey(start), startNode);

  // Directions: right, left, down, up
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];

  // While there are nodes to explore
  while (openSet.size > 0) {
    // Find node with lowest f score
    let currentKey = '';
    let currentNode: PathNode | undefined;
    let lowestF = Infinity;

    // Use forEach instead of for...of to avoid TypeScript iteration issues
    openSet.forEach((node, key) => {
      if (node.f < lowestF) {
        lowestF = node.f;
        currentKey = key;
        currentNode = node;
      }
    });

    if (!currentNode) {
      break; // No path found
    }

    // Remove current node from open set
    openSet.delete(currentKey);

    // Add current node to closed set
    closedSet.add(currentKey);

    // If we reached the target, reconstruct and return the path
    if (currentNode.position.x === target.x && currentNode.position.y === target.y) {
      const path: Position[] = [];
      let current: PathNode | null = currentNode;

      while (current) {
        path.unshift(current.position);
        current = current.parent;
      }

      return path;
    }

    // Check all neighbors
    for (const dir of directions) {
      const neighborPos: Position = {
        x: currentNode.position.x + dir.x,
        y: currentNode.position.y + dir.y
      };

      // Skip if out of bounds or not walkable
      if (!isInBounds(neighborPos, grid) || !isWalkable(neighborPos, grid)) {
        continue;
      }

      const neighborKey = positionKey(neighborPos);

      // Skip if already evaluated
      if (closedSet.has(neighborKey)) {
        continue;
      }

      // Calculate g score for this neighbor
      const tentativeG = currentNode.g + 1;

      // Check if this neighbor is already in the open set
      const existingNeighbor = openSet.get(neighborKey);
      
      if (!existingNeighbor) {
        // New node, add to open set
        const neighborNode: PathNode = {
          position: neighborPos,
          g: tentativeG,
          h: heuristic(neighborPos, target),
          f: tentativeG + heuristic(neighborPos, target),
          parent: currentNode
        };
        openSet.set(neighborKey, neighborNode);
      } else if (tentativeG < existingNeighbor.g) {
        // Better path to existing node, update it
        existingNeighbor.g = tentativeG;
        existingNeighbor.f = tentativeG + existingNeighbor.h;
        existingNeighbor.parent = currentNode;
      }
    }
  }

  // No path found
  return null;
}

/**
 * Find all reachable positions from a starting position
 * 
 * @param start Starting position
 * @param grid The game grid
 * @returns Set of position keys that are reachable
 */
export function findAllReachablePositions(start: Position, grid: CellType[][]): Set<string> {
  const reachable: Set<string> = new Set();
  const visited: Set<string> = new Set();
  const queue: Position[] = [start];
  
  visited.add(positionKey(start));
  
  // Directions: right, left, down, up
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = positionKey(current);
    
    reachable.add(currentKey);
    
    for (const dir of directions) {
      const neighborPos: Position = {
        x: current.x + dir.x,
        y: current.y + dir.y
      };
      
      const neighborKey = positionKey(neighborPos);
      
      if (
        isInBounds(neighborPos, grid) && 
        isWalkable(neighborPos, grid) && 
        !visited.has(neighborKey)
      ) {
        visited.add(neighborKey);
        queue.push(neighborPos);
      }
    }
  }
  
  return reachable;
}

/**
 * Check if a position is adjacent to any position in a set of reachable positions
 * 
 * @param position Position to check
 * @param reachablePositions Set of reachable position keys
 * @param grid The game grid
 * @returns True if the position is adjacent to a reachable position
 */
export function isAdjacentToReachable(position: Position, reachablePositions: Set<string>, grid: CellType[][]): boolean {
  // Directions: right, left, down, up
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  
  for (const dir of directions) {
    const adjacentPos: Position = {
      x: position.x + dir.x,
      y: position.y + dir.y
    };
    
    if (
      isInBounds(adjacentPos, grid) && 
      reachablePositions.has(positionKey(adjacentPos))
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Identify critical path cells - empty cells that are necessary for reaching sofas
 * 
 * @param grid The game grid
 * @param doorPosition The position of the door
 * @returns Set of position keys representing critical path cells
 */
export function identifyCriticalPaths(grid: CellType[][], doorPosition: Position): Set<string> {
  // Directions for adjacent cells
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  
  // Find an empty cell adjacent to the door to start pathfinding from
  let doorAdjacentEmpty: Position | null = null;
  
  for (const dir of directions) {
    const pos = {
      x: doorPosition.x + dir.x,
      y: doorPosition.y + dir.y
    };
    
    if (isInBounds(pos, grid) && grid[pos.y][pos.x] === 'empty') {
      doorAdjacentEmpty = pos;
      break;
    }
  }
  
  if (!doorAdjacentEmpty) {
    return new Set(); // Door is blocked, no critical paths
  }
  
  // Find all sofa positions and their adjacent empty cells
  const sofaPositions: Position[] = [];
  const sofaAdjacentEmptyCells: Position[] = [];
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x].startsWith('sofa')) {
        sofaPositions.push({ x, y });
        
        // Find adjacent empty cells for this sofa
        for (const dir of directions) {
          const adjacentPos = {
            x: x + dir.x,
            y: y + dir.y
          };
          
          if (isInBounds(adjacentPos, grid) && grid[adjacentPos.y][adjacentPos.x] === 'empty') {
            sofaAdjacentEmptyCells.push(adjacentPos);
          }
        }
      }
    }
  }
  
  if (sofaPositions.length === 0) {
    return new Set(); // No sofas, no critical paths
  }
  
  // Group sofas by connected components
  const sofaGroups: Position[][] = [];
  const visitedSofas: Set<string> = new Set();
  
  for (const sofaPos of sofaPositions) {
    const sofaKey = positionKey(sofaPos);
    if (visitedSofas.has(sofaKey)) continue;
    
    const group: Position[] = [];
    const queue: Position[] = [sofaPos];
    visitedSofas.add(sofaKey);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      group.push(current);
      
      // Check adjacent cells for connected sofas
      for (const dir of directions) {
        const adjacentPos = {
          x: current.x + dir.x,
          y: current.y + dir.y
        };
        
        const adjacentKey = positionKey(adjacentPos);
        
        if (
          isInBounds(adjacentPos, grid) && 
          grid[adjacentPos.y][adjacentPos.x].startsWith('sofa') && 
          !visitedSofas.has(adjacentKey)
        ) {
          visitedSofas.add(adjacentKey);
          queue.push(adjacentPos);
        }
      }
    }
    
    sofaGroups.push(group);
  }
  
  // Find all empty cells
  const emptyCells: Position[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'empty') {
        emptyCells.push({ x, y });
      }
    }
  }
  
  // Initialize critical paths set
  const criticalPaths: Set<string> = new Set();
  
  // The cell adjacent to the door is always critical
  criticalPaths.add(positionKey(doorAdjacentEmpty));
  
  // For each sofa group, find all critical paths to it
  for (const group of sofaGroups) {
    // Find all empty cells adjacent to this sofa group
    const adjacentEmptyCells: Position[] = [];
    const visitedCells: Set<string> = new Set();
    
    for (const sofaPos of group) {
      for (const dir of directions) {
        const adjacentPos = {
          x: sofaPos.x + dir.x,
          y: sofaPos.y + dir.y
        };
        
        const adjacentKey = positionKey(adjacentPos);
        
        if (
          isInBounds(adjacentPos, grid) && 
          grid[adjacentPos.y][adjacentPos.x] === 'empty' && 
          !visitedCells.has(adjacentKey)
        ) {
          visitedCells.add(adjacentKey);
          adjacentEmptyCells.push(adjacentPos);
        }
      }
    }
    
    // For each adjacent empty cell, find the shortest path to it from the door
    for (const targetCell of adjacentEmptyCells) {
      const path = findPath(doorAdjacentEmpty, targetCell, grid);
      
      if (path) {
        // Mark all cells in this path as critical
        for (const pathCell of path) {
          criticalPaths.add(positionKey(pathCell));
        }
      }
    }
  }
  
  // Second pass: For each empty cell that's not already marked as critical,
  // check if removing it would make any sofa group unreachable
  for (const emptyCell of emptyCells) {
    const cellKey = positionKey(emptyCell);
    
    // Skip if already marked as critical
    if (criticalPaths.has(cellKey)) {
      continue;
    }
    
    // Create a temporary grid with this cell blocked
    const tempGrid = grid.map(row => [...row]);
    tempGrid[emptyCell.y][emptyCell.x] = 'wall'; // Temporarily block this cell
    
    // Check if all sofa groups are still reachable
    let isCritical = false;
    
    for (const group of sofaGroups) {
      let isGroupReachable = false;
      
      // Find all empty cells adjacent to this sofa group
      for (const sofaPos of group) {
        for (const dir of directions) {
          const adjacentPos = {
            x: sofaPos.x + dir.x,
            y: sofaPos.y + dir.y
          };
          
          if (
            isInBounds(adjacentPos, tempGrid) && 
            tempGrid[adjacentPos.y][adjacentPos.x] === 'empty'
          ) {
            // Check if there's a path from the door to this adjacent cell
            const path = findPath(doorAdjacentEmpty, adjacentPos, tempGrid);
            if (path !== null) {
              isGroupReachable = true;
              break;
            }
          }
        }
        
        if (isGroupReachable) break;
      }
      
      if (!isGroupReachable) {
        isCritical = true;
        break;
      }
    }
    
    if (isCritical) {
      criticalPaths.add(cellKey);
    }
  }
  
  // Third pass: Identify bottleneck paths
  // For each sofa adjacent empty cell, find all possible paths to it
  // and mark cells that appear in all possible paths as critical
  for (const targetCell of sofaAdjacentEmptyCells) {
    const targetKey = positionKey(targetCell);
    
    // Skip if this cell is not reachable
    const pathToTarget = findPath(doorAdjacentEmpty, targetCell, grid);
    if (!pathToTarget) continue;
    
    // Find all possible paths to this target cell
    const allPaths: Position[][] = [];
    const maxPathLength = pathToTarget.length * 2; // Limit path length to avoid excessive computation
    
    // Helper function to find all paths using DFS
    const findAllPaths = (
      current: Position, 
      target: Position, 
      visited: Set<string>, 
      currentPath: Position[]
    ) => {
      const currentKey = positionKey(current);
      
      // Base case: reached target
      if (current.x === target.x && current.y === target.y) {
        allPaths.push([...currentPath, current]);
        return;
      }
      
      // Base case: path too long
      if (currentPath.length > maxPathLength) {
        return;
      }
      
      // Mark current cell as visited
      visited.add(currentKey);
      currentPath.push(current);
      
      // Try all directions
      for (const dir of directions) {
        const nextPos = {
          x: current.x + dir.x,
          y: current.y + dir.y
        };
        
        const nextKey = positionKey(nextPos);
        
        if (
          isInBounds(nextPos, grid) && 
          (grid[nextPos.y][nextPos.x] === 'empty' || (nextPos.x === target.x && nextPos.y === target.y)) && 
          !visited.has(nextKey)
        ) {
          findAllPaths(nextPos, target, new Set(visited), [...currentPath]);
        }
      }
    };
    
    // Find up to 5 different paths to limit computation
    findAllPaths(doorAdjacentEmpty, targetCell, new Set(), []);
    
    // Limit to 5 paths to avoid excessive computation
    const limitedPaths = allPaths.slice(0, 5);
    
    if (limitedPaths.length > 1) {
      // Find cells that appear in all paths (bottleneck cells)
      const cellCounts: Map<string, number> = new Map();
      
      for (const path of limitedPaths) {
        const pathCellKeys = new Set<string>();
        
        for (const cell of path) {
          pathCellKeys.add(positionKey(cell));
        }
        
        pathCellKeys.forEach(key => {
          cellCounts.set(key, (cellCounts.get(key) || 0) + 1);
        });
      }
      
      // Cells that appear in all paths are bottlenecks
      cellCounts.forEach((count, key) => {
        if (count === limitedPaths.length) {
          criticalPaths.add(key);
        }
      });
    } else if (limitedPaths.length === 1) {
      // If there's only one path, all cells in it are critical
      for (const cell of limitedPaths[0]) {
        criticalPaths.add(positionKey(cell));
      }
    }
  }
  
  return criticalPaths;
}