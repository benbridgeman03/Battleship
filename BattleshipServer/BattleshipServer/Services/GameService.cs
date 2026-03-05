using BattleshipServer.Models;
using System.Collections.Concurrent;

namespace BattleshipServer.Services
{
    public class GameService
    {

        private readonly ConcurrentDictionary<string, Game> _games = new();

        public Game CreateGame(string playerConnectionId, bool isBot)
        {
            var game = new Game
            {
                GameId = Guid.NewGuid().ToString()[..6],
                CurrentTurnConnectionId = playerConnectionId
            };
            game.AddPlayer(playerConnectionId);
            _games[game.GameId] = game;
            if (isBot)
            {
                game.AddPlayer("bot");
                game.Player2.SetupBot();
            }
            return game;
        }

        public void EndGame(Game game)
        {
            _games.TryRemove(game.GameId, out _);
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

        public void SetPlayerShips(string connectionId, Game game, List<Ship> placements)
        {
            var player = game.GetPlayer(connectionId);
            if (player == null) return;

            player.Ships = placements;

            for (int i = 0; i < placements.Count; i++)
            {
                placements[i].id = i;
                for (int j = 0; j < placements[i].Size; j++)
                {
                    int x = placements[i].Horizontal ? placements[i].StartX + j : placements[i].StartX;
                    int y = placements[i].Horizontal ? placements[i].StartY : placements[i].StartY + j;
                    player.Board[y, x] = i.ToString();
                }
            }
        }

        public Ship? GetShipAt(Player player, int x, int y)
        {
            if (player == null) return null;
            var shipId = player.Board[y, x];
            if (shipId == null) return null;
            return player.Ships.FirstOrDefault(s => s.id.ToString() == shipId);
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

        public void SetPlayerPlayAgain(string connectionId, Game game)
        {
            var player = game.GetPlayer(connectionId);
            if (player == null) return;
            player.PlayAgain = true;
        }

        public bool BothPlayersPlayAgain(Game game)
        {
            return game.Player1?.PlayAgain == true && game.Player2?.PlayAgain == true;
        }

        public void RestartGame(Game game)
        {
            game.ResetGame();
        }

        public void SwitchTurn(Game game)
        {
            game.CurrentTurnConnectionId =
                game.CurrentTurnConnectionId == game.Player1?.ConnectionId
                    ? game.Player2?.ConnectionId
                    : game.Player1?.ConnectionId;
        }

        public void UpdateTurn(Game game, bool isHit)
        {
            if (!isHit) SwitchTurn(game);
        }

        public ShotResult ProcessShot(Shot shot)
        {
            var ship = GetShipAt(shot.Opponent, shot.x, shot.y);
            bool isHit = ship != null;

            if (isHit && ship != null)
            {
                HitShip(ship);
            }

            return new ShotResult
            {
                IsHit = isHit,
                Ship = ship,
                IsSunk = ship?.IsSunk ?? false,
                IsGameOver = isHit && shot.Opponent.Ships.All(s => s.IsSunk)
            };
        }

        public void HitShip(Ship ship)
        {
            if (ship == null) return;
            ship.HitsRecieved++;
        }
    }
}
