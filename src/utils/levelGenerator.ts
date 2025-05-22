import { Position, SofaInventory, Level } from "@/types/game";

// Level complexity settings
export interface ComplexitySettings {
  width: number;
  height: number;
  wallDensity: number; // 0-1, percentage of interior cells that will be walls
  roomComplexity: number; // 0-1, how complex the room shape should be
  minEmptySpaces: number; // Minimum number of empty spaces required
  inventory: SofaInventory; // Number of each sofa type available
}

export interface GeneratedLevel {
  width: number;
  height: number;
  walls: Position[];
  doorPosition: Position;
  name: string;
  inventory: SofaInventory;
}

/**
 * Generate a random level based on complexity settings
 */
export function generateLevel(
  complexity: number, // 0-1 scale
  levelNumber: number
): GeneratedLevel {
  // Scale complexity to actual settings
  const width = Math.floor(6 + complexity * 6); // 6-12
  const height = Math.floor(6 + complexity * 6); // 6-12
  
  // Calculate inventory based on room size and complexity
  const totalArea = width * height;
  const estimatedEmptySpaces = totalArea * 0.6; // Estimate 60% of cells will be empty
  
  // Calculate inventory - more complex levels get fewer pieces to make them harder
  const inventoryScale = 1 - (complexity * 0.3); // Scale from 1.0 to 0.7
  const singleCount = Math.max(2, Math.floor((estimatedEmptySpaces / 10) * inventoryScale));
  const rectangularCount = Math.max(1, Math.floor((estimatedEmptySpaces / 15) * inventoryScale));
  const lShapedCount = Math.max(1, Math.floor((estimatedEmptySpaces / 20) * inventoryScale));
  
  const settings: ComplexitySettings = {
    width,
    height,
    wallDensity: 0.1 + complexity * 0.2, // 0.1-0.3
    roomComplexity: complexity,
    minEmptySpaces: Math.floor(10 + complexity * 20), // 10-30
    inventory: {
      single: singleCount,
      rectangular: rectangularCount,
      'l-shaped': lShapedCount
    }
  };

  // Initialize grid with all empty cells
  const grid: string[][] = Array(settings.height)
    .fill(null)
    .map(() => Array(settings.width).fill("empty"));

  // Add outer walls
  addOuterWalls(grid);

  // Generate room shape based on complexity
  if (settings.roomComplexity > 0.3) {
    if (settings.roomComplexity > 0.7) {
      // Complex room with multiple sections
      createComplexRoom(grid, settings);
    } else {
      // L-shaped or U-shaped room
      createShapedRoom(grid, settings);
    }
  }

  // Add some random interior walls
  addInteriorWalls(grid, settings);

  // Place door in a valid position
  const doorPosition = placeDoor(grid);

  // Ensure the level is valid (has enough empty spaces, door is accessible)
  if (!validateLevel(grid, doorPosition, settings)) {
    // If invalid, try again with slightly lower complexity
    return generateLevel(Math.max(0, complexity - 0.1), levelNumber);
  }

  // Convert grid to walls array
  const walls: Position[] = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "wall") {
        walls.push({ x, y });
      }
    }
  }

  return {
    width: settings.width,
    height: settings.height,
    walls,
    doorPosition,
    name: `Level ${levelNumber}: ${getLevelName(settings)}`,
    inventory: settings.inventory
  };
}

/**
 * Add outer walls to the grid
 */
function addOuterWalls(grid: string[][]): void {
  const height = grid.length;
  const width = grid[0].length;

  // Top and bottom walls
  for (let x = 0; x < width; x++) {
    grid[0][x] = "wall";
    grid[height - 1][x] = "wall";
  }

  // Left and right walls
  for (let y = 0; y < height; y++) {
    grid[y][0] = "wall";
    grid[y][width - 1] = "wall";
  }
}

/**
 * Create an L-shaped or U-shaped room
 */
function createShapedRoom(grid: string[][], settings: ComplexitySettings): void {
  const height = grid.length;
  const width = grid[0].length;
  
  // Decide on L or U shape
  const isUShape = Math.random() > 0.5 && settings.roomComplexity > 0.5;
  
  // Calculate wall positions
  const wallStartX = Math.floor(width * 0.4);
  const wallEndX = Math.floor(width * 0.7);
  const wallStartY = Math.floor(height * 0.4);
  const wallEndY = Math.floor(height * 0.7);
  
  // Create L-shape
  for (let y = 1; y < wallEndY; y++) {
    grid[y][wallStartX] = "wall";
  }
  
  for (let x = wallStartX; x < width - 1; x++) {
    grid[wallStartY][x] = "wall";
  }
  
  // Add extra wall for U-shape
  if (isUShape) {
    for (let y = 1; y < wallEndY; y++) {
      grid[y][wallEndX] = "wall";
    }
  }
}

/**
 * Create a complex room with multiple sections
 */
function createComplexRoom(grid: string[][], settings: ComplexitySettings): void {
  const height = grid.length;
  const width = grid[0].length;
  
  // Create a few room dividers
  const numDividers = Math.floor(2 + settings.roomComplexity * 3); // 2-5 dividers
  
  for (let i = 0; i < numDividers; i++) {
    // Decide if horizontal or vertical divider
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
      // Horizontal divider
      const y = Math.floor(height * 0.3 + Math.random() * height * 0.4);
      const startX = Math.floor(1 + Math.random() * (width * 0.3));
      const endX = Math.floor(width * 0.7 + Math.random() * (width * 0.3) - 1);
      
      // Add a gap somewhere in the divider
      const gapPos = Math.floor(startX + Math.random() * (endX - startX - 1));
      
      for (let x = startX; x <= endX; x++) {
        if (x !== gapPos) {
          grid[y][x] = "wall";
        }
      }
    } else {
      // Vertical divider
      const x = Math.floor(width * 0.3 + Math.random() * width * 0.4);
      const startY = Math.floor(1 + Math.random() * (height * 0.3));
      const endY = Math.floor(height * 0.7 + Math.random() * (height * 0.3) - 1);
      
      // Add a gap somewhere in the divider
      const gapPos = Math.floor(startY + Math.random() * (endY - startY - 1));
      
      for (let y = startY; y <= endY; y++) {
        if (y !== gapPos) {
          grid[y][x] = "wall";
        }
      }
    }
  }
}

/**
 * Add random interior walls
 */
function addInteriorWalls(grid: string[][], settings: ComplexitySettings): void {
  const height = grid.length;
  const width = grid[0].length;
  
  // Calculate number of walls to add
  const totalInteriorCells = (width - 2) * (height - 2);
  const numWalls = Math.floor(totalInteriorCells * settings.wallDensity);
  
  // Add random walls
  let wallsAdded = 0;
  while (wallsAdded < numWalls) {
    const x = Math.floor(1 + Math.random() * (width - 2));
    const y = Math.floor(1 + Math.random() * (height - 2));
    
    // Only add wall if cell is empty
    if (grid[y][x] === "empty") {
      grid[y][x] = "wall";
      wallsAdded++;
    }
  }
}

/**
 * Place a door in a valid position on the outer wall
 */
function placeDoor(grid: string[][]): Position {
  const height = grid.length;
  const width = grid[0].length;
  
  // Possible door positions (on outer walls)
  const possiblePositions: Position[] = [];
  
  // Check left and right walls
  for (let y = 1; y < height - 1; y++) {
    possiblePositions.push({ x: 0, y });
    possiblePositions.push({ x: width - 1, y });
  }
  
  // Check top and bottom walls
  for (let x = 1; x < width - 1; x++) {
    possiblePositions.push({ x, y: 0 });
    possiblePositions.push({ x, y: height - 1 });
  }
  
  // Shuffle possible positions
  for (let i = possiblePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [possiblePositions[i], possiblePositions[j]] = [possiblePositions[j], possiblePositions[i]];
  }
  
  // Find a position where the door can be placed
  for (const pos of possiblePositions) {
    // Check if there's an adjacent empty cell inside the room
    const adjacentPositions = [
      { x: pos.x + 1, y: pos.y },
      { x: pos.x - 1, y: pos.y },
      { x: pos.x, y: pos.y + 1 },
      { x: pos.x, y: pos.y - 1 },
    ];
    
    for (const adjPos of adjacentPositions) {
      if (
        adjPos.x > 0 && adjPos.x < width - 1 &&
        adjPos.y > 0 && adjPos.y < height - 1 &&
        grid[adjPos.y][adjPos.x] === "empty"
      ) {
        // Found a valid door position
        grid[pos.y][pos.x] = "door";
        return pos;
      }
    }
  }
  
  // Fallback to a default position if no valid position found
  const defaultPos = { x: 0, y: Math.floor(height / 2) };
  grid[defaultPos.y][defaultPos.x] = "door";
  return defaultPos;
}

/**
 * Validate that the level is playable
 */
function validateLevel(
  grid: string[][],
  doorPosition: Position,
  settings: ComplexitySettings
): boolean {
  const height = grid.length;
  const width = grid[0].length;
  
  // Count empty spaces and check if door is accessible
  let emptySpaces = 0;
  const visited: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false));
  
  // Flood fill from door to find all accessible spaces
  const queue: Position[] = [];
  
  // Find empty cell adjacent to door
  const adjacentPositions = [
    { x: doorPosition.x + 1, y: doorPosition.y },
    { x: doorPosition.x - 1, y: doorPosition.y },
    { x: doorPosition.x, y: doorPosition.y + 1 },
    { x: doorPosition.x, y: doorPosition.y - 1 },
  ];
  
  for (const pos of adjacentPositions) {
    if (
      pos.x >= 0 && pos.x < width &&
      pos.y >= 0 && pos.y < height &&
      grid[pos.y][pos.x] === "empty"
    ) {
      queue.push(pos);
      visited[pos.y][pos.x] = true;
      emptySpaces++;
      break;
    }
  }
  
  // If no empty cell adjacent to door, level is invalid
  if (queue.length === 0) {
    return false;
  }
  
  // Flood fill to count accessible empty spaces
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];
    
    for (const neighbor of neighbors) {
      if (
        neighbor.x >= 0 && neighbor.x < width &&
        neighbor.y >= 0 && neighbor.y < height &&
        grid[neighbor.y][neighbor.x] === "empty" &&
        !visited[neighbor.y][neighbor.x]
      ) {
        visited[neighbor.y][neighbor.x] = true;
        queue.push(neighbor);
        emptySpaces++;
      }
    }
  }
  
  // Check if there are enough empty spaces
  return emptySpaces >= settings.minEmptySpaces;
}

/**
 * Generate a descriptive name for the level based on its characteristics
 */
function getLevelName(settings: ComplexitySettings): string {
  const sizeNames = ["Small", "Medium", "Large", "Huge"];
  const sizeIndex = Math.min(
    Math.floor((settings.width + settings.height) / 12) - 1,
    sizeNames.length - 1
  );
  
  const complexityNames = [
    "Simple",
    "Cozy",
    "Interesting",
    "Complex",
    "Challenging"
  ];
  const complexityIndex = Math.min(
    Math.floor(settings.roomComplexity * 5),
    complexityNames.length - 1
  );
  
  const roomTypes = [
    "Room",
    "Apartment",
    "Studio",
    "Loft",
    "Suite"
  ];
  const roomTypeIndex = Math.floor(Math.random() * roomTypes.length);
  
  return `${sizeNames[sizeIndex]} ${complexityNames[complexityIndex]} ${roomTypes[roomTypeIndex]}`;
}