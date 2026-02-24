using BattleshipServer.Hubs;
using BattleshipServer.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();
builder.Services.AddCors();
builder.Services.AddSingleton<GameService>();

var app = builder.Build();

app.UseCors(policy =>
{
    policy.WithOrigins("http://localhost:5173") // Vite's default port
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials(); // Required for SignalR
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapHub<GameHub>("/gamehub");

app.MapControllers();

app.Run();
