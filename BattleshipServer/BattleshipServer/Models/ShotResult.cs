namespace BattleshipServer.Models
{
    public class ShotResult
    {
        public bool IsHit { get; set; }
        public Ship? Ship { get; set; }
        public bool IsSunk { get; set; }
        public bool IsGameOver { get; set; }
    }
}
