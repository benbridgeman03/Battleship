using BattleshipServer.Models;
using BattleshipServer.Services;
using NuGet.Frameworks;

namespace BattleshipServer.Tests;

public class GameServiceTests
{
    [Fact]
    public void CreateGame_ShouldAddPlayer1()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");

        Assert.NotNull(game.Player1);
        Assert.Equal("player1-id", game.Player1.ConnectionId);
    }

    [Fact]
    public void CreateGame_ShouldAddPlayer2()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        Assert.NotNull(game.Player1);
        Assert.NotNull(game.Player2);
        Assert.Equal("player1-id", game.Player1.ConnectionId);
        Assert.Equal("player2-id", game.Player2.ConnectionId);
    }

    [Fact]
    public void GetGameByConnectionId_ShouldReturnGame_WhenPlayerIsInGame()
    {
        var service = new GameService();
        var player1Id = "player1-id";
        var newGame = service.CreateGame(player1Id);

        var game = service.GetGameByConnectionId(player1Id);

        Assert.Equal(newGame.GameId, game.GameId);
    }

    [Fact]
    public void GetGameByConnectionId_ShouldReturnNull_WhenPlayerNotInAnyGame()
    {
        var service = new GameService();
        var game = service.GetGameByConnectionId("nonexistent-id");
        Assert.Null(game);
    }

    [Fact]
    public void SetPlayerReady_ShouldReturnTrue()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.SetPlayerReady("player1-id", game);

        Assert.True(game.Player1.IsReady);
    }

    [Fact]
    public void SetPlayerReady_ShouldNotAffectOtherPlayer()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");
        service.SetPlayerReady("player1-id", game);

        Assert.True(game.Player1.IsReady);
        Assert.False(game.Player2.IsReady);
    }

    [Fact]
    public void BothPlayersReady_ShouldReturnTrue_WhenBothReady()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");
        service.SetPlayerReady("player1-id", game);
        service.SetPlayerReady("player2-id", game);

        Assert.True(service.BothPlayersReady(game));
    }

    [Fact]
    public void SetPlayerShips_ShouldPlaceHorizontalShip()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<ShipPlacement>
    {
        new ShipPlacement
        {
            ShipName = "carrier",
            StartX = 0,
            StartY = 0,
            Horizontal = true,
            Size = 5
        }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("carrier", game.Player1.Board[0, 0]);
        Assert.Equal("carrier", game.Player1.Board[0, 1]);
        Assert.Equal("carrier", game.Player1.Board[0, 2]);
        Assert.Equal("carrier", game.Player1.Board[0, 3]);
        Assert.Equal("carrier", game.Player1.Board[0, 4]);
        Assert.Null(game.Player1.Board[0, 5]);
    }

    [Fact]
    public void SetPlayerShips_ShouldPlaceVerticalShip()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<ShipPlacement>
    {
        new ShipPlacement
        {
            ShipName = "destroyer",
            StartX = 3,
            StartY = 2,
            Horizontal = false,
            Size = 2
        }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("destroyer", game.Player1.Board[2, 3]);
        Assert.Equal("destroyer", game.Player1.Board[3, 3]);
        Assert.Null(game.Player1.Board[4, 3]);
    }

    [Fact]
    public void SetPlayerShips_ShouldPlaceMultipleShips()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<ShipPlacement>
    {
        new ShipPlacement { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 },
        new ShipPlacement { ShipName = "destroyer", StartX = 0, StartY = 2, Horizontal = true, Size = 2 }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("carrier", game.Player1.Board[0, 0]);
        Assert.Equal("destroyer", game.Player1.Board[2, 0]);
    }

    [Fact]
    public void SetPlayerShips_ShouldDoNothing_WhenPlayerNotFound()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<ShipPlacement>
    {
        new ShipPlacement { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 }
    };

        service.SetPlayerShips("nonexistent-id", game, placements);

        Assert.Null(game.Player1.Board[0, 0]);
    }
}
