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

        public async Task CreateGame()
        {
            var game = _gameService.CreateGame(Context.ConnectionId);
            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
            await Clients.Caller.SendAsync("GameCreated", game.GameId);
        }

        public async Task JoinGame(string gameId)
        {
            var game = _gameService.JoinGame(gameId, Context.ConnectionId);

            if(game == null)
            {
                await Clients.Caller.SendAsync("Error", "Game not found or full");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, game.GameId);
            await Clients.Group(game.GameId).SendAsync("GameStarted");

            await Clients.Client(game.Player1ConnectionId!).SendAsync("TurnUpdate", true);
            await Clients.Client(game.Player2ConnectionId!).SendAsync("TurnUpdate", false);
        }

        public async Task Fire(int x, int y)
        {
            var game = _gameService.GetGameByPlayer(Context.ConnectionId);
            if (game == null) return;

            if (game.CurrentTurnConnectionId != Context.ConnectionId)
            {
                await Clients.Caller.SendAsync("Error", "Not your turn");
                return;
            }

            var opponentId = game.GetOpponentConnectionId(Context.ConnectionId);
            if (opponentId == null) return;

            await Clients.Client(Context.ConnectionId).SendAsync("ShotFired", x, y);

            await Clients.Client(opponentId).SendAsync("IncomingShot", x, y);

            _gameService.SwitchTurn(game);
            await Clients.Client(Context.ConnectionId).SendAsync("TurnUpdate", false);
            await Clients.Client(opponentId).SendAsync("TurnUpdate", true);
        }
    }
}
