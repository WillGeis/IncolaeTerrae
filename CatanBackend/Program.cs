var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/testmap", () =>
{
    GameState.ResourceDirectoryStarter();
    GameState.GenerateNewMaps(1, 5);

    return GameState.GetResourceMapAsJson();
});

app.Run();

public static class GameState
{
    public static Dictionary<int, List<(int node, int playerId)>> RoadMap;
    public static Dictionary<int[], List<(int resourceTypeID, int resourceRoll)>> ResourceMap;
    public static Dictionary<int, string> ResourceDirectory;

    private static Random rng = new Random();

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

        List<int[]> resourcePool = resourceValueGenerator(MapType, MapSize);

        // map param math
        int mapType = MapType;
        int xSize = 3;
        int midpoint = (MapSize / 2);
        int xMaxSize = MapSize;

        ResourceMap = new Dictionary<int[], List<(int resourceTypeID, int resourceRoll)>>();
        for (int i = 0; i < MapSize; i++)
        {
            for (int j = 0; j < xSize; j++)
            {
                int chosenResource = rng.Next(1, 7);
                bool validResource = false;
                while (!validResource)
                {
                    if (resourcePool[0][chosenResource - 1] > 0)
                    {
                        validResource = true;
                        resourcePool[0][chosenResource - 1]--;
                    }
                    else
                    {
                        chosenResource = rng.Next(1, 7);
                    }
                }
                int chosenRoll = rng.Next(1, 7);
                bool validRoll = false;
                while (!validRoll)
                {
                    if (resourcePool[0][chosenResource - 1] > 0)
                    {
                        validRoll = true;
                        resourcePool[0][chosenResource - 1]--;
                    }
                    else
                    {
                        chosenResource = rng.Next(1, 7);
                    }
                }
                List<(int resourceTypeID, int resourceRoll)> currentTile = new List<(int resourceTypeID, int resourceRoll)>();
                currentTile.Add((chosenResource, chosenRoll));
                ResourceMap.Add(new int[] { i, j }, currentTile);
            }
            if (i < midpoint)
            {
                xSize++;
            }
            else
            {
                xSize--;
            }
        }
    }

    private static List<int[]> resourceValueGenerator(int MapType, int MapSize)
    {
        int[] ResourceNumbers = new int[] { 0,0,0,0,0,0,0,0,0,0,0,0};
        int[] ResourcePool = new int[] {0,0,0,0,0,0};
        for (int i = 0; i < MapSize; i++)
        {
            int randomResource1 = rng.Next(1, 7);; // simulate dice roll 1
            int randomResource2 = rng.Next(1, 7); // simulate dice roll 2

            ResourcePool[randomResource1 - 1]++;
            ResourceNumbers[randomResource1 + randomResource2 - 2]++;
        }
        return new List<int[]>() { ResourcePool, ResourceNumbers };
    }

    /*
    AI generated JSON serialization function for ResourceMap
    */
    public static object GetResourceMapAsJson()
    {
        if (ResourceMap == null)
            return new { error = "ResourceMap is not initialized" };

        var result = new Dictionary<string, object>();

        foreach (var entry in ResourceMap)
        {
            var key = $"{entry.Key[0]},{entry.Key[1]}";

            result[key] = entry.Value.Select(t => new
            {
                resourceTypeID = t.resourceTypeID,
                resourceRoll = t.resourceRoll
            }).ToList();
        }

        return result;
    }

}

public class Player
{
    public string Name { get; set; }
    public int Points { get; set; }
    public int Wheat { get; set; }
    public int Bricks { get; set; }
    public int Ore { get; set; }
    public int Wood { get; set; }
    public int Sheep { get; set; }
}
