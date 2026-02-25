namespace BattleshipServer.Models
{
    public class Game
    {
        public string GameId { get; set; } = string.Empty;
        public Player? Player1 { get; set; }
        public Player? Player2 { get; set; }
        public string? CurrentTurnConnectionId { get; set; }

        public bool IsFull => Player1 != null && Player2 != null;

        public void AddPlayer(string connectionId)
        {
            if (Player1 != null && Player2 != null) return;

            if (Player1 == null)
            {
                Player1 = new Player { ConnectionId = connectionId };
            }
            else if (Player2 == null)
            {
                Player2 = new Player { ConnectionId = connectionId };
            }
        }

        public Player? GetPlayer(string connectionId)
        {
            if(connectionId == Player1?.ConnectionId) return Player1;
            if(connectionId == Player2?.ConnectionId) return Player2;
            return null;
        }

        public Player? GetOpponent(Player player)
        {
            if (player == Player1) return Player2;
            if (player == Player2) return Player1;
            return null;
        }
    }
}
