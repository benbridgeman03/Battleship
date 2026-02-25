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

        public async Task PlayerReady(List<ShipPlacement> placements)
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
            if(player == null) return;
            var opponent = game.GetOpponent(player);
            if (opponent == null) return;

            bool isHit = _gameService.CheckShot(opponent, x, y);

            await Clients.Client(Context.ConnectionId).SendAsync("ShotFired", x, y, isHit);
            await Clients.Client(opponent.ConnectionId).SendAsync("IncomingShot", x, y, isHit);

            if (!isHit) _gameService.SwitchTurn(game);

            await Clients.Client(Context.ConnectionId).SendAsync("TurnUpdate", false);
            await Clients.Client(opponent.ConnectionId).SendAsync("TurnUpdate", true);
        }
    }
}
