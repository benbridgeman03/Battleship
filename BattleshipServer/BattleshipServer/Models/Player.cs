namespace BattleshipServer.Models
{
    public class Player
    {
        public string? ConnectionId { get; set; }
        public bool IsReady { get; set; } = false;
        public string?[,] Board { get; set; } = new string?[10, 10];
    }
}
