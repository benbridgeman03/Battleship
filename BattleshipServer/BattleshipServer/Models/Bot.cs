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

        public void RecordResult(int row, int col, bool isHit, bool isSunk)
        {
            Strategy.RecordResult(row, col, isHit, isSunk);
        }
    }
}
