### INTRODUCTION 
"The application allows two players to play chess against each other in real time. It also provides an option for users to play against the computer. Players can also communicate with each other during the game.A leaderboard feature is also included."

### FUNCTIONAL REQUIREMENT 

## ..signup / login
.New user --> signup (username,email,password) ### validation for email syntax(regix) and password
.Old user --> login  (email, password)
.password encrypted through bcrypt and store in database.
.forget password option 
.logout 



## ..leader board
.username, elo ,won match
.list of top player on the basis of elo
.update after every match



## ..play with computer
."play with computer option"
.system automatically play as a second player



## ..real time 1vs1 game
.two player can play each other (socket.io)
.game board update for both users
.chess.js for valid moves 
.timer for each move
.game end when (checkmate,draw,timeout occurs)
.castling and em passant also included though the help of chess.js



## ..chat between the players 
.with the help of web sockets


### OTHER NON-FUNCTIONAL FUCTIONALITIES

1.user profile 
2.puzzle