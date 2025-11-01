TRUNCATE TABLE game_tags RESTART IDENTITY CASCADE;
TRUNCATE TABLE games RESTART IDENTITY CASCADE;

-- Seed de jogos com diversos títulos para teste

-- Jogos de Ação
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Cyber Warriors', 'Jogo de ação futurista com combates intensos em um mundo cyberpunk', 29.99, 'images/snake.jpg', 1, 'Neon Studios', 4.5, '2023-01-15'),
('Shadow Strike', 'Aventura de ação furtiva em terceira pessoa', 39.99, 'images/pong.png', 1, 'Stealth Games', 4.7, '2023-03-20'),
('Galactic Battle', 'Shooter espacial com gráficos impressionantes', 24.99, 'images/snake.jpg', 1, 'Space Dev', 4.3, '2023-05-10'),
('Urban Combat', 'FPS tático em ambiente urbano moderno', 44.99, 'images/pong.png', 1, 'Tactical Studios', 4.6, '2023-02-28'),
('Ninja Legends', 'Jogo de ação com ninjas e artes marciais', 19.99, 'images/snake.jpg', 1, 'Samurai Games', 4.4, '2023-04-12');

-- Jogos de Aventura  
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Lost Kingdom', 'Explore um reino perdido cheio de mistérios', 34.99, 'images/pong.png', 2, 'Adventure Co', 4.8, '2023-01-05'),
('Ocean Depths', 'Mergulhe nas profundezas do oceano e descubra segredos', 27.99, 'images/snake.jpg', 2, 'Deep Blue', 4.5, '2023-03-15'),
('Mountain Quest', 'Escale montanhas e desvende enigmas antigos', 22.99, 'images/pong.png', 2, 'Peak Games', 4.2, '2023-06-01'),
('Jungle Explorer', 'Aventure-se pela selva amazônica', 18.99, 'images/snake.jpg', 2, 'Wild Studios', 4.0, '2023-02-20'),
('Desert Nomad', 'Sobreviva no deserto e encontre civilizações perdidas', 25.99, 'images/pong.png', 2, 'Sand Games', 4.4, '2023-05-25');

-- Jogos de Estratégia
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Empire Builder', 'Construa e gerencie seu próprio império', 32.99, 'images/snake.jpg', 3, 'Strategy Masters', 4.6, '2023-01-20'),
('War Tactics', 'Estratégia de guerra em tempo real', 29.99, 'images/pong.png', 3, 'Battle Studios', 4.5, '2023-04-05'),
('City Planner', 'Planeje e construa a cidade perfeita', 24.99, 'images/snake.jpg', 3, 'Urban Dev', 4.3, '2023-02-14'),
('Space Commander', 'Comando estratégico de frotas espaciais', 36.99, 'images/pong.png', 3, 'Galactic Games', 4.7, '2023-03-30'),
('Medieval Wars', 'Estratégia medieval com castelos e exércitos', 28.99, 'images/snake.jpg', 3, 'Kingdom Studios', 4.4, '2023-01-28');

-- Jogos de RPG
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Dragon Quest Saga', 'RPG épico com dragões e magia', 49.99, 'images/pong.png', 4, 'Fantasy Games', 4.9, '2023-02-10'),
('Dark Chronicles', 'RPG sombrio com história profunda', 44.99, 'images/snake.jpg', 4, 'Dark Studios', 4.7, '2023-03-25'),
('Hero Journey', 'Torne-se um herói lendário', 39.99, 'images/pong.png', 4, 'Epic Games', 4.6, '2023-01-12'),
('Magic Realms', 'Mundo mágico com feitiços e criaturas', 42.99, 'images/snake.jpg', 4, 'Spell Studios', 4.8, '2023-04-18'),
('Samurai Soul', 'RPG japonês com samurais', 37.99, 'images/pong.png', 4, 'Eastern Games', 4.5, '2023-05-08');

-- Jogos de Puzzle
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Brain Teasers', 'Desafios de lógica para todas as idades', 12.99, 'images/snake.jpg', 5, 'Mind Games', 4.2, '2023-01-08'),
('Pattern Master', 'Encontre padrões e resolva quebra-cabeças', 9.99, 'images/pong.png', 5, 'Puzzle Co', 4.0, '2023-02-22'),
('Color Match', 'Combine cores em desafios cada vez mais difíceis', 7.99, 'images/snake.jpg', 5, 'Rainbow Studios', 3.9, '2023-03-14'),
('Logic Labyrinth', 'Labirintos com desafios de lógica', 14.99, 'images/pong.png', 5, 'Maze Games', 4.3, '2023-04-20'),
('Number Ninja', 'Quebra-cabeças matemáticos divertidos', 11.99, 'images/snake.jpg', 5, 'Math Studios', 4.1, '2023-05-15');

-- Jogos de Esportes
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Soccer Champions', 'Simulador realista de futebol', 34.99, 'images/pong.png', 6, 'Sports Games', 4.6, '2023-01-18'),
('Basketball Pro', 'Basquete profissional com física realista', 29.99, 'images/snake.jpg', 6, 'Hoop Studios', 4.4, '2023-02-25'),
('Tennis Master', 'Tênis competitivo com torneios', 24.99, 'images/pong.png', 6, 'Court Games', 4.2, '2023-03-10'),
('Golf Paradise', 'Golfe em campos paradisíacos', 32.99, 'images/snake.jpg', 6, 'Green Studios', 4.5, '2023-04-15'),
('Volleyball Beach', 'Vôlei de praia multiplayer', 19.99, 'images/pong.png', 6, 'Beach Games', 4.1, '2023-05-20');

-- Jogos de Corrida
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Speed Racers', 'Corridas de alta velocidade', 39.99, 'images/snake.jpg', 7, 'Fast Studios', 4.7, '2023-01-22'),
('Rally Champions', 'Rally off-road emocionante', 34.99, 'images/pong.png', 7, 'Dirt Games', 4.5, '2023-02-18'),
('Formula Pro', 'Simulador de Fórmula 1', 44.99, 'images/snake.jpg', 7, 'Racing Dev', 4.8, '2023-03-08'),
('Street Drift', 'Drift urbano com carros tunados', 27.99, 'images/pong.png', 7, 'Drift Studios', 4.3, '2023-04-28'),
('Mountain Race', 'Corridas em montanhas perigosas', 22.99, 'images/snake.jpg', 7, 'Peak Racing', 4.2, '2023-05-12');

-- Jogos Arcade Clássicos
INSERT INTO games (name, description, price, img, category_id, developer, rating, release_date) VALUES
('Snake', 'O clássico jogo da cobrinha', 5.00, 'images/snake.jpg', 8, 'Retro Games', 4.0, '2023-01-01'),
('Pong', 'O primeiro jogo de arcade', 3.00, 'images/pong.png', 8, 'Classic Studios', 3.8, '2023-01-01'),
('Space Invaders Remake', 'Invasores espaciais modernizados', 8.99, 'images/snake.jpg', 8, 'Retro Studios', 4.2, '2023-02-05'),
('Pac-Man Adventure', 'Nova aventura do Pac-Man', 12.99, 'images/pong.png', 8, 'Maze Masters', 4.4, '2023-03-12'),
('Tetris Ultimate', 'Tetris com novos modos de jogo', 9.99, 'images/snake.jpg', 8, 'Block Games', 4.5, '2023-04-22'),
('Breakout Deluxe', 'Quebre todos os blocos', 6.99, 'images/pong.png', 8, 'Brick Studios', 3.9, '2023-05-18'),
('Asteroids HD', 'Asteróides em alta definição', 7.99, 'images/snake.jpg', 8, 'Space Classics', 4.1, '2023-01-25'),
('Galaga Returns', 'O retorno de Galaga', 10.99, 'images/pong.png', 8, 'Shooter Classics', 4.3, '2023-02-28');

-- Associar tags aos jogos
-- Ação
INSERT INTO game_tags (game_id, tag_id) VALUES
(1, 1), (1, 4), (1, 3), (1, 10),  -- Cyber Warriors
(2, 2), (2, 6), (2, 10),  -- Shadow Strike
(3, 1), (3, 4), (3, 10),  -- Galactic Battle
(4, 1), (4, 4), (4, 12),  -- Urban Combat
(5, 2), (5, 9), (5, 11);  -- Ninja Legends

-- Aventura
INSERT INTO game_tags (game_id, tag_id) VALUES
(6, 2), (6, 10), (6, 7),  -- Lost Kingdom
(7, 2), (7, 10), (7, 7),  -- Ocean Depths
(8, 2), (8, 10),  -- Mountain Quest
(9, 2), (9, 10), (9, 7),  -- Jungle Explorer
(10, 2), (10, 10);  -- Desert Nomad

-- Estratégia
INSERT INTO game_tags (game_id, tag_id) VALUES
(11, 2), (11, 6), (11, 10),  -- Empire Builder
(12, 1), (12, 4), (12, 10),  -- War Tactics
(13, 2), (13, 5), (13, 10),  -- City Planner
(14, 2), (14, 6), (14, 10),  -- Space Commander
(15, 2), (15, 6), (15, 10);  -- Medieval Wars

-- RPG
INSERT INTO game_tags (game_id, tag_id) VALUES
(16, 2), (16, 6), (16, 10),  -- Dragon Quest Saga
(17, 2), (17, 6), (17, 10),  -- Dark Chronicles
(18, 2), (18, 10),  -- Hero's Journey
(19, 2), (19, 10), (19, 7),  -- Magic Realms
(20, 2), (20, 10);  -- Samurai Soul

-- Puzzle
INSERT INTO game_tags (game_id, tag_id) VALUES
(21, 2), (21, 5), (21, 9),  -- Brain Teasers
(22, 2), (22, 5), (22, 9),  -- Pattern Master
(23, 2), (23, 5), (23, 9),  -- Color Match
(24, 2), (24, 5), (24, 9),  -- Logic Labyrinth
(25, 2), (25, 5), (25, 9);  -- Number Ninja

-- Esportes
INSERT INTO game_tags (game_id, tag_id) VALUES
(26, 1), (26, 4), (26, 12),  -- Soccer Champions
(27, 1), (27, 4), (27, 12),  -- Basketball Pro
(28, 1), (28, 4), (28, 12),  -- Tennis Master
(29, 2), (29, 5), (29, 12),  -- Golf Paradise
(30, 1), (30, 4), (30, 12);  -- Volleyball Beach

-- Corrida
INSERT INTO game_tags (game_id, tag_id) VALUES
(31, 1), (31, 4), (31, 12),  -- Speed Racers
(32, 2), (32, 12), (32, 7),  -- Rally Champions
(33, 2), (33, 12), (33, 6),  -- Formula Pro
(34, 2), (34, 5), (34, 12),  -- Street Drift
(35, 2), (35, 12);  -- Mountain Race

-- Arcade
INSERT INTO game_tags (game_id, tag_id) VALUES
(36, 2), (36, 5), (36, 8), (36, 9), (36, 11),  -- Snake
(37, 1), (37, 5), (37, 8), (37, 9), (37, 11),  -- Pong
(38, 2), (38, 8), (38, 11),  -- Space Invaders
(39, 2), (39, 5), (39, 8), (39, 11),  -- Pac-Man
(40, 2), (40, 5), (40, 8), (40, 11),  -- Tetris
(41, 2), (41, 5), (41, 8), (41, 11),  -- Breakout
(42, 2), (42, 8), (42, 11),  -- Asteroids
(43, 2), (43, 8), (43, 11);  -- Galaga
