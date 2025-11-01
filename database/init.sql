-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    money DECIMAL(10, 2) DEFAULT 50.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias de jogos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Tabela de jogos
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    img VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    release_date DATE,
    developer VARCHAR(255),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_purchases INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tags para jogos
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Relacionamento muitos-para-muitos entre jogos e tags
CREATE TABLE IF NOT EXISTS game_tags (
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, tag_id)
);

-- Tabela de jogos possuídos
CREATE TABLE IF NOT EXISTS user_games (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Tabela de carrinho
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_id)
);

-- Tabela de histórico de compras
CREATE TABLE IF NOT EXISTS purchase_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    price_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de visualizações de jogos (para sistema de recomendação)
CREATE TABLE IF NOT EXISTS game_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_games_user ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game ON user_games(game_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_views_user ON game_views(user_id);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category_id);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at em users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuários de teste
INSERT INTO users (email, password, money) VALUES 
    ('admin@test.com', 'admin', 100.00),
    ('user@test.com', 'user', 50.00)
ON CONFLICT (email) DO NOTHING;

-- Inserir categorias
INSERT INTO categories (name, description) VALUES 
    ('Ação', 'Jogos de ação com muita adrenalina'),
    ('Aventura', 'Jogos de exploração e história'),
    ('Estratégia', 'Jogos que requerem planejamento tático'),
    ('RPG', 'Jogos de interpretação de personagens'),
    ('Puzzle', 'Jogos de quebra-cabeça e lógica'),
    ('Esportes', 'Simuladores de esportes'),
    ('Corrida', 'Jogos de corrida'),
    ('Arcade', 'Jogos clássicos de arcade')
ON CONFLICT DO NOTHING;

-- Inserir tags
INSERT INTO tags (name) VALUES 
    ('Multiplayer'), ('Singleplayer'), ('Co-op'), ('Competitivo'),
    ('Casual'), ('Hardcore'), ('Indie'), ('Retro'),
    ('2D'), ('3D'), ('Pixel Art'), ('Realista')
ON CONFLICT (name) DO NOTHING;
