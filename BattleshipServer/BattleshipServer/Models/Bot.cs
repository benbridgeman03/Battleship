namespace BattleshipServer.Models
{
    public class Bot
    {
        public IBotStrategy Strategy { get; set; }

        public Bot(IBotStrategy strategy)
        {
            Strategy = strategy;
        }

        public (int row, int col) GetNextShot()
        {
            var shot = Strategy.GetNextShot();
            //ShotsTaken.Add(shot);
            return shot;
        }

        public void RecordResult(int row, int col, bool isHit, int shipSize, bool isSunk, string? shipName)
        {
            Strategy.RecordResult(row, col, isHit, shipSize, isSunk, shipName);
        }
    }
}
