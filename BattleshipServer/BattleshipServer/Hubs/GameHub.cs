using BattleshipServer.Models;
using BattleshipServer.Services;
using Microsoft.AspNetCore.SignalR;

namespace BattleshipServer.Hubs
{
    public class GameHub : Hub
    {
        private readonly GameService _gameService;

        public GameHub(GameService gameService)
        {
            _gameService = gameService;
        }

        public async Task CreateGame(bool isBot)
        {
            var game = _gameService.CreateGame(Context.ConnectionId, isBot);
            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
            if(!isBot) await Clients.Caller.SendAsync("GameCreated", game.GameId);
            else await Clients.Caller.SendAsync("GameStarted", game.GameId);
        }

        public async Task CancelGame()
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game == null) return;
            _gameService.EndGame(game);
        }

        public async Task JoinGame(string gameId)
        {
            var game = _gameService.JoinGame(gameId, Context.ConnectionId);

            if (game == null)
            {
                await Clients.Caller.SendAsync("Error", "Game not found or full");
                return;
            }

            if (game.Player1 == null || game.Player2 == null)
            {
                await Clients.Caller.SendAsync("Error", "Game setup failed");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
            await Clients.Group(game.GameId).SendAsync("GameStarted");

            await Clients.Client(game.Player1.ConnectionId!).SendAsync("TurnUpdate", true);
            await Clients.Client(game.Player2.ConnectionId!).SendAsync("TurnUpdate", false);
        }

        public async Task PlayerReady(List<Ship> placements)
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game == null) return;

            _gameService.SetPlayerShips(Context.ConnectionId, game, placements);
            _gameService.SetPlayerReady(Context.ConnectionId, game);

            if (_gameService.BothPlayersReady(game))
            {
                await Clients.Group(game.GameId).SendAsync("SetupComplete");
            }
        }

        public void PlayerUnready()
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game == null) return;

            _gameService.SetPlayerUnready(Context.ConnectionId, game);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game != null)
            {
                var player = game.GetPlayer(Context.ConnectionId);
                var opponent = game.GetOpponent(player);
                if (opponent != null)
                    await Clients.Client(opponent.ConnectionId!).SendAsync("OpponentDisconnected");
                _gameService.EndGame(game);
            }
            await base.OnDisconnectedAsync(exception);
        }

        public async Task Fire(int x, int y)
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game == null) return;

            if (game.CurrentTurnConnectionId != Context.ConnectionId)
            {
                await Clients.Caller.SendAsync("Error", "Not your turn");
                return;
            }

            var player = game.GetPlayer(Context.ConnectionId);
            if (player == null) return;
            var opponent = game.GetOpponent(player);
            if (opponent == null) return;

            var shot = new Shot { Game = game, Player = player, Opponent = opponent, x = x, y = y };
            var result = _gameService.ProcessShot(shot);

            await Clients.Client(Context.ConnectionId).SendAsync("ShotFired", x, y, result.IsHit, result.Ship?.ShipName, result.IsSunk);
            if(opponent.isBot == false) await Clients.Client(opponent.ConnectionId!).SendAsync("IncomingShot", x, y, result.IsHit, result.Ship?.ShipName, result.IsSunk);

            if (result.IsGameOver)
            {
                await Clients.Client(Context.ConnectionId).SendAsync("GameOver", true);
                if (opponent.isBot == false) await Clients.Client(opponent.ConnectionId!).SendAsync("GameOver", false);
                return;
            }

            if (!result.IsHit && opponent.isBot && opponent.bot != null)
            {
                await Clients.Client(Context.ConnectionId).SendAsync("TurnUpdate", false);

                while (true)
                {
                    await Task.Delay(1700);
                    var (row, col) = opponent.bot.GetNextShot();
                    var botShot = new Shot { Game = game, Player = opponent, Opponent = player, x = col, y = row };
                    var botResult = _gameService.ProcessShot(botShot);

                    opponent.bot.RecordResult(row, col, botResult.IsHit, botResult.Ship?.Size ?? 0, botResult.IsSunk, botResult.Ship?.ShipName);

                    await Clients.Client(Context.ConnectionId).SendAsync("IncomingShot", col, row, botResult.IsHit, botResult.Ship?.ShipName, botResult.IsSunk);

                    if (botResult.IsGameOver)
                    {
                        await Clients.Client(Context.ConnectionId).SendAsync("GameOver", false);
                        return;
                    }

                    if (!botResult.IsHit) break;
                }

                await Clients.Client(Context.ConnectionId).SendAsync("TurnUpdate", true);
            }
            else
            {
                _gameService.UpdateTurn(game, result.IsHit);
                await Clients.Client(Context.ConnectionId).SendAsync("TurnUpdate", result.IsHit);
                if (opponent.isBot == false) await Clients.Client(opponent.ConnectionId!).SendAsync("TurnUpdate", !result.IsHit);
            }
        }

        public async Task PlayerPlayAgain()
        {
            var game = _gameService.GetGameByConnectionId(Context.ConnectionId);
            if (game == null) return;

            if(game.Player2.isBot) await Clients.Client(game.Player1.ConnectionId).SendAsync("PlayAgain");

            _gameService.SetPlayerPlayAgain(Context.ConnectionId, game);

            var count = (game.Player1?.PlayAgain == true ? 1 : 0) + (game.Player2?.PlayAgain == true ? 1 : 0);
            await Clients.Group(game.GameId).SendAsync("PlayAgainVote", count);

            if (_gameService.BothPlayersPlayAgain(game))
            {
                _gameService.RestartGame(game);
                await Clients.Group(game.GameId).SendAsync("PlayAgain");
                await Clients.Client(game.Player1!.ConnectionId!).SendAsync("TurnUpdate", true);
                await Clients.Client(game.Player2!.ConnectionId!).SendAsync("TurnUpdate", false);
            }
        }
    }
}
