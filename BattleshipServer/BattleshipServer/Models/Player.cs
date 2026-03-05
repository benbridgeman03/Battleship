namespace BattleshipServer.Models
{
    public class Player
    {
        public string? ConnectionId { get; set; }
        public bool IsReady { get; set; } = false;
        public bool PlayAgain { get; set; } = false;
        public string?[,] Board { get; set; } = new string?[10, 10];
        public List<Ship>? Ships { get; set; }
        public bool isBot { get; set; } = false;
        public Bot? bot { get; set; } = null;

        public void ResetPlayer()
        {
            IsReady = false;
            PlayAgain = false;
            Board = new string?[10, 10];
            Ships = new();
            if (isBot) SetupBot();
        }

        public Bot SetupBot()
        {
            BotProbabilisticStratergy stratergy = new BotProbabilisticStratergy();
            Bot bot = new Bot(stratergy);
            this.bot = bot;
            isBot = true;
            PlaceShipsRandom();
            IsReady = true;
            return bot;
        }

        public void PlaceShipsRandom()
        {
            var random = new Random();
            var shipDefs = new List<(string name, int size)>
            {
                ("carrier", 5), ("battleship", 4), ("cruiser", 3), ("submarine", 3), ("destroyer", 2)
            };

            Ships = new List<Ship>();

            foreach (var (name, size) in shipDefs)
            {
                bool placed = false;
                while (!placed)
                {
                    bool horizontal = random.Next(2) == 0;
                    int startX = random.Next(horizontal ? 10 - size + 1 : 10);
                    int startY = random.Next(horizontal ? 10 : 10 - size + 1);

                    bool overlap = false;
                    for (int k = 0; k < size; k++)
                    {
                        int x = horizontal ? startX + k : startX;
                        int y = horizontal ? startY : startY + k;
                        if (Board[y, x] != null)
                        {
                            overlap = true;
                            break;
                        }
                    }

                    if (!overlap)
                    {
                        var ship = new Ship
                        {
                            id = Ships.Count,
                            ShipName = name,
                            StartX = startX,
                            StartY = startY,
                            Horizontal = horizontal,
                            Size = size
                        };
                        Ships.Add(ship);

                        for (int k = 0; k < size; k++)
                        {
                            int x = horizontal ? startX + k : startX;
                            int y = horizontal ? startY : startY + k;
                            Board[y, x] = ship.id.ToString();
                        }
                        placed = true;
                    }
                }
            }
        }
    }
}
