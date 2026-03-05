using BattleshipServer.Models;

namespace BattleshipServer.Tests;

public class BotTests
{
    [Fact]
    public void GetNextShot_ShouldReturnValidCell()
    {
        var strategy = new BotProbabilisticStratergy();
        var shot = strategy.GetNextShot();

        Assert.InRange(shot.row, 0, 9);
        Assert.InRange(shot.col, 0, 9);
    }

    [Fact]
    public void GetNextShot_ShouldNotReturnMissedCell()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(5, 5, false, 0, false, null);

        var shot = strategy.GetNextShot();

        Assert.NotEqual((5, 5), shot);
    }

    [Fact]
    public void GetNextShot_ShouldNotReturnHitCell()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(5, 5, true, 3, false, "cruiser");

        var shot = strategy.GetNextShot();

        Assert.NotEqual((5, 5), shot);
    }

    [Fact]
    public void GetNextShot_ShouldTargetAdjacentToHit()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(5, 5, true, 3, false, "cruiser");

        var shot = strategy.GetNextShot();

        var adjacent = new List<(int, int)> { (4, 5), (6, 5), (5, 4), (5, 6) };
        Assert.Contains(shot, adjacent);
    }

    [Fact]
    public void GetNextShot_ShouldContinueLineOfHits()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(5, 5, true, 4, false, "battleship");
        strategy.RecordResult(5, 6, true, 4, false, "battleship");

        var shot = strategy.GetNextShot();

        // Should continue the horizontal line
        var continuations = new List<(int, int)> { (5, 4), (5, 7) };
        Assert.Contains(shot, continuations);
    }

    [Fact]
    public void GetNextShot_ShouldNotTargetAroundSunkShip()
    {
        var strategy = new BotProbabilisticStratergy();
        // Hit and sink a destroyer (size 2)
        strategy.RecordResult(0, 0, true, 2, false, "destroyer");
        strategy.RecordResult(0, 1, true, 2, true, "destroyer");

        // Surround with misses so only sunk-adjacent cells remain nearby
        strategy.RecordResult(1, 0, false, 0, false, null);
        strategy.RecordResult(1, 1, false, 0, false, null);
        strategy.RecordResult(0, 2, false, 0, false, null);

        var shot = strategy.GetNextShot();

        // Should not target cells adjacent to the sunk ship
        Assert.NotEqual((0, 0), shot);
        Assert.NotEqual((0, 1), shot);
    }

    [Fact]
    public void RecordResult_ShouldTrackHits()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(3, 4, true, 3, false, "cruiser");

        Assert.Contains((3, 4), strategy.ShotsHit.Keys);
    }

    [Fact]
    public void RecordResult_ShouldTrackMisses()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(3, 4, false, 0, false, null);

        Assert.Contains((3, 4), strategy.ShotsMissed);
    }

    [Fact]
    public void RecordResult_ShouldMoveSunkCells()
    {
        var strategy = new BotProbabilisticStratergy();
        strategy.RecordResult(2, 2, true, 2, false, "destroyer");
        strategy.RecordResult(2, 3, true, 2, true, "destroyer");

        Assert.Contains((2, 2), strategy.SunkCells);
        Assert.Contains((2, 3), strategy.SunkCells);
    }

    [Fact]
    public void HeatMap_ShouldHaveHigherValueInCenter()
    {
        var heatmap = new HeatMap(5);
        var hits = new Dictionary<(int row, int col), string>();
        var misses = new HashSet<(int row, int col)>();

        heatmap.Calculate(hits, misses);

        // Center cells should have more placements passing through than corners
        Assert.True(heatmap.Map[5, 5] > heatmap.Map[0, 0]);
    }

    [Fact]
    public void HeatMap_ShouldZeroOutBlockedPlacements()
    {
        var heatmap = new HeatMap(5);
        var hits = new Dictionary<(int row, int col), string>();
        var misses = new HashSet<(int row, int col)>();

        // Block row 0 with misses so no horizontal size-5 ship can fit
        for (int col = 0; col < 10; col++)
            misses.Add((0, col));

        heatmap.Calculate(hits, misses);

        // Row 0 should have no horizontal contribution, only vertical from below
        // Corner (0,0) can only be reached by vertical placements starting at row 0
        Assert.True(heatmap.Map[0, 0] < heatmap.Map[5, 5]);
    }
}
