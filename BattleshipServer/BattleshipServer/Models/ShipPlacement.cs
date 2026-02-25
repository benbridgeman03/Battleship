namespace BattleshipServer.Models
{
    public class ShipPlacement
    {
        public string ShipName { get; set; }
        public int StartX { get; set; }
        public int StartY { get; set; }
        public bool Horizontal { get; set; }
        public int Size { get; set; }
    }
}
