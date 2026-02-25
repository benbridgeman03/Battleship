using System.Collections.Concurrent;
using BattleshipServer.Models;
using Microsoft.AspNetCore.DataProtection.KeyManagement.Internal;

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

        public Game? GetGameByConnectionId(string connectionId)
        {
            return _games.Values.FirstOrDefault(g =>
                g.Player1?.ConnectionId == connectionId ||
                g.Player2?.ConnectionId == connectionId);
        }

        public void SetPlayerShips(string connectionId, Game game, List<ShipPlacement> placements)
        {
            var player = game.GetPlayer(connectionId);
            if (player == null) return;

            foreach (var placement in placements)
            {
                for (int i = 0; i < placement.Size; i++)
                {
                    int x = placement.Horizontal ? placement.StartX + i : placement.StartX;
                    int y = placement.Horizontal ? placement.StartY : placement.StartY + i;
                    player.Board[y, x] = placement.ShipName;
                }
            }
        }

        public void SetPlayerReady(string connectionId, Game game)
        {
            var player = game.GetPlayer(connectionId);
            if (player == null) return;
            player.IsReady =  true;
        }

        public void SetPlayerUnready(string connectionId, Game game)
        {
            var player = game.GetPlayer(connectionId);
            if (player == null) return;
            player.IsReady = false;
        }

        public bool BothPlayersReady(Game game)
        {
            return game.Player1?.IsReady == true && game.Player2?.IsReady == true;
        }

        public void SwitchTurn(Game game)
        {
            game.CurrentTurnConnectionId =
                game.CurrentTurnConnectionId == game.Player1?.ConnectionId
                    ? game.Player2?.ConnectionId
                    : game.Player1?.ConnectionId;
        }

        public bool CheckShot(Player oppenent, int x, int y)
        {
            return oppenent.Board[y, x] != null;
        }
    }
}
