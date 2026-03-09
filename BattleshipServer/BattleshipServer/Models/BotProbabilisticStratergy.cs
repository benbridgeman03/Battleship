using Microsoft.AspNetCore.Mvc.Routing;

namespace BattleshipServer.Models
{
    public class HeatMap
    {
        public float[,] Map {  get; private set; }
        public int ShipSize { get; private set; }

        public HeatMap(int _shipSize)
        {
            Map = new float[10,10];
            ShipSize = _shipSize;
        }

        public void Calculate(Dictionary<(int row, int col), string> hits, HashSet<(int row, int col)> misses)
        {
            for (int row = 0; row < 10; row++)
            {
                for (int col = 0; col <= 10 - ShipSize; col++)
                {
                    bool valid = true;
                    for (int k = 0; k < ShipSize; k++)
                    {
                        if (misses.Contains((row, col + k)))
                        {
                            valid = false;
                            break;
                        }
                    }
                    if (valid)
                    {
                        for (int k = 0; k < ShipSize; k++)
                            Map[row, col + k] += 1;
                    }
                }
            }

            for (int row = 0; row <= 10 - ShipSize; row++)
            {
                for (int col = 0; col < 10; col++)
                {
                    bool valid = true;
                    for (int k = 0; k < ShipSize; k++)
                    {
                        if (misses.Contains((row + k, col)))
                        {
                            valid = false;
                            break;
                        }
                    }
                    if (valid)
                    {
                        for (int k = 0; k < ShipSize; k++)
                            Map[row + k, col] += 1;
                    }
                }
            }
        }
    }

    public class BotProbabilisticStratergy : IBotStrategy
    {
        public Dictionary<(int row, int col), string> ShotsHit { get; set; } = new();
        public HashSet<(int row, int col)> ShotsMissed { get; set; } = new();
        public HashSet<(int row, int col)> SunkCells { get; set; } = new();
        private List<int> _remainingShipSizes = new() { 5, 4, 3, 3, 2, 2 };
        private float[,] _combinedHeatmap = new float[10,10];
        private readonly Random _random = new();

        public (int row, int col) GetNextShot()
        {
            _combinedHeatmap = new float[10, 10];
            foreach (int size in _remainingShipSizes)
            {
                HeatMap shipHeatmap = new HeatMap(size);
                shipHeatmap.Calculate(ShotsHit, ShotsMissed);

                for (int row = 0; row < 10; row++)
                {
                    for (int col = 0; col < 10; col++)
                    {
                        _combinedHeatmap[row, col] = _combinedHeatmap[row, col] + shipHeatmap.Map[row, col];
                    }
                }
            }

            int[][] directions = { new[] { -1, 0 }, new[] { 1, 0 }, new[] { 0, -1 }, new[] { 0, 1 } };

            foreach (var hit in ShotsHit)
            {
                if (SunkCells.Contains(hit.Key)) continue;

                foreach (var dir in directions)
                {
                    int r = hit.Key.row + dir[0];
                    int c = hit.Key.col + dir[1];

                    if (r < 0 || r >= 10 || c < 0 || c >= 10) continue;

                    _combinedHeatmap[r, c] += 20;

                    int br = hit.Key.row - dir[0];
                    int bc = hit.Key.col - dir[1];
                    if (br >= 0 && br < 10 && bc >= 0 && bc < 10
                        && ShotsHit.TryGetValue((br, bc), out var behindShipName)
                        && behindShipName == hit.Value)
                    {
                        _combinedHeatmap[r, c] += 40;
                    }
                }
            }

            foreach (var miss in ShotsMissed)
            {
                _combinedHeatmap[miss.row, miss.col] = 0;
            }
            foreach (var hit in ShotsHit)
            {
                _combinedHeatmap[hit.Key.row, hit.Key.col] = 0;
            }

            float max = 0;
            var candidates = new List<(int row, int col)>();

            for (int row = 0; row < 10; row++)
            {
                for (int col = 0; col < 10; col++)
                {
                    float value = _combinedHeatmap[row, col];
                    if (value > max)
                    {
                        max = value;
                        candidates.Clear();
                        candidates.Add((row, col));
                    }
                    else if (value == max && max > 0)
                    {
                        candidates.Add((row, col));
                    }
                }
            }

            return candidates[_random.Next(candidates.Count)];
        }

        public void RecordResult(int row, int col, bool isHit, int shipSize, bool isSunk, string? shipName)
        {
            if (isHit)
            {
                ShotsHit.Add((row, col), shipName);
                if (isSunk)
                {
                    _remainingShipSizes.Remove(shipSize);
                    var sunkCells = ShotsHit.Where(s => s.Value == shipName).Select(s => s.Key);
                    foreach (var cell in sunkCells)
                        SunkCells.Add(cell);
                }
            }
            else ShotsMissed.Add((row, col));
        }
    }
}
