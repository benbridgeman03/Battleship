namespace BattleshipServer.Models
{
    public class Ship
    {
        public int id {  get; set; }
        public string ShipName { get; set; }
        public int StartX { get; set; }
        public int StartY { get; set; }
        public bool Horizontal { get; set; }
        public int Size { get; set; }
        public int HitsRecieved { get; set; } = 0;
        public bool IsSunk => HitsRecieved >= Size;
    }
}
