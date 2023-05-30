# Welcome to MultiSnake V2



## Updated to V2.1.0
### Changes

#### Added classic map
- No walls spawn, get 10 apples to win


#### Added Small Map
- This was easy as I just had to change the "size" parameter
- Added some query strings so that you could change room type
- Updated to way the board was drawn to display different map sizes

#### Added Login/Signup system
- connect to AWS dynamoDB to create account
- Some express session to manage them
- added the ability to click on logged in users from the leader board to view their stats
- emails are private dont worry (I just need to validate them for chat- this is powerd by amazon SES)

#### Added fun API Token generation
- This is to prevent bots from connecting and impersonating other player
- Here how it works
    1. A user connect, server sends request to reCaptcha
    2. If the user is judged to not be a bot, an API key is generated and sent back to the client
    3. The client then sends the API key along with their JOIN_REQUEST
    4. The server checks to see if the key is valid, then assigns it their snakes UID
    5. Whenever they change direction, they also send their API key, which is checked against their UID

## Updated to V2.0.0

### New Game UI

![multisnake ui](MultiSnake-V2/src/server/public/multisnake-logs-images/gameplay_v2.png)

Migrated from HTML table to HTML canvas, this means 60 FPS no matter what.
Added better CSS styling, using the grid interface.

### Developer view

![dev mode UI](MultiSnake-V2/src/server/public/multisnake-logs-images/dev_mode.png)

This view shows the spawn gradient (more on that later), coordinates of each point, and a grid.

### Revamped spawning system

This completely eliminates spawn camping. Heres how it works

1. The client sends a "request_optimal_spawn" request to the server, and passes the room it want to spawn into.
2. The server calculates a gradient of the map, so that dangerous zones are highlighted (on dev mode, this is the red spots).
3. The server picks the point with the lowest level of gradient, then checks in each direction what the gradient values are facing up, down, left, and right.
4. The direction with the lowest gradient is picked, then sent back to the client
5. The client displays this to the user, waits 1 seconds, then sends a 'spawn_request' back to the server, passing the optimal spawn recieved from the first couple steps. This allows to snake to be spawned int

### Completely remade Bots

- this time, they actually know what they are doing

#### Here is how I did it

1. If a room does not have 3 players, a bot is spawned in.
2. Each bot has a rate of mistakes. The higher the rate of mistake, the worse the bot (this ensures that they are not perfect, and makes them more human like. It also ensures no two bots are the same)
3. Every tick, the bot looks to change its direction towards the apple. If anything is in its way, it turns away from the obstacle
4. If it wants to turn back on itself, it instead picks a random direction on the opposite axis instead, so that it can avoid running into itself
5. Every tick, the bot picks a number 1-100. If the number is bigger than the rate of mistakes, a mistake is made. A mistake is any move that does not avoid an obstacle or move it towards it's goal

### Made the death screen a lot more interesting

This one was just random. A message is displayed in a random position 60 times a second, giving a crazy effect that I'm rather fond of


## Contributing

Submit a PR on the github, DM me on discord (sojs#8307), email me, comment on the repl, etc. Just reach out!