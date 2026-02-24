namespace BattleshipServer.Models
{
    public class Game
    {
        public string GameId { get; set; } = string.Empty;
        public string? Player1ConnectionId { get; set; }
        public string? Player2ConnectionId { get; set; }
        public string? CurrentTurnConnectionId { get; set; }

        public bool IsFull => Player1ConnectionId != null && Player2ConnectionId != null;

        public string? GetOpponentConnectionId(string connectionId)
        {
            if (connectionId == Player1ConnectionId) return Player2ConnectionId;
            if (connectionId == Player2ConnectionId) return Player1ConnectionId;
            return null;
        }
    }
}
