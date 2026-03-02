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
        var placements = new List<Ship>
    {
        new Ship
        {
            ShipName = "carrier",
            StartX = 0,
            StartY = 0,
            Horizontal = true,
            Size = 5
        }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("0", game.Player1.Board[0, 0]);
        Assert.Equal("0", game.Player1.Board[0, 1]);
        Assert.Equal("0", game.Player1.Board[0, 2]);
        Assert.Equal("0", game.Player1.Board[0, 3]);
        Assert.Equal("0", game.Player1.Board[0, 4]);
        Assert.Null(game.Player1.Board[0, 5]);
    }

    [Fact]
    public void SetPlayerShips_ShouldPlaceVerticalShip()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
    {
        new Ship
        {
            ShipName = "destroyer",
            StartX = 3,
            StartY = 2,
            Horizontal = false,
            Size = 2
        }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("0", game.Player1.Board[2, 3]);
        Assert.Equal("0", game.Player1.Board[3, 3]);
        Assert.Null(game.Player1.Board[4, 3]);
    }

    [Fact]
    public void SetPlayerShips_ShouldPlaceMultipleShips()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
    {
        new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 },
        new Ship { ShipName = "destroyer", StartX = 0, StartY = 2, Horizontal = true, Size = 2 }
    };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("0", game.Player1.Board[0, 0]);
        Assert.Equal("1", game.Player1.Board[2, 0]);
    }

    [Fact]
    public void SetPlayerShips_ShouldDoNothing_WhenPlayerNotFound()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 }
        };

        service.SetPlayerShips("nonexistent-id", game, placements);

        Assert.Null(game.Player1.Board[0, 0]);
    }

    [Fact]
    public void PlayerShot_ShouldReturnTrue()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");

        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        var isHit = service.CheckShot(game.Player1, 0, 0);

        Assert.True(isHit);
    }

    [Fact]
    public void CheckShot_ShouldReturnFalse()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");

        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        var isHit = service.CheckShot(game.Player1, 9, 9);

        Assert.False(isHit);
    }

    [Fact]
    public void SetPlayerShips_OverlappingShips_LastShipOverwrites()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 },
            new Ship { ShipName = "battleship", StartX = 0, StartY = 0, Horizontal = true, Size = 4 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        // battleship (id=1) overwrites carrier (id=0) at shared cells
        Assert.Equal("1", game.Player1.Board[0, 0]);
        Assert.Equal("1", game.Player1.Board[0, 3]);
        // carrier's 5th cell is untouched
        Assert.Equal("0", game.Player1.Board[0, 4]);
    }

    [Fact]
    public void SetPlayerShips_HorizontalShipOutOfBounds_ShouldThrow()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 8, StartY = 0, Horizontal = true, Size = 5 }
        };

        Assert.ThrowsAny<IndexOutOfRangeException>(() =>
            service.SetPlayerShips("player1-id", game, placements));
    }

    [Fact]
    public void SetPlayerShips_VerticalShipOutOfBounds_ShouldThrow()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 8, Horizontal = false, Size = 5 }
        };

        Assert.ThrowsAny<IndexOutOfRangeException>(() =>
            service.SetPlayerShips("player1-id", game, placements));
    }

    [Fact]
    public void SetPlayerShips_AtBoardEdge_Horizontal_ShouldSucceed()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 5, StartY = 0, Horizontal = true, Size = 5 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("0", game.Player1.Board[0, 9]);
    }

    [Fact]
    public void SetPlayerShips_AtBoardEdge_Vertical_ShouldSucceed()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 5, Horizontal = false, Size = 5 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        Assert.Equal("0", game.Player1.Board[9, 0]);
    }

    [Fact]
    public void HitShip_ShouldIncrementHits()
    {
        var service = new GameService();
        var ship = new Ship { ShipName = "destroyer", Size = 2 };

        service.HitShip(ship);

        Assert.Equal(1, ship.HitsRecieved);
        Assert.False(ship.IsSunk);
    }

    [Fact]
    public void HitShip_ShouldSinkWhenAllCellsHit()
    {
        var service = new GameService();
        var ship = new Ship { ShipName = "destroyer", Size = 2 };

        service.HitShip(ship);
        service.HitShip(ship);

        Assert.True(ship.IsSunk);
    }

    [Fact]
    public void GetShipAt_ShouldReturnShip_WhenHit()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "destroyer", StartX = 3, StartY = 4, Horizontal = true, Size = 2 }
        };

        service.SetPlayerShips("player1-id", game, placements);
        var ship = service.GetShipAt(game.Player1, 3, 4);

        Assert.NotNull(ship);
        Assert.Equal("destroyer", ship.ShipName);
    }

    [Fact]
    public void GetShipAt_ShouldReturnNull_WhenMiss()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "destroyer", StartX = 3, StartY = 4, Horizontal = true, Size = 2 }
        };

        service.SetPlayerShips("player1-id", game, placements);
        var ship = service.GetShipAt(game.Player1, 0, 0);

        Assert.Null(ship);
    }

    [Fact]
    public void AllShipsSunk_ShouldBeTrue_WhenAllHit()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        var placements = new List<Ship>
        {
            new Ship { ShipName = "destroyer", StartX = 0, StartY = 0, Horizontal = true, Size = 2 }
        };

        service.SetPlayerShips("player1-id", game, placements);

        var ship1 = service.GetShipAt(game.Player1, 0, 0);
        service.HitShip(ship1!);
        var ship2 = service.GetShipAt(game.Player1, 1, 0);
        service.HitShip(ship2!);

        Assert.True(game.Player1.Ships.All(s => s.IsSunk));
    }

    [Fact]
    public void SwitchTurn_ShouldAlternateBetweenPlayers()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        Assert.Equal("player1-id", game.CurrentTurnConnectionId);

        service.SwitchTurn(game);
        Assert.Equal("player2-id", game.CurrentTurnConnectionId);

        service.SwitchTurn(game);
        Assert.Equal("player1-id", game.CurrentTurnConnectionId);
    }

    [Fact]
    public void UpdateTurn_ShouldSwitchOnMiss()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.UpdateTurn(game, isHit: false);

        Assert.Equal("player2-id", game.CurrentTurnConnectionId);
    }

    [Fact]
    public void UpdateTurn_ShouldNotSwitchOnHit()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.UpdateTurn(game, isHit: true);

        Assert.Equal("player1-id", game.CurrentTurnConnectionId);
    }

    [Fact]
    public void JoinGame_ShouldReturnNull_WhenGameIsFull()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        var result = service.JoinGame(game.GameId, "player3-id");

        Assert.Null(result);
    }

    [Fact]
    public void JoinGame_ShouldReturnNull_WhenGameNotFound()
    {
        var service = new GameService();

        var result = service.JoinGame("nonexistent", "player1-id");

        Assert.Null(result);
    }

    [Fact]
    public void EndGame_ShouldRemoveGameFromService()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");

        service.EndGame(game);

        Assert.Null(service.GetGameByConnectionId("player1-id"));
    }

    [Fact]
    public void SetPlayerPlayAgain_ShouldSetFlag()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.SetPlayerPlayAgain("player1-id", game);

        Assert.True(game.Player1.PlayAgain);
        Assert.False(game.Player2.PlayAgain);
    }

    [Fact]
    public void BothPlayersPlayAgain_ShouldReturnTrue_WhenBothSet()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.SetPlayerPlayAgain("player1-id", game);
        service.SetPlayerPlayAgain("player2-id", game);

        Assert.True(service.BothPlayersPlayAgain(game));
    }

    [Fact]
    public void BothPlayersPlayAgain_ShouldReturnFalse_WhenOnlyOneSet()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.SetPlayerPlayAgain("player1-id", game);

        Assert.False(service.BothPlayersPlayAgain(game));
    }

    [Fact]
    public void RestartGame_ShouldResetBothPlayers()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        var placements = new List<Ship>
        {
            new Ship { ShipName = "carrier", StartX = 0, StartY = 0, Horizontal = true, Size = 5 }
        };
        service.SetPlayerShips("player1-id", game, placements);
        service.SetPlayerReady("player1-id", game);
        service.SetPlayerPlayAgain("player1-id", game);

        service.RestartGame(game);

        Assert.False(game.Player1.IsReady);
        Assert.False(game.Player1.PlayAgain);
        Assert.Null(game.Player1.Board[0, 0]);
        Assert.Empty(game.Player1.Ships);
        Assert.False(game.Player2.IsReady);
        Assert.False(game.Player2.PlayAgain);
    }

    [Fact]
    public void RestartGame_ShouldResetTurnToPlayer1()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.JoinGame(game.GameId, "player2-id");

        service.SwitchTurn(game);
        Assert.Equal("player2-id", game.CurrentTurnConnectionId);

        service.RestartGame(game);

        Assert.Equal("player1-id", game.CurrentTurnConnectionId);
    }

    [Fact]
    public void SetPlayerUnready_ShouldClearReadyFlag()
    {
        var service = new GameService();
        var game = service.CreateGame("player1-id");
        service.SetPlayerReady("player1-id", game);

        Assert.True(game.Player1.IsReady);

        service.SetPlayerUnready("player1-id", game);

        Assert.False(game.Player1.IsReady);
    }
}
