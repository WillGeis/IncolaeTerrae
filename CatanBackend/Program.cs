var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDeveloperExceptionPage();

app.MapGet("/testmap", () =>
{
    GameState.ResourceDirectoryStarter();
    GameState.GenerateNewMaps(1, 5);
    GameState.GenerateNodeGraph(1, 5);

    return GameState.GetNodeGraphAsJson();
    //return GameState.GetResourceMapAsJson();
});

app.MapPost("/api/send-array", (int[] data) =>
{
    return Results.Ok(GameState.SendArrayAsJson(data));
});

app.Run();

public static class GameState
{
    /*
    Global resources go here so that they do not break runtime
    ==================================================================================================================================================================================================================================================================
    Resources are:
     - rng: random number generator, note for the future, if you are generating new randoms in loops, it breaks the runtime
    ==================================================================================================================================================================================================================================================================
    */
    private static Random rng = new Random();

    /*
    This Code Chunk runs the main gamestate and facilitator methods.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - 
    ==================================================================================================================================================================================================================================================================
    */
    private static List<Player> Players = new List<Player>();
    
    public static bool Gameloop(int numPlayers, int mapType, int mapSize, int winCondition)
    {
        GameStartupPhase(numPlayers, mapType, mapSize);

        while (!CheckWinCondition(Players, winCondition))
        {
            foreach (var player in Players)
            {
                // Player turn logic goes here
            }
        }
        return false;
    }

    public static bool CheckWinCondition(List<Player> players, int winCondition)
    {
        foreach (var player in players)
        {
            int playerPoints = player.Settlements.Count + (2 * player.Cities.Count) + (player.HasLargestArmy ? 2 : 0) + (player.HasLongestRoad ? 2 : 0);
            if (playerPoints >= winCondition)
            {
                return true;
            }
        }
        return false;
    }

    public static bool GameStartupPhase(int numPlayers, int mapType, int mapSize)
    {
        GenerateNewMaps(mapType, mapSize);
        GenerateNodeGraph(mapType, mapSize);
        // player setup
        for (int i = 0; i < numPlayers; i++)
        {
            Players.Add(new Player
            {
                PlayerID = i,
                Name = $"Player {i + 1}",
                Wheat = 0,
                Bricks = 0,
                Ore = 0,
                Wood = 0,
                Sheep = 0,
                KnightsPlayed = 0,
                HasLargestArmy = false,
                HasLongestRoad = false
            });
        }
        return true;
    }

    public static void InitialPlayerTurn(int playerID, bool settlement, int xSettlement, double ySettlement, bool city, int xCity, int yCity, bool road, int xRoad1, int xRoad2, double yRoad1, double yRoad2, bool developmentCard, int playDevelopmentCard, int tradeOfferID, bool startPhase)
    {
        if (settlement)
        {
            NodeGraph.ContainsKey((xSettlement, ySettlement));
            if (startPhase)
            {
                if (NodeGraph.ContainsKey((xSettlement, ySettlement)) &&
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID == -1)
                {
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID = playerID;
                    Players[playerID].Settlements.Add((xSettlement, ySettlement));
                }
                else
                {
                    Console.WriteLine("Error: Invalid settlement coordinates during startup phase");
                }
            }
            else
            {
                if (NodeGraph.ContainsKey((xSettlement, ySettlement)) &&
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID == -1)
                {
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID = playerID;
                    Players[playerID].Settlements.Add((xSettlement, ySettlement));
                }
            }
        }
    }

    /*
    This Code Chunk generates the resource map instance for this game and defines constructors for it.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - ResourceMap: gives the tile coordinates as a key and a tuple of the resource ID type (defined in ResourceDirectory) and the resource roll, simulated as 2 dice rolls
     - ResourceDirctory: associates the integer given in ResourceMap to a resource name, not really sure if this is fully necessary for a backend, but it helps me keep it in my head
    ==================================================================================================================================================================================================================================================================
    */
    public static Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll)>> ResourceMap;
    public static Dictionary<int, string> ResourceDirectory;

    /*
    Initializes the ResourceDirectory with resource IDs
    */
    public static void ResourceDirectoryStarter()
    {
        ResourceDirectory = new Dictionary<int, string>
        {
            { 1, "Wheat" },
            { 2, "Brick" },
            { 3, "Ore" },
            { 4, "Wood" },
            { 5, "Sheep" },
            { 6, "Desert" }
        };
    }

    /*
    Maps Type is currently unused and will be set to 1 for all intents and purposes until I figure out what the fuck it means
    */
    public static void GenerateNewMaps(int MapType, int MapSize) // for purposes the MapSize variable is the 'Y' axis of the map, starting at the top
    {
        if (MapType < 0 || MapSize < 4) {
            Console.WriteLine("Error: Invalid MapType or MapSize");
            return;
        }

        int xSize = 3;

        int numTiles = NumberOfTiles(MapType, MapSize, xSize);

        List<int[]> resourcePool = resourceValueGenerator(MapType, numTiles);

        // map param math
        int mapType = MapType;
        
        int midpoint = (MapSize / 2);
        int xMaxSize = MapSize;

        ResourceMap = new Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll)>>();
        for (int i = 0; i < MapSize; i++)
        {
            for (int j = 0; j < xSize; j++)
            {
                // Code block for resource index
                int chosenResource = rng.Next(1, 7);
                int[] tileResourcePool = resourcePool[0];

                if (tileResourcePool.Sum() == 0)
                    throw new Exception("Ran out of resources!!!!");
                
                while (tileResourcePool[chosenResource - 1] <= 0)
                {
                    chosenResource = rng.Next(1, 7);
                }
                tileResourcePool[chosenResource - 1]--;

                // Code block for resource roll
                int chosenRoll = rng.Next(1, 7) + rng.Next(1, 7);
                int[] rollPool = resourcePool[1];

                if (rollPool.Sum() == 0)
                    throw new Exception("Ran out of dinner rolls!!!!");

                while (rollPool[chosenRoll - 2] <= 0)
                {
                    chosenRoll = rng.Next(1, 7) + rng.Next(1, 7);
                }
                rollPool[chosenRoll - 2]--;

                // assign the current tile its values
                List<(int resourceTypeID, int resourceRoll)> currentTile = new List<(int resourceTypeID, int resourceRoll)>();
                currentTile.Add((chosenResource, chosenRoll));
                ResourceMap.Add((i, j), currentTile);
            }
            if (i < midpoint)
            {
                xSize++;
            }
            else
            {
                xSize--;
            }

            // This is a code block for saftey because I cannot do math...
            if (xSize < 3)
            {
                i = 999;
            }
        }
    }
    
    /*
    helper method to calculate number of tiles
    */
    private static int NumberOfTiles(int MapType, int MapSize, int XSize)
    {
        int totalTiles = 0;
        for (int i = 0; i < MapSize; i++)
        {
            totalTiles += XSize;
            if (i < (MapSize / 2))
            {
                XSize++;
            }
            else
            {
                XSize--;
            }
        }

        return totalTiles;
    }

    /*
    helper method to get resource: rolls, and counts.

    Likely this will have to be revisited to create balanced resource nodes (i.e. not 15 deserts) because Catan does balance them, but for now an unsophisticated assigner for an infinitely scalable map will do
    */
    private static List<int[]> resourceValueGenerator(int MapType, int NumTiles)
    {
        int[] ResourceNumbers = new int[] { 0,0,0,0,0,0,0,0,0,0,0,0};
        int[] ResourcePool = new int[] {0,0,0,0,0,0};
        for (int i = 0; i < NumTiles; i++)
        {
            int randomResource1 = rng.Next(1, 7);; // simulate dice roll 1
            int randomResource2 = rng.Next(1, 7); // simulate dice roll 2

            ResourcePool[randomResource1 - 1]++;
            ResourceNumbers[randomResource1 + randomResource2 - 2]++;
        }
        return new List<int[]>() { ResourcePool, ResourceNumbers };
    }

    /*
    This code chunk will generate the node graph for player interactable nodes (settlement and city areas) and edges (roads)
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - NodeGraph: gives the node coordinates as follows: whole numbers on the y axis are on the points of the top and bottoms of tiles, where halves are on the "4 corners". x axis will simply be incremented as you move right from the left
    ==================================================================================================================================================================================================================================================================
    */

    public static Dictionary<(int x, double y), Node> NodeGraph;

    public static Dictionary<double, int> NodeLayout;

    public static void GenerateNodeGraph(int MapType, int MapSize)
    {
        if (MapType < 0 || MapSize < 4) {
            Console.WriteLine("Error: Invalid MapType or MapSize");
            return;
        }

        NodeGraph = new Dictionary<(int x, double y), Node>();
        
        Dictionary<double, int> nodeLayout = new Dictionary<double, int>();

        double nodeYSize = MapSize + 1;
        double yMidpoint = (MapSize / 2) + 1;
        
        int nodeXSize = 3;

        for (double i = 0; i < nodeYSize; i += 0.5)
        {
            if (i % 1 == .5 && i < yMidpoint) // above the center row
            {
                nodeXSize++;
            } 
            else if (i % 1 == .5 && i > yMidpoint) // below the center row
            {
                nodeXSize--;
            }
            else
            {
                // do nothing, x size stays the same
            }

            nodeLayout[i] = nodeXSize;

            for (int j = 0; j < nodeXSize; j++)
            {
                AddNode(j, i);
            }
        }

        EdgeConnectorInitializer(yMidpoint);
    }

    private static void EdgeConnectorInitializer (double Midpoint)
    {
        foreach (var node in NodeGraph)
        {
            var (x, y) = node.Key;
            
            List<(int dx, double dy)> offsets = new();
            // top half//////////////////////////////////////////////////////////////////////
            if (y < Midpoint)
            {
                // Up and down lines for all top half (points and corners) ///////
                offsets.Add((0, .5)); //downlines
                if (y != 0) // non-topmost points
                {
                    offsets.Add((0, -.5)); //uplines
                }
                //////////////////////////////////////////////////////////////////
                
                // Cross lines for top half (points and corners) /////////////////
                if (y % 1 == 0) // top half points
                {
                    offsets.Add((1, .5));
                }
                else // top half corners
                {
                    offsets.Add((-1, -.5));
                }
                //////////////////////////////////////////////////////////////////
            }
            // bottom half///////////////////////////////////////////////////////////////////
            else 
            {
                // Up and down lines for all bottom half (points and corners) ////
                offsets.Add((0, -.5)); //uplines
                if (y != Midpoint * 2 - 1) // non-bottommost points
                {
                    offsets.Add((0, .5)); //downlines
                }
                //////////////////////////////////////////////////////////////////
                
                // Cross lines for bottom half (points and corners) //////////////
                if (y % 1 == 0) // bottom half points
                {
                    offsets.Add((-1, .5));
                }
                else // bottom half corners
                {
                    offsets.Add((1, -.5));
                }
                //////////////////////////////////////////////////////////////////
            }

            foreach (var (dx, dy) in offsets)
            {
                var neighborCoord = (x + dx, y + dy);
                if (NodeGraph.ContainsKey(neighborCoord))
                {
                    AddEdge((x, y), neighborCoord);
                }
            }
        }
    }

    public static void AddNode(int x, double y)
    {
        NodeGraph[(x, y)] = new Node
        {
            SettlementPlayerID = -1,
            Edges = new List<Edge>()
        };
    }

    public static void AddEdge((int x, double y) from, (int x, double y) to)
    {
        if (!NodeGraph[from].Edges.Any(e => e.ConnectedNode == to))
        {
            NodeGraph[from].Edges.Add(new Edge
            {
                ConnectedNode = to,
                RoadPlayerID = -1
            });
        }

        if (!NodeGraph[to].Edges.Any(e => e.ConnectedNode == from))
        {
            NodeGraph[to].Edges.Add(new Edge
            {
                ConnectedNode = from,
                RoadPlayerID = -1
            });
        }
    }

    /*
    API Method for sending arrays as JSON
    ==================================================================================================================================================================================================================================================================
    NO CONSTRUCTORS:
     - 
    ==================================================================================================================================================================================================================================================================
    */
    public static object SendArrayAsJson<T>(T[] data)
    {
        if (data == null)
            return new { error = "Data array is null" };

        return data;
    }



    /*
    AI GENERATED SERIALIZATION METHODS
    ==================================================================================================================================================================================================================================================================
    NO CONSTRUCTORS:
     - GetResourceMapAsJson: serializes the ResourceMap into a JSON-compatible object
     - GetNodeGraphAsJson: serializes the NodeGraph into a JSON-compatible object
    ==================================================================================================================================================================================================================================================================
    */
    public static object GetResourceMapAsJson()
    {
        if (ResourceMap == null)
            return new { error = "ResourceMap is not initialized" };

        var result = new Dictionary<string, object>();

        foreach (var entry in ResourceMap)
        {
            var key = $"{entry.Key.x},{entry.Key.y}";

            result[key] = entry.Value.Select(t => new
            {
                resourceTypeID = t.resourceTypeID,
                resourceRoll = t.resourceRoll,
            }).ToList();
        }

        return result;
    }

    public static object GetNodeGraphAsJson()
    {
        if (NodeGraph == null)
            return new { error = "NodeGraph is not initialized" };

        var result = new Dictionary<string, object>();

        foreach (var entry in NodeGraph)
        {
            var key = $"{entry.Key.x},{entry.Key.y}";

            result[key] = new
            {
                SettlementPlayerID = entry.Value.SettlementPlayerID,
                Edges = entry.Value.Edges.Select(e => new
                {
                    RoadPlayerID = e.RoadPlayerID,
                    ConnectedNode = new { x = e.ConnectedNode.x, y = e.ConnectedNode.y }
                }).ToList()
            };
        }

        return result;
    }

}

public class Edge
{
    public int RoadPlayerID { get; set; }   // -1 is default, so no road
    public (int x, double y) ConnectedNode { get; set; }
}

public class Node
{
    public int SettlementPlayerID { get; set; }   // -1 is default, so no settlement
    public List<Edge> Edges { get; set; } = new List<Edge>();
}

public class Player
{
    public int PlayerID { get; set; }
    public string Name { get; set; }
    public int Wheat { get; set; }
    public int Bricks { get; set; }
    public int Ore { get; set; }
    public int Wood { get; set; }
    public int Sheep { get; set; }
    public List<(int x, double y)> Settlements { get; set; } = new List<(int x, double y)>();
    public List<(int x, double y)> Cities { get; set; } = new List<(int x, double y)>();
    public List<(int x1, int x2, double y1, double y2)> Roads { get; set; } = new List<(int x1, int x2, double y1, double y2)>(); 
    public int KnightsPlayed { get; set; }
    public bool HasLargestArmy { get; set; }
    public bool HasLongestRoad { get; set; }
}
