namespace BattleshipServer.Models
{
    public class Player
    {
        public string? ConnectionId { get; set; }
        public bool IsReady { get; set; } = false;
        public bool PlayAgain { get; set; } = false;
        public string?[,] Board { get; set; } = new string?[10, 10];
        public List<Ship>? Ships { get; set; }
        public bool IsBot { get; set; } = false;

        public void ResetPlayer()
        {
            IsReady = false;
            PlayAgain = false;
            Board = new string?[10, 10];
            Ships = new(); 
        }
    }
}
