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

        public void Calculate(HashSet<(int row, int col)> hits, HashSet<(int row, int col)> misses)
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
        public HashSet<(int row, int col)> ShotsHit { get; set; } = new();
        public HashSet<(int row, int col)> ShotsMissed { get; set; } = new();
        private List<int> _remainingShipSizes = new() { 5, 4, 3, 3, 2, 2 };
        private float[,] _combinedHeatmap = new float[10,10];

        public (int row, int col) GetNextShot()
        {
            _combinedHeatmap = new float[10,10];
            foreach(int size in _remainingShipSizes)
            {
                HeatMap shipHeatmap = new HeatMap(size);
                shipHeatmap.Calculate(ShotsHit, ShotsMissed);

                for(int row = 0; row < 10; row++)
                {
                    for(int col = 0; col < 10; col++)
                    {
                        _combinedHeatmap[row, col] = _combinedHeatmap[row, col] + shipHeatmap.Map[row, col];
                    }
                }
            }

            //Should have our combined heatmap, need to apply hit boosting (boost cells around already hit cells where ships havent sunk), find the max cell and return it
        }

        public void RecordResult(int row, int col, bool isHit, int shipSize, bool isSunk)
        {
            if (isHit)
            {
                ShotsHit.Add((row, col));
                if (isSunk) _remainingShipSizes.Remove(shipSize);
            }
            else ShotsMissed.Add((row, col));
        }
    }
}
