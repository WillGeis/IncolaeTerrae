using Microsoft.AspNetCore.SignalR;

public class GameHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var guid = Context.GetHttpContext()?.Request.Query["guid"];
        Console.WriteLine($"[SIGNALR] Client connected: {Context.ConnectionId}, GUID: {guid}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"[SIGNALR] Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    // Client joins a game
    public async Task JoinRoom(string guid)
    {
        var player = GameState.GetPlayers()
            .FirstOrDefault(p => p.GUID.ToString() == guid);

        if (player == null)
        {
            await Clients.Caller.SendAsync("Error", "[ERROR] Player not found");
            return;
        }

        player.ConnectionId = Context.ConnectionId;
        player.IsConnected = true;
        player.LastSeen = DateTime.UtcNow;

        await Groups.AddToGroupAsync(Context.ConnectionId, "game");
        Console.WriteLine($"[SIGNALR] {player.Username} joined room!");

        await Clients.Group("game").SendAsync("PlayerJoined", player.Username);
    }

    // Client calls this to make a move
    public async Task PlayerMove(string guid, int moveType, object moveData)
    {
        var player = GameState.GetPlayers()
            .FirstOrDefault(p => p.GUID.ToString() == guid);

        if (player == null)
        {
            await Clients.Caller.SendAsync("Error", "Player not found");
            return;
        }

        Console.WriteLine($"[MOVE] {player.Username}: {moveType}");

        // Process the move, then broadcast updated state to everyone
        GameState.ProcessMove(player, moveType, moveData);
        await Clients.Group("game").SendAsync("GameStateUpdated", GameState.GameStatePackager());
    }
}