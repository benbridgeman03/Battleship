namespace BattleshipServer.Models
{
    public interface IBotStrategy
    {
        (int row, int col) GetNextShot();
        public void RecordResult(int row, int col, bool isHit, int shipSize, bool isSunk);
    }
}