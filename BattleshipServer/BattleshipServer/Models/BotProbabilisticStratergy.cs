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
            int row, col = 0;
            int valid = 10 - ShipSize;
            //TODO Loop through each vlid starting postiion, for both horizontal and vertical pos, then +1 to every spot that the ship can be placed
        }
    }

    public class BotProbabilisticStratergy : IBotStrategy
    {
        public HashSet<(int row, int col)> ShotsHit { get; set; } = new();
        public HashSet<(int row, int col)> ShotsMissed { get; set; } = new();
        private List<int> _remainingShipSizes = new() { 5, 4, 3, 3, 2, 2 };

        public (int row, int col) GetNextShot()
        {
            //TODO create a heatmap for each ship size remaining, combine them into one heatmap, get the highest cell, if theres a tie, chose at random
            throw new NotImplementedException();
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
