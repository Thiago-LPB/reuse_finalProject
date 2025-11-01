{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
        };
        
        src = builtins.filterSource
          (path: type:
            let name = builtins.baseNameOf path;
            in !(name == ".dev-db" || name == "target" || name == ".git")
          )
          ./.;
        
        buildInputs = with pkgs; [
          git
          nodejs_22
          postgresql
          pgadmin4-desktopmode
          zsh
          expat
          nodemon
          fontconfig
          freetype
          freetype.dev
          libGL
          pkg-config
          openssl
          xorg.libX11
          xorg.libXcursor
          xorg.libXi
          xorg.libXrandr
          wayland
          libxkbcommon
        ];
      in {
        devShells.default = pkgs.mkShell {
          inherit buildInputs src;
          LD_LIBRARY_PATH =
            builtins.foldl' (a: b: "${a}:${b}/lib") "${pkgs.wayland}/lib" buildInputs;
          PKG_CONFIG_PATH = "${pkgs.openssl.dev}/lib/pkgconfig";
          DATABASE_URL = "postgresql://teste:123@localhost:5433/mydb";
          
          shellHook = ''
            export PGDATA=$PWD/.dev-db
            export PGPORT=5433
            
            if [ ! -d "$PGDATA" ]; then
              echo "Inicializando banco local em $PGDATA"
              initdb -D "$PGDATA" --username=teste --no-locale --encoding=UTF8
              echo "host all all 127.0.0.1/32 trust" >> "$PGDATA/pg_hba.conf"
              echo "host all all ::1/128 trust" >> "$PGDATA/pg_hba.conf"
              echo "local all all trust" >> "$PGDATA/pg_hba.conf"
              echo "listen_addresses = 'localhost'" >> "$PGDATA/postgresql.conf"
              echo "port = $PGPORT" >> "$PGDATA/postgresql.conf"
            fi
            
            echo "Iniciando PostgreSQL local na porta $PGPORT..."
            pg_ctl -D "$PGDATA" -o "-p $PGPORT -k $PGDATA" -l "$PGDATA/logfile" start
            
            # Espera até o servidor estar pronto
            echo "Aguardando PostgreSQL iniciar..."
            until pg_isready -h localhost -p $PGPORT -U teste >/dev/null 2>&1; do
              sleep 0.5
            done
            
            # Cria o banco, se necessário
            if ! psql -h localhost -p $PGPORT -U teste -lqt | cut -d \| -f 1 | grep -qw mydb; then
              echo "Criando banco de dados mydb..."
              createdb -h localhost -p $PGPORT -U teste mydb
            fi
            
            echo "PostgreSQL rodando em postgresql://teste:123@localhost:$PGPORT/mydb"
            echo "Use 'node database/migrate.js' para criar as tabelas"
            echo "Use 'node start.js' para iniciar os serviços"
            echo "Saia do shell (exit) para desligar o banco automaticamente"
            
            # Quando o shell for encerrado, para o banco
            trap 'echo "Parando PostgreSQL..."; pg_ctl -D "$PGDATA" stop -m fast > /dev/null 2>&1' EXIT
            
            ${pkgs.zsh}/bin/zsh
            exit 0
          '';
        };
      }
    );
}
