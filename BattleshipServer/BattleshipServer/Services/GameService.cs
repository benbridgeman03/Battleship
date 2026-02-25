using System.Collections.Concurrent;
using BattleshipServer.Models;

namespace BattleshipServer.Services
{
    public class GameService
    {

        private readonly ConcurrentDictionary<string, Game> _games = new();

        public Game CreateGame(string playerConnectionId)
        {
            var game = new Game
            {
                GameId = Guid.NewGuid().ToString()[..6],
                CurrentTurnConnectionId = playerConnectionId
            };
            game.AddPlayer(playerConnectionId);
            _games[game.GameId] = game;
            return game;
        }

        public Game? JoinGame(string gameId, string playerConnectionId)
        {
            if (_games.TryGetValue(gameId, out var game) && !game.IsFull)
            {
                game.AddPlayer(playerConnectionId);
                return game;
            }
            return null;
        }

        public Game? GetGameByPlayer(string connectionId)
        {
            return _games.Values.FirstOrDefault(g =>
                g.Player1?.ConnectionId == connectionId ||
                g.Player2?.ConnectionId == connectionId);
        }

        public void SwitchTurn(Game game)
        {
            game.CurrentTurnConnectionId =
                game.CurrentTurnConnectionId == game.Player1?.ConnectionId
                    ? game.Player2?.ConnectionId
                    : game.Player1?.ConnectionId;
        }
    }
}
