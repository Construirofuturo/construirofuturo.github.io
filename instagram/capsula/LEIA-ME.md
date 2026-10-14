# Vídeo-cápsula (Reels, 9:16, 18 s)

Um vídeo por pessoa. O emblema é uma cápsula do tempo: abre com a fotografia de infância, depois com a atual, e à terceira entrega o desejo para o futuro e os objetos.

## Acrescentar uma pessoa

1. Confirme que as duas fotografias estão em `fotos/`: `ID-crianca.jpg` e `ID-atual.jpg` (o ID é o de `conteudo/candidatos.json`).
2. Em `instagram/capsula/pessoas.json`, copie o bloco de uma pessoa e mude:
   - `id`
   - `desejo`: até 16 palavras
   - `objetos`: 2 ou 3, cada um com `nome` (uma palavra) e `icone`
   - `focoCrianca` / `focoAtual` (opcional): ponto focal, ex. `"center 20%"` (mais acima) ou `"30% center"` (mais à esquerda)
3. Nome, cargo e órgão vêm automaticamente de `candidatos.json`.

**Ícones disponíveis:** `leitor`, `cadeiras`, `botas`, `livro`, `estetoscopio`, `cafe`, `mochila`, `planta`, `camara`, `musica`, `bicicleta`, `caneta`, `coracao`. Um ícone que não exista aparece como cubo. Para acrescentar ícones novos, edite a lista `ICONES` em `capsula.html`: grelha de 48, traço 2,6, sem preenchimento.

## Ver e gravar

- Pré-visualizar em tempo real (para gravação de ecrã): abrir `instagram/capsula/capsula.html?id=ID&play=1` através de um servidor (ex.: `python3 -m http.server` na raiz do repositório), numa janela de 1080 × 1920.
- Gerar os MP4 (recomendado, fotograma a fotograma, sem saltos):

```
npm install playwright && npx playwright install chromium
node instagram/capsula/gerar.js                    # todas as pessoas
node instagram/capsula/gerar.js rui-diogo-rodrigues   # só uma
```

Os vídeos ficam em `instagram/capsula/saida/`. É preciso ter o `ffmpeg` instalado.
