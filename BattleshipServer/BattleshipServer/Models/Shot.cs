namespace BattleshipServer.Models
{
    public class Shot
    {
        public Game Game {  get; set; }
        public Player Player { get; set; }
        public Player Opponent { get; set; }
        public int x {  get; set; }
        public int y { get; set; }
    }
}
