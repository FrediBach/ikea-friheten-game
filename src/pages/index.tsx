import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { SofaRenderer, SofaSelectionButton } from "@/components/SofaVisuals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { generateLevel } from "@/utils/levelGenerator";
import { CellType, Position, SofaType, SofaPiece, Level, Rotation, SofaInventory } from "@/types/game";
import { findPath, findAllReachablePositions, isAdjacentToReachable, identifyCriticalPaths } from "@/utils/pathfinding";

// Number of predefined levels before generating procedural ones
const NUM_PREDEFINED_LEVELS = 2;

// Predefined game levels
const predefinedLevels: Level[] = [
  {
    name: "Level 1: Small Room",
    width: 6,
    height: 6,
    walls: [
      // Top wall
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 },
      // Bottom wall
      { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
      // Left wall (excluding door)
      { x: 0, y: 1 }, { x: 0, y: 3 }, { x: 0, y: 4 },
      // Right wall
      { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
    ],
    doorPosition: { x: 0, y: 2 },
    inventory: {
      single: 3,
      rectangular: 2,
      'l-shaped': 1
    }
  },
  {
    name: "Level 2: L-Shaped Room",
    width: 8,
    height: 8,
    walls: [
      // Outer walls
      // Top
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 7, y: 0 },
      // Bottom
      { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 },
      // Left
      { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 5 }, { x: 0, y: 6 },
      // Right
      { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 },
      
      // Inner walls to create L-shape
      { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 }, // Removed wall at {x: 1, y: 4} to ensure door access
      { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 },
    ],
    doorPosition: { x: 0, y: 4 },
    inventory: {
      single: 4,
      rectangular: 3,
      'l-shaped': 2
    }
  }
];

// Function to get a level (predefined or generated)
function getLevel(levelIndex: number): Level {
  if (levelIndex < NUM_PREDEFINED_LEVELS) {
    return predefinedLevels[levelIndex];
  } else {
    // Calculate complexity based on level number (0.2 to 0.9)
    const complexity = Math.min(0.2 + (levelIndex - NUM_PREDEFINED_LEVELS) * 0.1, 0.9);
    return generateLevel(complexity, levelIndex + 1);
  }
}

// Available sofa types
const availableSofaTypes: SofaType[] = ['single', 'rectangular', 'l-shaped'];

export default function Home() {
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [sofas, setSofas] = useState<SofaPiece[]>([]);
  const [selectedSofaType, setSelectedSofaType] = useState<SofaType>('rectangular');
  const [selectedRotation, setSelectedRotation] = useState<Rotation>(0);
  const [nextSofaId, setNextSofaId] = useState(1);
  const [message, setMessage] = useState<string>('Place sofas in the room. Make sure all sofas are reachable and the door is not blocked.');
  const [currentLevel, setCurrentLevel] = useState<Level>(getLevel(0));
  const [levelIndex, setLevelIndex] = useState(0);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showCustomLevelDialog, setShowCustomLevelDialog] = useState(false);
  const [customComplexity, setCustomComplexity] = useState(0.5);
  const [criticalPathCells, setCriticalPathCells] = useState<Set<string>>(new Set());
  const [showCriticalPaths, setShowCriticalPaths] = useState(false);
  const [inventory, setInventory] = useState<SofaInventory>({ single: 0, rectangular: 0, 'l-shaped': 0 });

  // Initialize the grid based on the current level
  useEffect(() => {
    initializeGrid();
  }, [currentLevel]);

  const initializeGrid = () => {
    const { width, height, walls, doorPosition, inventory: levelInventory } = currentLevel;
    const newGrid: CellType[][] = Array(height).fill(null).map(() => Array(width).fill('empty'));
    
    // Add walls
    walls.forEach(wall => {
      newGrid[wall.y][wall.x] = 'wall';
    });
    
    // Add door
    newGrid[doorPosition.y][doorPosition.x] = 'door';
    
    // Reset inventory
    setInventory({ ...levelInventory });
    
    setGrid(newGrid);
    setSofas([]);
    setNextSofaId(1);
    setScore(0);
  };

  // Check if a position is within the grid bounds
  const isInBounds = (pos: Position): boolean => {
    return pos.x >= 0 && pos.x < currentLevel.width && pos.y >= 0 && pos.y < currentLevel.height;
  };

  // Check if a cell is empty (can place a sofa)
  const isCellEmpty = (pos: Position): boolean => {
    if (!isInBounds(pos)) return false;
    return grid[pos.y][pos.x] === 'empty';
  };

  // Get cells occupied by a sofa based on its type, position, and rotation
  const getSofaCells = (type: SofaType, pos: Position, rotation: Rotation): Position[] => {
    switch (type) {
      case 'single':
        return [pos];
      case 'rectangular':
        if (rotation === 0 || rotation === 180) {
          return [pos, { x: pos.x + 1, y: pos.y }];
        } else {
          return [pos, { x: pos.x, y: pos.y + 1 }];
        }
      case 'l-shaped':
        if (rotation === 0) {
          return [pos, { x: pos.x + 1, y: pos.y }, { x: pos.x, y: pos.y + 1 }];
        } else if (rotation === 90) {
          return [pos, { x: pos.x, y: pos.y - 1 }, { x: pos.x + 1, y: pos.y }];
        } else if (rotation === 180) {
          return [pos, { x: pos.x - 1, y: pos.y }, { x: pos.x, y: pos.y - 1 }];
        } else { // 270
          return [pos, { x: pos.x - 1, y: pos.y }, { x: pos.x, y: pos.y + 1 }];
        }
      default:
        return [pos];
    }
  };

  // Check if a sofa can be placed at a position
  const canPlaceSofa = (type: SofaType, pos: Position, rotation: Rotation): boolean => {
    // Check if we have this sofa type in inventory
    if (inventory[type] <= 0) {
      return false;
    }
    
    // Check if all cells are empty
    const cells = getSofaCells(type, pos, rotation);
    return cells.every(cell => isCellEmpty(cell));
  };

  // Place a sofa on the grid
  const placeSofa = (type: SofaType, pos: Position, rotation: Rotation) => {
    if (!canPlaceSofa(type, pos, rotation)) {
      if (inventory[type] <= 0) {
        setMessage(`No more ${type} sofas available in inventory!`);
      } else {
        setMessage("Can't place sofa here!");
      }
      return;
    }
    
    // Decrease inventory
    setInventory({
      ...inventory,
      [type]: inventory[type] - 1
    });

    // Create a new sofa
    const newSofa: SofaPiece = {
      type,
      position: pos,
      rotation,
      id: nextSofaId
    };

    // Update the grid
    const newGrid = [...grid.map(row => [...row])];
    const cells = getSofaCells(type, pos, rotation);
    
    cells.forEach(cell => {
      let cellType: CellType;
      if (type === 'single') {
        cellType = 'sofa-single';
      } else if (type === 'rectangular') {
        cellType = rotation === 0 || rotation === 180 ? 'sofa-rect-h' : 'sofa-rect-v';
      } else if (type === 'l-shaped') {
        cellType = `sofa-l-${rotation}` as CellType;
      } else {
        cellType = 'sofa-single'; // Fallback
      }
      
      newGrid[cell.y][cell.x] = cellType;
    });

    setGrid(newGrid);
    setSofas([...sofas, newSofa]);
    setNextSofaId(nextSofaId + 1);
    setScore(score + cells.length); // Add points based on sofa size
    
    // Check if all constraints are satisfied
    checkConstraints(newGrid);
  };

  // Remove a sofa from the grid
  const removeSofa = (x: number, y: number) => {
    // Find which sofa occupies this cell
    const cellType = grid[y][x];
    if (!cellType.startsWith('sofa')) return;
    
    // Find the sofa type to return to inventory
    let sofaType: SofaType = 'single';
    if (cellType === 'sofa-single') {
      sofaType = 'single';
    } else if (cellType.startsWith('sofa-rect')) {
      sofaType = 'rectangular';
    } else if (cellType.startsWith('sofa-l')) {
      sofaType = 'l-shaped';
    }
    
    // Create a new grid
    const newGrid = [...grid.map(row => [...row])];
    
    // Find all cells with the same sofa type that are connected
    const floodFill = (x: number, y: number, type: CellType) => {
      if (!isInBounds({x, y}) || newGrid[y][x] !== type) return;
      
      newGrid[y][x] = 'empty';
      
      floodFill(x+1, y, type);
      floodFill(x-1, y, type);
      floodFill(x, y+1, type);
      floodFill(x, y-1, type);
    };
    
    floodFill(x, y, cellType);
    
    // Update the grid and recalculate score
    setGrid(newGrid);
    
    // Remove the sofa from the sofas array
    const removedSofas = sofas.filter(sofa => {
      const cells = getSofaCells(sofa.type, sofa.position, sofa.rotation);
      return cells.some(cell => grid[cell.y][cell.x] === cellType);
    });
    
    const updatedSofas = sofas.filter(sofa => {
      const cells = getSofaCells(sofa.type, sofa.position, sofa.rotation);
      return !cells.some(cell => grid[cell.y][cell.x] === cellType);
    });
    
    // Return the sofa to inventory
    if (removedSofas.length > 0) {
      setInventory({
        ...inventory,
        [sofaType]: inventory[sofaType] + 1
      });
    }
    
    setSofas(updatedSofas);
    
    // Recalculate score
    let newScore = 0;
    newGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.startsWith('sofa')) newScore++;
      });
    });
    
    setScore(newScore);
    setMessage("Sofa removed!");
  };

  // Check if all sofas are reachable and door is not blocked
  const checkConstraints = (currentGrid: CellType[][]) => {
    // Check if door is blocked
    const { doorPosition } = currentLevel;
    const doorNeighbors = [
      { x: doorPosition.x + 1, y: doorPosition.y },
      { x: doorPosition.x - 1, y: doorPosition.y },
      { x: doorPosition.x, y: doorPosition.y + 1 },
      { x: doorPosition.x, y: doorPosition.y - 1 }
    ].filter(isInBounds);

    // Find an empty cell adjacent to the door to start pathfinding from
    const doorAdjacentEmpty = doorNeighbors.find(pos => 
      isInBounds(pos) && currentGrid[pos.y][pos.x] === 'empty'
    );

    if (!doorAdjacentEmpty) {
      setMessage("The door is blocked! Make sure there's at least one empty space next to the door.");
      return false;
    }

    // Find all positions that are reachable from the door using our pathfinding utility
    const reachablePositions = findAllReachablePositions(doorAdjacentEmpty, currentGrid);
    
    // Group sofa cells by their type and position to check reachability for entire sofas
    const sofaCells: Map<string, Position[]> = new Map();
    let sofaIdCounter = 0;
    
    // Create a grid to track which sofa ID each cell belongs to
    const sofaIdGrid: number[][] = Array(currentGrid.length).fill(null)
      .map(() => Array(currentGrid[0].length).fill(-1));
    
    // First pass: assign IDs to each sofa using flood fill
    for (let y = 0; y < currentGrid.length; y++) {
      for (let x = 0; x < currentGrid[y].length; x++) {
        if (currentGrid[y][x].startsWith('sofa') && sofaIdGrid[y][x] === -1) {
          const sofaType = currentGrid[y][x];
          const sofaCellsForThisSofa: Position[] = [];
          
          // Flood fill to find all connected cells of this sofa
          const floodFillSofa = (fx: number, fy: number) => {
            if (!isInBounds({x: fx, y: fy}) || 
                !currentGrid[fy][fx].startsWith('sofa') || 
                sofaIdGrid[fy][fx] !== -1 ||
                currentGrid[fy][fx] !== sofaType) return;
            
            sofaIdGrid[fy][fx] = sofaIdCounter;
            sofaCellsForThisSofa.push({x: fx, y: fy});
            
            floodFillSofa(fx+1, fy);
            floodFillSofa(fx-1, fy);
            floodFillSofa(fx, fy+1);
            floodFillSofa(fx, fy-1);
          };
          
          floodFillSofa(x, y);
          sofaCells.set(`sofa-${sofaIdCounter}`, sofaCellsForThisSofa);
          sofaIdCounter++;
        }
      }
    }
    
    // Check if each sofa is reachable using A* pathfinding
    let allSofasReachable = true;
    
    sofaCells.forEach((cells, sofaId) => {
      let isSofaReachable = false;
      
      // For each sofa, check if any of its cells has an adjacent empty cell that is reachable
      for (const cell of cells) {
        if (isAdjacentToReachable(cell, reachablePositions, currentGrid)) {
          // If we find an adjacent reachable cell, verify there's a path to it
          // Find the adjacent empty cell
          const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
          ];
          
          for (const dir of directions) {
            const adjacentPos = {
              x: cell.x + dir.x,
              y: cell.y + dir.y
            };
            
            const posKey = `${adjacentPos.x},${adjacentPos.y}`;
            
            if (
              isInBounds(adjacentPos) && 
              currentGrid[adjacentPos.y][adjacentPos.x] === 'empty' &&
              reachablePositions.has(posKey)
            ) {
              // Verify there's a path from the door to this empty cell
              const path = findPath(doorAdjacentEmpty, adjacentPos, currentGrid);
              if (path !== null) {
                isSofaReachable = true;
                break;
              }
            }
          }
        }
        
        if (isSofaReachable) break;
      }
      
      if (!isSofaReachable) {
        // Find a representative cell to report in the error message
        const reportCell = cells[0];
        setMessage(`Sofa at position (${reportCell.x}, ${reportCell.y}) is not reachable! Make sure there's a path to each sofa.`);
        allSofasReachable = false;
      }
    });
    
    if (!allSofasReachable) {
      return false;
    }
    
    setMessage("Good job! Keep placing sofas to fill the room.");
    return true;
  };

  // Check the solution
  const checkSolution = () => {
    // Check if all constraints are satisfied
    if (!checkConstraints(grid)) {
      setShowCriticalPaths(false);
      setCriticalPathCells(new Set());
      return; // Constraints not satisfied, don't proceed
    }
    
    // Identify critical paths - empty cells necessary for reaching sofas
    const criticalPaths = identifyCriticalPaths(grid, currentLevel.doorPosition);
    setCriticalPathCells(criticalPaths);
    setShowCriticalPaths(true);
    
    // Count empty cells that are not part of critical paths
    let fillableEmptyCells = 0;
    
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === 'empty') {
          const posKey = `${x},${y}`;
          if (!criticalPaths.has(posKey)) {
            fillableEmptyCells++;
          }
        }
      }
    }
    
    if (fillableEmptyCells <= 3) { // Allow a few empty cells
      setShowSuccessDialog(true);
      setShowCriticalPaths(false); // Hide critical paths when showing success dialog
    } else {
      setMessage(`You can still place more sofas! There are ${fillableEmptyCells} fillable spaces left. Critical paths are highlighted.`);
    }
  };
  
  // Toggle critical paths visibility
  const toggleCriticalPaths = () => {
    if (showCriticalPaths) {
      setShowCriticalPaths(false);
    } else {
      const criticalPaths = identifyCriticalPaths(grid, currentLevel.doorPosition);
      setCriticalPathCells(criticalPaths);
      setShowCriticalPaths(true);
    }
  };

  // Rotate the selected sofa
  const rotateSofa = () => {
    // Rotate 90 degrees clockwise
    const newRotation = (selectedRotation + 90) % 360 as Rotation;
    setSelectedRotation(newRotation);
  };

  // Handle cell click to place or remove a sofa
  const handleCellClick = (x: number, y: number) => {
    if (isRemoving) {
      if (grid[y][x].startsWith('sofa')) {
        removeSofa(x, y);
      }
    } else if (grid[y][x] === 'empty') {
      placeSofa(selectedSofaType, { x, y }, selectedRotation);
    }
  };

  // Reset the game
  const resetGame = () => {
    initializeGrid();
    setMessage('Place sofas in the room. Make sure all sofas are reachable and the door is not blocked.');
    setIsRemoving(false);
  };

  // Go to next level
  const goToNextLevel = () => {
    const nextLevelIndex = levelIndex + 1;
    setLevelIndex(nextLevelIndex);
    setCurrentLevel(getLevel(nextLevelIndex));
    setShowSuccessDialog(false);
  };
  
  // Generate a custom level
  const generateCustomLevel = () => {
    const customLevel = generateLevel(customComplexity, 0);
    setCurrentLevel(customLevel);
    setShowCustomLevelDialog(false);
    resetGame();
  };

  return (
    <>
      <Head>
        <title>Friheten - Ikea Sofa Game</title>
        <meta name="description" content="A game inspired by Ikea Friheten sofas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-background min-h-screen flex flex-col" style={{ backgroundColor: "#FBDA0C" }}>
        <main className="flex-1 p-4">
          <div className="container mx-auto">
            <Header />
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Game Info and Controls Column */}
              <div className="lg:w-1/3">
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div style={{ color: "#0057AD" }}>
                        <CardTitle>Friheten - Ikea Sofa Game</CardTitle>
                        <CardDescription>
                          Fill the room with sofas while keeping them all reachable.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-lg p-2" style={{ whiteSpace: "nowrap" }}>
                        Score: {score}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium mt-2">{currentLevel.name}</div>
                  </CardHeader>
                  <CardContent>
                    {/* Game message */}
                    <div className="mb-4 text-center p-2 bg-muted rounded-md w-full">
                      {message}
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory Card */}
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {availableSofaTypes.map((type) => (
                        <div 
                          key={type} 
                          className={`flex flex-col items-center p-2 rounded-md border-2 ${
                            selectedSofaType === type && !isRemoving 
                              ? 'border-primary bg-primary/10' 
                              : 'border-muted'
                          }`}
                        >
                          <SofaSelectionButton
                            type={type}
                            rotation={selectedSofaType === type ? selectedRotation : 0}
                            selected={selectedSofaType === type && !isRemoving}
                            onRotate={selectedSofaType === type ? rotateSofa : undefined}
                            onClick={() => { 
                              if (inventory[type] > 0) {
                                setSelectedSofaType(type); 
                                setIsRemoving(false);
                              } else {
                                setMessage(`No more ${type} sofas available!`);
                              }
                            }}
                          />
                          <div className="mt-2 text-center">
                            <Badge 
                              variant={inventory[type] > 0 ? "default" : "outline"} 
                              className="w-full"
                            >
                              {inventory[type]} left
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Controls Card */}
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Rotation control */}
                    {!isRemoving && (selectedSofaType === 'rectangular' || selectedSofaType === 'l-shaped') && (
                      <div className="flex items-center justify-between">
                        <span>Rotation: {selectedRotation}°</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={rotateSofa}
                        >
                          Rotate
                        </Button>
                      </div>
                    )}
                    
                    {/* Remove sofa toggle */}
                    <div className="flex items-center justify-between">
                      <span>Remove Mode:</span>
                      <Button 
                        variant={isRemoving ? "destructive" : "outline"}
                        onClick={() => setIsRemoving(!isRemoving)}
                        size="sm"
                      >
                        {isRemoving ? "Cancel" : "Remove Sofa"}
                      </Button>
                    </div>
                    
                    {/* Critical paths toggle */}
                    {sofas.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Critical Paths:</span>
                        <Button 
                          variant={showCriticalPaths ? "default" : "outline"} 
                          onClick={toggleCriticalPaths}
                          size="sm"
                        >
                          {showCriticalPaths ? "Hide" : "Show"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" onClick={resetGame}>Reset</Button>
                    <Button variant="outline" onClick={() => setShowCustomLevelDialog(true)}>Custom Level</Button>
                    <Button onClick={checkSolution}>Check Solution</Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Game Grid Column */}
              <div className="lg:w-2/3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Room Layout</CardTitle>
                    <CardDescription>
                      Click on an empty cell to place the selected sofa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div 
                      className="grid gap-1 border-4 border-gray-800 p-1 bg-gray-200" 
                      style={{ 
                        gridTemplateColumns: `repeat(${currentLevel.width}, minmax(30px, 45px))`,
                        gridTemplateRows: `repeat(${currentLevel.height}, minmax(30px, 45px))`
                      }}
                    >
                      {grid.map((row, y) => 
                        row.map((cell, x) => {
                          const posKey = `${x},${y}`;
                          const isCriticalPath = showCriticalPaths && cell === 'empty' && criticalPathCells.has(posKey);
                          
                          return (
                            <div 
                              key={`${x}-${y}`}
                              className={`aspect-square flex items-center justify-center cursor-pointer ${
                                cell === 'empty' ? (isCriticalPath ? 'bg-blue-200 hover:bg-blue-300' : 'bg-gray-100 hover:bg-gray-200') : 
                                cell === 'wall' ? 'bg-gray-800' : 
                                cell === 'door' ? 'bg-yellow-500' : 
                                cell.startsWith('sofa') ? (isRemoving ? 'hover:bg-red-300' : '') : ''
                              }`}
                              onClick={() => handleCellClick(x, y)}
                            >
                              {cell !== 'empty' && <SofaRenderer type={cell} />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="w-full text-center text-sm text-muted-foreground">
                      <p>Legend: <span className="inline-block w-3 h-3 bg-yellow-500 mx-1"></span> Door 
                      <span className="inline-block w-3 h-3 bg-gray-800 mx-1 ml-2"></span> Wall
                      {showCriticalPaths && <span className="inline-block w-3 h-3 bg-blue-200 mx-1 ml-2"></span>}
                      {showCriticalPaths && "Critical Path"}
                      </p>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Level Complete!</DialogTitle>
            <DialogDescription>
              Congratulations! You've successfully arranged the sofas in this room.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-xl">Your score: {score} points</p>
          </div>
          <DialogFooter>
            <Button onClick={goToNextLevel}>
              Next Level
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Custom Level Dialog */}
      <Dialog open={showCustomLevelDialog} onOpenChange={setShowCustomLevelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Level</DialogTitle>
            <DialogDescription>
              Adjust the complexity to create a custom level
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span>Complexity:</span>
              <span className="font-medium">{Math.round(customComplexity * 100)}%</span>
            </div>
            <Slider
              value={[customComplexity * 100]}
              min={10}
              max={90}
              step={10}
              onValueChange={(value) => setCustomComplexity(value[0] / 100)}
            />
            <div className="text-sm text-muted-foreground">
              <p>Higher complexity means:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Larger room size</li>
                <li>More complex room shapes</li>
                <li>More interior walls</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomLevelDialog(false)}>Cancel</Button>
            <Button onClick={generateCustomLevel}>Generate Level</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
