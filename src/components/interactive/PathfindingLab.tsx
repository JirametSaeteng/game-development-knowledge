import React, { useEffect, useState, useCallback } from 'react';
import { Compass, RotateCcw, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audio';

type Algorithm = 'astar' | 'dijkstra' | 'bfs';

interface Cell {
  r: number;
  c: number;
}

export const PathfindingLab: React.FC = () => {
  const ROWS = 16;
  const COLS = 28;

  const [algo, setAlgo] = useState<Algorithm>('astar');
  const [start] = useState<Cell>({ r: 8, c: 4 });
  const [goal] = useState<Cell>({ r: 8, c: 23 });
  const [grid, setGrid] = useState<boolean[][]>(() => {
    // true = obstacle/wall
    const g: boolean[][] = Array(ROWS)
      .fill(false)
      .map(() => Array(COLS).fill(false));
    // Default labyrinth walls
    for (let r = 3; r <= 13; r++) g[r][14] = true;
    for (let c = 8; c <= 14; c++) g[3][c] = true;
    for (let c = 8; c <= 14; c++) g[13][c] = true;
    return g;
  });

  const [exploredNodes, setExploredNodes] = useState<Cell[]>([]);
  const [finalPath, setFinalPath] = useState<Cell[]>([]);
  const [solveTimeMs, setSolveTimeMs] = useState(0.4);

  // Solve path
  const solve = useCallback(
    (currentAlgo: Algorithm, currentGrid: boolean[][], s: Cell, g: Cell) => {
      const startTime = performance.now();
      const inBounds = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
      const key = (r: number, c: number) => `${r},${c}`;

      const visited = new Set<string>();
      const parent = new Map<string, Cell>();
      const exploredList: Cell[] = [];

      if (currentAlgo === 'bfs') {
        // BFS (FIFO Queue, Unweighted, No heuristic)
        const queue: Cell[] = [s];
        visited.add(key(s.r, s.c));

        while (queue.length > 0) {
          const curr = queue.shift()!;
          exploredList.push(curr);

          if (curr.r === g.r && curr.c === g.c) break;

          const neighbors = [
            { r: curr.r - 1, c: curr.c },
            { r: curr.r + 1, c: curr.c },
            { r: curr.r, c: curr.c - 1 },
            { r: curr.r, c: curr.c + 1 },
          ];

          for (const nb of neighbors) {
            if (inBounds(nb.r, nb.c) && !currentGrid[nb.r][nb.c]) {
              const k = key(nb.r, nb.c);
              if (!visited.has(k)) {
                visited.add(k);
                parent.set(k, curr);
                queue.push(nb);
              }
            }
          }
        }
      } else if (currentAlgo === 'dijkstra') {
        // Dijkstra (Cost g from start, no heuristic h)
        const dist = new Map<string, number>();
        dist.set(key(s.r, s.c), 0);
        const pq: Array<{ cell: Cell; cost: number }> = [{ cell: s, cost: 0 }];

        while (pq.length > 0) {
          pq.sort((a, b) => a.cost - b.cost);
          const { cell: curr } = pq.shift()!;
          const currKey = key(curr.r, curr.c);

          if (visited.has(currKey)) continue;
          visited.add(currKey);
          exploredList.push(curr);

          if (curr.r === g.r && curr.c === g.c) break;

          const neighbors = [
            { r: curr.r - 1, c: curr.c },
            { r: curr.r + 1, c: curr.c },
            { r: curr.r, c: curr.c - 1 },
            { r: curr.r, c: curr.c + 1 },
          ];

          for (const nb of neighbors) {
            if (inBounds(nb.r, nb.c) && !currentGrid[nb.r][nb.c]) {
              const nbKey = key(nb.r, nb.c);
              const newCost = (dist.get(currKey) ?? 0) + 1;
              if (!dist.has(nbKey) || newCost < dist.get(nbKey)!) {
                dist.set(nbKey, newCost);
                parent.set(nbKey, curr);
                pq.push({ cell: nb, cost: newCost });
              }
            }
          }
        }
      } else {
        // A* SEARCH (f = g + h, with Manhattan distance Heuristic)
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        const h = (cell: Cell) => Math.abs(cell.r - g.r) + Math.abs(cell.c - g.c);

        const startKey = key(s.r, s.c);
        gScore.set(startKey, 0);
        fScore.set(startKey, h(s));

        const openSet: Array<{ cell: Cell; f: number }> = [{ cell: s, f: h(s) }];

        while (openSet.length > 0) {
          openSet.sort((a, b) => a.f - b.f);
          const { cell: curr } = openSet.shift()!;
          const currKey = key(curr.r, curr.c);

          if (visited.has(currKey)) continue;
          visited.add(currKey);
          exploredList.push(curr);

          if (curr.r === g.r && curr.c === g.c) break;

          const neighbors = [
            { r: curr.r - 1, c: curr.c },
            { r: curr.r + 1, c: curr.c },
            { r: curr.r, c: curr.c - 1 },
            { r: curr.r, c: curr.c + 1 },
          ];

          for (const nb of neighbors) {
            if (inBounds(nb.r, nb.c) && !currentGrid[nb.r][nb.c]) {
              const nbKey = key(nb.r, nb.c);
              const tentativeG = (gScore.get(currKey) ?? 0) + 1;

              if (!gScore.has(nbKey) || tentativeG < gScore.get(nbKey)!) {
                parent.set(nbKey, curr);
                gScore.set(nbKey, tentativeG);
                const f = tentativeG + h(nb);
                fScore.set(nbKey, f);
                openSet.push({ cell: nb, f });
              }
            }
          }
        }
      }

      // Reconstruct path
      const path: Cell[] = [];
      let stepKey = key(g.r, g.c);
      if (parent.has(stepKey) || (s.r === g.r && s.c === g.c)) {
        let curr: Cell | undefined = g;
        while (curr && (curr.r !== s.r || curr.c !== s.c)) {
          path.push(curr);
          curr = parent.get(key(curr.r, curr.c));
        }
        path.push(s);
        path.reverse();
      }

      setExploredNodes(exploredList);
      setFinalPath(path);
      setSolveTimeMs(parseFloat((performance.now() - startTime).toFixed(2)));
    },
    [ROWS, COLS]
  );

  useEffect(() => {
    solve(algo, grid, start, goal);
  }, [algo, grid, start, goal, solve]);

  const handleCellClick = (r: number, c: number) => {
    if ((r === start.r && c === start.c) || (r === goal.r && c === goal.c)) return;
    const newGrid = grid.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? !val : val))
    );
    setGrid(newGrid);
    sound.playClick(500);
  };

  const handleClearWalls = () => {
    setGrid(
      Array(ROWS)
        .fill(false)
        .map(() => Array(COLS).fill(false))
    );
    sound.playClick(600);
  };

  // Pre-generate sets for O(1) rendering checks
  const exploredSet = new Set(exploredNodes.map(c => `${c.r},${c.c}`));
  const pathSet = new Set(finalPath.map(c => `${c.r},${c.c}`));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Interactive AI & Graph Lab
            </span>
            <h3 className="text-lg font-bold text-white">Pathfinding Visualizer: A* vs. Dijkstra vs. BFS</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            คลิกบนตารางเพื่อวาด/ลบสิ่งกีดขวาง แล้วสังเกตจำนวนช่องที่ A* ต้องสำรวจเทียบกับวิธีอื่น
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setAlgo('astar');
              sound.playClick(700);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              algo === 'astar'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            A* Search (Heuristic)
          </button>
          <button
            onClick={() => {
              setAlgo('dijkstra');
              sound.playClick(500);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              algo === 'dijkstra'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dijkstra
          </button>
          <button
            onClick={() => {
              setAlgo('bfs');
              sound.playClick(400);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              algo === 'bfs'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Breadth-First (BFS)
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Explored Nodes</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-black ${
                algo === 'astar' ? 'text-cyan-400' : 'text-amber-400'
              }`}
            >
              {exploredNodes.length}
            </span>
            <span className="text-xs text-slate-500">cells</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {algo === 'astar' ? 'Focused search path' : 'Explores equally in all directions'}
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Final Path Length</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-emerald-400">
              {finalPath.length > 0 ? finalPath.length : 'No Path'}
            </span>
            <span className="text-xs text-slate-500">steps</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Optimal shortest distance</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Solve Time</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-400">{solveTimeMs}</span>
            <span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Graph traversal execution</div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
          <div className="text-[11px] text-slate-400 font-medium">Heuristic Applied</div>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-base font-black ${
                algo === 'astar' ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {algo === 'astar' ? 'Manhattan h(n)' : 'None (Blind)'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">f(n) = g(n) + h(n)</div>
        </div>
      </div>

      {/* Grid Canvas Viewport */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
        <div
          className="grid gap-[2px] mx-auto select-none"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: '740px',
          }}
        >
          {grid.map((row, r) =>
            row.map((isWall, c) => {
              const isStart = r === start.r && c === start.c;
              const isGoal = r === goal.r && c === goal.c;
              const isPath = pathSet.has(`${r},${c}`);
              const isExplored = exploredSet.has(`${r},${c}`);

              let bgClass = 'bg-slate-900 hover:bg-slate-800';
              if (isWall) bgClass = 'bg-slate-700 shadow-inner';
              else if (isStart) bgClass = 'bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-105';
              else if (isGoal) bgClass = 'bg-rose-500 shadow-lg shadow-rose-500/50 scale-105';
              else if (isPath) bgClass = 'bg-cyan-400 shadow-md shadow-cyan-400/40 animate-pulse';
              else if (isExplored) bgClass = 'bg-indigo-950/80 text-indigo-300';

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square rounded-[3px] transition-colors cursor-pointer flex items-center justify-center text-[10px] font-bold ${bgClass}`}
                >
                  {isStart && 'S'}
                  {isGoal && 'G'}
                </div>
              );
            })
          )}
        </div>

        {/* Legend & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Start (S)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Goal (G)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-700 inline-block" /> Wall (คลิกเพื่อสร้าง)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-950 inline-block border border-indigo-800" /> Explored
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-400 inline-block" /> Shortest Path
            </span>
          </div>

          <button
            onClick={handleClearWalls}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างกำแพงทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start gap-3 text-xs text-slate-300">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white">ข้อแตกต่างที่เห็นได้ชัด:</span> ในขณะที่{' '}
          <strong>BFS / Dijkstra</strong> ต้องสำรวจช่องพื้นที่รอบตัวจนเป็นวงกว้าง (Explored {exploredNodes.length} ช่อง)
          แต่ <strong>A* (A-Star)</strong> ใช้ Heuristic $h(n)$ คำนวณระยะห่างไปยังจุดหมายล่วงหน้า จึงพุ่งตรงไปยังเป้าหมายทันที
          ลดจำนวนช่องที่ต้องเปิดค้นหาลงได้มากกว่า <strong>70% - 85%</strong>!
        </div>
      </div>
    </div>
  );
};
