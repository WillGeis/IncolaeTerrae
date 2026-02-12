using System.Collections;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDeveloperExceptionPage();

app.MapGet("/testmap", () =>
{
    //GameState.ResourceDirectoryStarter();
    //GameState.GenerateNewMaps(1, 5);
    //GameState.GenerateNodeGraph(1, 5);

    //GameState.Gameloop(2, 1, 5, 1, 10, true);

    //return GameState.GetNodeGraphAsJson();
    //return GameState.GetResourceMapAsJson();

    GameState.ResourceDirectoryStarter();
    GameState.GenerateNewMaps(1, 5);
    GameState.GenerateNodeGraph(1, 5);

    GameState.TestPlaceSettlements();

    var rollHistory =
        new List<Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>>>();

    for (int i = 0; i < 3; i++)
    {
        var rolledHexes = GameState.GatherRolledHexes();
        rollHistory.Add(rolledHexes);

        GameState.AssociatePlayerResources(rolledHexes, 5);
    }

    return new
    {
        Rolls = GameState.GetRolledHexesHistoryAsJson(rollHistory),
        Players = GameState.GetAllPlayersAsJson()
    };
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

    private static int MapSizeGlobal = -1;

    /*
    This Code Chunk runs the main gamestate and facilitator methods.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - 
    ==================================================================================================================================================================================================================================================================
    */
    private static List<Player> Players = new List<Player>();
    
    public static bool Gameloop(int numPlayers, int mapType, int mapSize, int winCondition, int winPoints, bool winTestFlag)
    {
        MapSizeGlobal = mapSize;
        GameStartupPhase(numPlayers, mapType, mapSize);

        int numTurn = 0;

        bool winTestFlag2ndTurn = false;

        while (!CheckWinCondition(Players, winCondition, winPoints) || winTestFlag2ndTurn)
        {
            foreach (var player in Players)
            {
                ResourceRollPhase();
                //PlayerTurn(); //placeholder for now, need to actually give data to parse once i figure out how to connect to frontend
            }
            if (winTestFlag) { winTestFlag2ndTurn = winTestFlag; }
            numTurn++;
        }
        return false;
    }

    public static bool CheckWinCondition(List<Player> players, int winCondition, int winPoints)
    {
        foreach (var player in players)
        {
            int playerPoints = player.Settlements.Count + (2 * player.Cities.Count) + (player.HasLargestArmy ? 2 : 0) + (player.HasLongestRoad ? 2 : 0);
            if (playerPoints >= winPoints)
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

    public static void PlayerTurn(int playerID, bool settlement, int xSettlement, double ySettlement, bool city, int xCity, double yCity, bool road, int xRoad1, int xRoad2, double yRoad1, double yRoad2, bool developmentCard, int developmentCardID, bool playDevelopmentCard, int tradeOfferID, bool startPhase, bool roadBuildingCard)
    {
        // Settlement placing block
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
                if (NodeGraph.ContainsKey((xSettlement, ySettlement)) && // checker for if the key is in the settlements graph
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID == -1 && // checker to make sure code for settlement location is unoccupied
                    NodeGraph[(xSettlement, ySettlement)].Edges.Any(e => e.RoadPlayerID == playerID) && // checker to make sure the settlement is connected to one of the player's roads
                    CheckResources(playerID, 0)) // checker to make sure the player has the resources for a settlement
                {
                    NodeGraph[(xSettlement, ySettlement)].SettlementPlayerID = playerID;
                    Players[playerID].Settlements.Add((xSettlement, ySettlement));
                }
            }
        } 
        // City Placing Block
        else if (city)
        {
            if (startPhase)
            {
                Console.WriteLine("Error: Cannot build city during startup phase");
            }
            else
            {
                if (NodeGraph.ContainsKey((xCity, yCity)) && // checker for if the key is in the settlements graph
                    NodeGraph[(xCity, yCity)].SettlementPlayerID == playerID && // checker to make sure there is a settlement of the player's to upgrade
                    CheckResources(playerID, 1)) // checker to make sure the player has the resources for a city
                {
                    NodeGraph[(xCity, yCity)].SettlementPlayerID = playerID; // this line is redundant but will reload the playerID for the node to PlayerID
                    Players[playerID].Cities.Add((xCity, yCity));
                    Players[playerID].Settlements.Remove((xCity, yCity));
                }
            }
        }
        // Road Placing Block
        else if (road)
        {
            if (startPhase)
            {
                if (NodeGraph.ContainsKey((xRoad1, yRoad1)) && NodeGraph.ContainsKey((xRoad2, yRoad2)) && // checker for if the keys are in the settlements graph
                    NodeGraph[(xRoad1, yRoad1)].Edges.Any(e => e.ConnectedNode == (xRoad2, yRoad2))) // checker to make sure the nodes are adjacent
                {
                    var edge1 = NodeGraph[(xRoad1, yRoad1)].Edges.First(e => e.ConnectedNode == (xRoad2, yRoad2));
                    edge1.RoadPlayerID = playerID;

                    var edge2 = NodeGraph[(xRoad2, yRoad2)].Edges.First(e => e.ConnectedNode == (xRoad1, yRoad1));
                    edge2.RoadPlayerID = playerID;

                    Players[playerID].Roads.Add((xRoad1, xRoad2, yRoad1, yRoad2));
                }
                 else
                {
                    Console.WriteLine("Error: Invalid road coordinates during startup phase");
                }
            }
            else
            {
                if (NodeGraph.ContainsKey((xRoad1, yRoad1)) && NodeGraph.ContainsKey((xRoad2, yRoad2)) && // checker for if the keys are in the settlements graph
                    CheckResources(playerID, 2) && // checker to make sure the player has the resources for a road
                    NodeGraph[(xRoad1, yRoad1)].Edges.Any(e => e.ConnectedNode == (xRoad2, yRoad2)) && // checker to make sure the nodes are adjacent
                    NodeGraph[(xRoad1, yRoad1)].Edges.Any(e => e.RoadPlayerID == playerID) || NodeGraph[(xRoad2, yRoad2)].Edges.Any(e => e.RoadPlayerID == playerID)) // checker to make sure the road is connected to one of the player's existing roads
                {
                    var edge1 = NodeGraph[(xRoad1, yRoad1)].Edges.First(e => e.ConnectedNode == (xRoad2, yRoad2));
                    edge1.RoadPlayerID = playerID;

                    var edge2 = NodeGraph[(xRoad2, yRoad2)].Edges.First(e => e.ConnectedNode == (xRoad1, yRoad1));
                    edge2.RoadPlayerID = playerID;

                    Players[playerID].Roads.Add((xRoad1, xRoad2, yRoad1, yRoad2));
                }
                else if (NodeGraph.ContainsKey((xRoad1, yRoad1)) && NodeGraph.ContainsKey((xRoad2, yRoad2)) &&
                        NodeGraph[(xRoad1, yRoad1)].Edges.Any(e => e.ConnectedNode == (xRoad2, yRoad2)) && // checker to make sure the nodes are adjacent
                        NodeGraph[(xRoad1, yRoad1)].Edges.Any(e => e.RoadPlayerID == playerID) || NodeGraph[(xRoad2, yRoad2)].Edges.Any(e => e.RoadPlayerID == playerID)) // checker to make sure the road is connected to one of the player's existing roads
                {
                    var edge1 = NodeGraph[(xRoad1, yRoad1)].Edges.First(e => e.ConnectedNode == (xRoad2, yRoad2));
                    edge1.RoadPlayerID = playerID;

                    var edge2 = NodeGraph[(xRoad2, yRoad2)].Edges.First(e => e.ConnectedNode == (xRoad1, yRoad1));
                    edge2.RoadPlayerID = playerID;

                    Players[playerID].Roads.Add((xRoad1, xRoad2, yRoad1, yRoad2));
                }
            }
        }

        else if (developmentCard)
        {
            if (startPhase)
            {
                Console.WriteLine("Error: Cannot buy development card during startup phase");
            }
            else
            {
                if (CheckResources(playerID, 3))
                {
                    Players[playerID].DevelopmentCards.Add(rng.Next());
                }
            }
        }

        else if (playDevelopmentCard)
        {
            int monopoly = -1;
            if (developmentCardID == 2)
            {
                monopoly = PlayerPromptInt();
            }
            int yearOfPlenty1 = -1;
            int yearOfPlenty2 = -1;
            if (developmentCardID == 4)
            {
                yearOfPlenty1 = PlayerPromptInt();
                yearOfPlenty2 = PlayerPromptInt();
            }
            DevelopmentCardHandler(playerID, developmentCardID, monopoly, xRoad1, xRoad2, yRoad1, yRoad2, yearOfPlenty1, yearOfPlenty2);
        }

        else if (tradeOfferID >= 0)
        {
            // Trade offer logic goes here
        }

        else
        {
            Console.WriteLine("Error: No valid action selected");
        }
    }   

    // Purchase type ID: 0 = settlement, 1 = city, 2 = road, 3 = development card
    public static bool CheckResources(int PlayerID, int purchaseType)
    {
        switch (purchaseType)
        {
            case 0: // settlement
                if (Players[PlayerID].Wheat >= 1 && Players[PlayerID].Bricks >= 1 && Players[PlayerID].Wood >= 1 && Players[PlayerID].Sheep >= 1)
                {
                    Players[PlayerID].Wheat -= 1;
                    Players[PlayerID].Bricks -= 1;
                    Players[PlayerID].Wood -= 1;
                    Players[PlayerID].Sheep -= 1;
                    return true;
                } 
                else
                {
                    return false;
                }
            
            case 1: // city
                if (Players[PlayerID].Wheat >= 2 && Players[PlayerID].Ore >= 3)
                {
                    Players[PlayerID].Wheat -= 2;
                    Players[PlayerID].Ore -= 3;
                    return true;
                } 
                else
                {
                    return false;
                }

            case 2: // road
                if (Players[PlayerID].Bricks >= 1 && Players[PlayerID].Wood >= 1)
                {
                    Players[PlayerID].Bricks -= 1;
                    Players[PlayerID].Wood -= 1;
                    return true;
                } 
                else
                {
                    return false;
                }

            case 3: // development card
                if (Players[PlayerID].Wheat >= 1 && Players[PlayerID].Ore >= 1 && Players[PlayerID].Sheep >= 1)
                {
                    Players[PlayerID].Wheat -= 1;
                    Players[PlayerID].Ore -= 1;
                    Players[PlayerID].Sheep -= 1;
                    return true;
                } 
                else
                {
                    return false;
                }
            
        }
        return false;
    }

    public static bool BoatTradeHandler(int PlayerID, int GiveResourceID, int ReceiveResourceID)
    {
        // Boat trade logic goes here
        return true;
    }

    /*
    This Code Chunk is a prompt for a user interaction.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - none yet
    ==================================================================================================================================================================================================================================================================
    */
    public static int PlayerPromptInt()
    {
        return 1; //DO NOT HARDCODE THIS YOU NEED TO DO AN API CALL
    }

    /*
    This Code Chunk generates the resource map instance for this game and defines constructors for it.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - ResourceMap: gives the tile coordinates as a key and a tuple of the resource ID type (defined in ResourceDirectory) and the resource roll, simulated as 2 dice rolls
     - ResourceDirctory: associates the integer given in ResourceMap to a resource name, not really sure if this is fully necessary for a backend, but it helps me keep it in my head
    ==================================================================================================================================================================================================================================================================
    */
    public static Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> ResourceMap;
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

        ResourceMap = new Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>>();
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
                List<(int resourceTypeID, int resourceRoll, bool hasRobber)> currentTile = new List<(int resourceTypeID, int resourceRoll, bool hasRobber)>();
                currentTile.Add((chosenResource, chosenRoll, false));
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
    This Code Chunk rolls a dice then assigs resources.
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - none yet
    ==================================================================================================================================================================================================================================================================
    */

    public static void ResourceRollPhase()
    {
        var rolledHexes = GatherRolledHexes();

        AssociatePlayerResources(rolledHexes, MapSizeGlobal);
    }

    // public static Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> ResourceMap;
    //Player.thesethings:
    //    public List<(int x, double y)> Settlements { get; set; } = new List<(int x, double y)>();
    //    public List<(int x, double y)> Cities { get; set; } = new List<(int x, double y)>();
    /*
            { 1, "Wheat" },
            { 2, "Brick" },
            { 3, "Ore" },
            { 4, "Wood" },
            { 5, "Sheep" },
            { 6, "Desert" }
    */
    public static void AssociatePlayerResources(Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> rolledHexes, int MapSize)
    {
        List<(int, int[])> playerResources = new List<(int, int[])> { };

        int midpoint = (MapSize / 2);

        foreach (var rolledHex in rolledHexes)
        {
            var resourcedNodes = new List<(int x, double y)>();

            int rolledXTemp = rolledHex.Key.x;
            double rolledYTemp = rolledHex.Key.y;

            int resourceType = rolledHex.Value[0].resourceTypeID;

            resourcedNodes.Add((rolledXTemp, rolledYTemp + .5)); // spoke up .5 left .5
            resourcedNodes.Add((rolledXTemp + 1, rolledYTemp + .5)); // spoke up .5 right .5
            resourcedNodes.Add((rolledXTemp, rolledYTemp + 1)); // spoke down .5 left .5
            resourcedNodes.Add((rolledXTemp + 1, rolledYTemp + 1)); // spoke down .5 right .5
            if (rolledYTemp < midpoint) // getting bigger
            {
                resourcedNodes.Add((rolledXTemp, rolledYTemp)); // spoke up 1.5 left .5
                resourcedNodes.Add((rolledXTemp + 1, rolledYTemp + 1.5)); // spoke down 1.5 right .5
            }
            else if (rolledYTemp > midpoint) // getting smaller
            {
                resourcedNodes.Add((rolledXTemp + 1, rolledYTemp)); // spoke up 1.5 right .5
                resourcedNodes.Add((rolledXTemp, rolledYTemp + 1.5)); // spoke down 1.5 left .5
            }
            else // largest x
            {
                resourcedNodes.Add((rolledXTemp, rolledYTemp)); // spoke up 1.5 left .5
                resourcedNodes.Add((rolledXTemp, rolledYTemp + 1.5)); // spoke down 1.5 left .5
            }

            foreach (var player in Players)
            {
                foreach (var settlement in player.Settlements)
                {
                    foreach (var node in resourcedNodes)
                    {
                        if (settlement.x == node.x && settlement.y == node.y)
                        {
                            switch (resourceType)
                            {
                                case 1:
                                    player.Wheat += 1;
                                    break;
                                case 2:
                                    player.Bricks += 1;
                                    break;
                                case 3:
                                    player.Ore += 1;
                                    break;
                                case 4:
                                    player.Wood += 1;
                                    break;
                                case 5:
                                    player.Sheep += 1;
                                    break;
                                case 6:
                                    break;
                            }
                        }
                    }
                }
            }
        } 
    }

    public static Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> RolledHexes = new Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>>();
    public static Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> GatherRolledHexes()
    {
        var rolledHexes = new Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>>();

        int DiceRollTemp = DiceRoll();

        foreach (var (hexCoord, resourceList) in ResourceMap)
        {
            foreach (var resource in resourceList)
            {
                if (resource.resourceRoll == DiceRollTemp && !resource.hasRobber)
                {
                    if (!rolledHexes.ContainsKey(hexCoord))
                    {
                        rolledHexes[hexCoord] = new List<(int resourceTypeID, int resourceRoll, bool hasRobber)>();
                    }

                    rolledHexes[hexCoord].Add(resource);
                }
            }
        }

        return rolledHexes;
    }

    public static int DiceRoll()
    {
        return rng.Next(1, 7) + rng.Next(1, 7);
    }



    /*
    This code chunk will handle all Development Card logic
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - DevelopmentCardDirectory: associates the integer given in DevelopmentCards to a development card name
    ==================================================================================================================================================================================================================================================================
    */

    public static Dictionary<int, string> DevelopmentCardDirectory;

    public static void DevelopmentCardDirectoryStarter()
    {
        DevelopmentCardDirectory = new Dictionary<int, string>
        {
            { 1, "Knight" },
            { 2, "Monopoly" },
            { 3, "Road Building" },
            { 4, "Year of Plenty" },
            { 5, "Victory Point" }
        };
    }

    public static void DevelopmentCardHandler(int PlayerID, int CardID, int monopolyResourceID, int roadX1, int roadX2, double roadY1, double roadY2, int resourceSelection1, int resourceSelection2)
    {
        if (!DevelopmentCardDirectory.ContainsKey(CardID))
        {
            Console.WriteLine("Error: Invalid Development Card ID");
            return;
        }
        if (Players[PlayerID].DevelopmentCards.Contains(CardID))
        {
            Players[PlayerID].DevelopmentCards.Remove(CardID);
            switch (CardID)
            {
                case 1: // Knight
                    var playerInput = GetPlayerRobberInput();
                    MoveRobber(playerInput[0].x, playerInput[0].y);
                    Players[PlayerID].KnightsPlayed++;
                    break;
                case 2: // Monopoly
                    foreach (var player in Players)
                    {
                        if (player.PlayerID != PlayerID)
                        {
                            switch (monopolyResourceID)
                            {
                                case 1:
                                    Players[PlayerID].Wheat += player.Wheat;
                                    player.Wheat = 0;
                                    break;
                                case 2:
                                    Players[PlayerID].Bricks += player.Bricks;
                                    player.Bricks = 0;
                                    break;
                                case 3:
                                    Players[PlayerID].Ore += player.Ore;
                                    player.Ore = 0;
                                    break;
                                case 4:
                                    Players[PlayerID].Wood += player.Wood;
                                    player.Wood = 0;
                                    break;
                                case 5:
                                    Players[PlayerID].Sheep += player.Sheep;
                                    player.Sheep = 0;
                                    break;
                            }
                        }
                    }
                    break;
                case 3: // Road Building
                    PlayerTurn(PlayerID, false, -1, -1, false, -1, -1, true, roadX1, roadX2, roadY1, roadY2, false, -1, false, -1, false, true);
                    PlayerTurn(PlayerID, false, -1, -1, false, -1, -1, true, roadX1, roadX2, roadY1, roadY2, false, -1, false, -1, false, true);
                    break;
                case 4: // Year of Plenty
                    switch (resourceSelection1)
                    {
                        case 1:
                            Players[PlayerID].Wheat++;
                            break;
                        case 2:
                            Players[PlayerID].Bricks++;
                            break;
                        case 3:
                            Players[PlayerID].Ore++;
                            break;
                        case 4:
                            Players[PlayerID].Wood++;
                            break;
                        case 5:
                            Players[PlayerID].Sheep++;
                            break;
                    }
                    switch (resourceSelection2)
                    {
                        case 1:
                            Players[PlayerID].Wheat++;
                            break;
                        case 2:
                            Players[PlayerID].Bricks++;
                            break;
                        case 3:
                            Players[PlayerID].Ore++;
                            break;
                        case 4:
                            Players[PlayerID].Wood++;
                            break;
                        case 5:
                            Players[PlayerID].Sheep++;
                            break;
                    }
                    break;
                case 5: // Victory Point
                    Players[PlayerID].ExtraPoints++;
                    break;
            }
        }
    }

    /*
    Robber Logic Code Chunk
    ==================================================================================================================================================================================================================================================================
    Constructors are:
     - RobberCoords: gives the tile coordinates as a key and a bool if they are there or not
    ==================================================================================================================================================================================================================================================================
    */
    public static Dictionary<(int x, double y), bool> RobberCoords = new Dictionary<(int x, double y), bool>();

    public static List<(int x, double y)> GetPlayerRobberInput() // THIS NEEDS TO NOT BE HARDCODED, I AM TOO LAZY RN
    {
        List<(int x, double y)> result = new List<(int x, double y)> {(0, 0.0)};
        return result;
    }

    public static void InitializeRobber(int startX, int startY)
    {
        RobberCoords[(startX, startY)] = true;
    }
    
    public static void MoveRobber(int newX, double newY)
    {
        foreach (var key in RobberCoords.Keys.ToList())
        {
            RobberCoords[key] = false;
        }

        if (RobberCoords.ContainsKey((newX, newY)))
        {
            RobberCoords[(newX, newY)] = true;
        }
        else
        {
            RobberCoords[(newX, newY)] = true;
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
    Test Methods
    ==================================================================================================================================================================================================================================================================
    NO CONSTRUCTORS:
     - TestPlaceSettlements() - places settlements
    ==================================================================================================================================================================================================================================================================
    */
    public static void TestPlaceSettlements()
    {
        if (NodeGraph == null)
            throw new Exception("NodeGraph not initialized");
        Players.Clear();

        Players.Add(new Player { PlayerID = 0, Name = "Player 1" });

        Players.Add(new Player { PlayerID = 1, Name = "Player 2" });

        // Player 0 (Displayed as Player 1) settlement at (0,0)
        if (NodeGraph.ContainsKey((0, 0)))
        {
            NodeGraph[(0, 0)].SettlementPlayerID = 0;
            Players[0].Settlements.Add((0, 0));
        }
        else
        {
            Console.WriteLine("WARNING: Node (0,0) does not exist, if this comes up you have seriously fucked up the code");
        }

        // Player 1 (Player 2 Disp) settlement at (2,3)
        if (NodeGraph.ContainsKey((2, 3)))
        {
            NodeGraph[(2, 3)].SettlementPlayerID = 1;
            Players[1].Settlements.Add((2, 3));
        }
        else
        {
            Console.WriteLine("WARNING: Node (2,3) does not exist, with mapsize >5 this line should not come up");
        }
    }


    /*
    AI GENERATED SERIALIZATION METHODS
    ==================================================================================================================================================================================================================================================================
    NO CONSTRUCTORS:
     - GetResourceMapAsJson: serializes the ResourceMap into a JSON-compatible object
     - GetNodeGraphAsJson: serializes the NodeGraph into a JSON-compatible object
     - GetPlayerResourcesAsJson: serializes player resources, used after turn 1
     - GetNodeGraphAndGetPlayerResources: used in testting because I have not written the frontend
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

    public static object GetPlayerResourcesAsJson(int playerID)
    {
        if (playerID < 0 || playerID >= Players.Count)
            return new { error = "Invalid player ID" };

        var p = Players[playerID];

        return new
        {
            p.PlayerID,
            p.Name,
            Resources = new
            {
                p.Wheat,
                p.Bricks,
                p.Ore,
                p.Wood,
                p.Sheep
            },
            Settlements = p.Settlements.Select(s => new
            {
                x = s.x,
                y = s.y
            }).ToList(),
            Cities = p.Cities.Select(c => new
            {
                x = c.x,
                y = c.y
            }).ToList()
        };
    }

    public static object GetRolledHexesAsJson(Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>> rolledHexes)
    {
        var result = new Dictionary<string, object>();

        foreach (var entry in rolledHexes)
        {
            var key = $"{entry.Key.x},{entry.Key.y}";

            result[key] = entry.Value.Select(r => new
            {
                resourceTypeID = r.resourceTypeID,
                resourceRoll = r.resourceRoll
            }).ToList();
        }

        return result;
    }

    public static object GetAllPlayersAsJson()
    {
        return Players.Select(p => new
        {
            p.PlayerID,
            p.Name,
            Resources = new
            {
                p.Wheat,
                p.Bricks,
                p.Ore,
                p.Wood,
                p.Sheep
            },
            Settlements = p.Settlements.Select(s => new
            {
                x = s.x,
                y = s.y
            }).ToList()
        }).ToList();
    }


    public static object GetNodeGraphAndGetPlayerResources(int playerID)
    {
        return new
        {
            NodeGraph = GetNodeGraphAsJson(),
            Player = GetPlayerResourcesAsJson(playerID)
        };
    }

    public static object GetRolledHexesHistoryAsJson(List<Dictionary<(int x, int y), List<(int resourceTypeID, int resourceRoll, bool hasRobber)>>> history)
    {
        var result = new List<object>();

        int rollIndex = 0;

        foreach (var roll in history)
        {
            var rollEntry = new Dictionary<string, object>();

            foreach (var hex in roll)
            {
                var key = $"{hex.Key.x},{hex.Key.y}";

                rollEntry[key] = hex.Value.Select(r => new
                {
                    resourceTypeID = r.resourceTypeID,
                    resourceRoll = r.resourceRoll
                }).ToList();
            }

            result.Add(new
            {
                RollNumber = rollIndex++,
                Hexes = rollEntry
            });
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
    public List<int> DevelopmentCards { get; set; } = new List<int>();
    public int KnightsPlayed { get; set; }
    public bool HasLargestArmy { get; set; }
    public bool HasLongestRoad { get; set; }
    public int ExtraPoints { get; set; }
}