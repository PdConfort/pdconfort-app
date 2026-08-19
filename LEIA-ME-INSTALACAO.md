# PD Confort — Gerador de Orçamentos (app instalável + backup no Google Drive)

Este pacote transforma o teu ficheiro original numa app que:

- Funciona no **Windows** e no **Android** (instala-se como uma app normal, com o ícone PD Confort).
- Funciona **offline** (os dados ficam sempre guardados no dispositivo).
- Pode ligar-se à tua **conta Google** e guardar automaticamente uma cópia de segurança completa de todos os dados na tua **Google Drive**.

Também corrigi um problema importante do ficheiro original: ele tentava guardar os dados através de `window.storage`, uma função que só existe dentro do preview do Claude — fora daí, **nada ficava guardado** (equipamentos, materiais, clientes e histórico perdiam-se sempre que a página fosse recarregada). Isso está corrigido: agora os dados ficam guardados no dispositivo de forma fiável.

## O que está nesta pasta

```
index.html                 → a app (tudo incluído: preços, equipamentos, geração de orçamentos)
manifest.json               → ficha da app (nome, ícone) usada para a instalar
service-worker.js           → permite a app funcionar offline
icons/                       → ícones da app, gerados a partir do teu logótipo
LEIA-ME-INSTALACAO.md       → este ficheiro
```

**Importante:** por causa de como funciona o login do Google, a app não pode fazer login diretamente quando aberta como ficheiro local (`file://`) ou diretamente de dentro da pasta do Google Drive — os navegadores só permitem o login do Google em endereços da internet (https). Por isso, o Passo 1 abaixo coloca a app "no ar" gratuitamente (GitHub Pages), com um endereço fixo. É esse endereço que vais abrir no telemóvel/computador e instalar como app — os dados continuam a ficar automaticamente guardados na tua Google Drive.

Se preferires não fazer este passo, a app funciona à mesma na perfeição em modo local/offline (basta abrir o `index.html`), só sem o login automático do Google — nesse caso usa os botões "Transferir cópia completa (.json)" / "Importar cópia (.json)" no separador **Sincronização** para guardares manualmente ficheiros de backup dentro da tua pasta do Google Drive.

---

## Passo 1 — Colocar a app online (GitHub Pages, gratuito)

1. Cria uma conta gratuita em [github.com](https://github.com/signup) (se ainda não tiveres uma).
2. Clica em **New repository** (Novo repositório). Dá-lhe o nome `pdconfort-app` e marca como **Public**. Cria o repositório.
3. Dentro do repositório, clica em **Add file → Upload files**, e arrasta para lá **todos os ficheiros e pastas** desta pasta (`index.html`, `manifest.json`, `service-worker.js`, e a pasta `icons` completa). Clica em **Commit changes**.
4. Vai a **Settings → Pages** (barra lateral esquerda).
5. Em "Build and deployment", escolhe **Deploy from a branch**, ramo `main`, pasta `/ (root)`. Grava.
6. Ao fim de 1–2 minutos, o GitHub mostra o endereço da tua app, algo como:
   `https://o-teu-utilizador.github.io/pdconfort-app/`

Guarda este endereço — vais precisar dele no passo seguinte e é o que vais abrir/instalar no telemóvel e computador.

---

## Passo 2 — Criar as credenciais do Google (Client ID)

1. Vai a [console.cloud.google.com](https://console.cloud.google.com/) e inicia sessão com a conta Google que a empresa quer usar para os backups (pode ser a conta Gmail/Google Workspace da PD Confort).
2. Cria um novo projeto (canto superior esquerdo → "New Project"), por exemplo `PD Confort App`.
3. No menu, vai a **APIs & Services → Library**, procura por **Google Drive API** e clica em **Enable**.
4. Vai a **APIs & Services → OAuth consent screen**.
   - Tipo de utilizador: **External**.
   - Nome da app: `PD Confort — Gerador de Orçamentos`.
   - Email de suporte e email de contacto do developer: o teu email.
   - Guarda e avança pelos ecrãs seguintes (não precisas de adicionar scopes sensíveis nem de submeter para verificação, porque a app só usa o scope `drive.file`, que é considerado não-sensível).
   - Em **Test users**, adiciona o(s) email(s) Google que vão usar a app (por exemplo o teu e o da tua equipa). Enquanto o ecrã de consentimento estiver em modo "Testing", só estes emails conseguem fazer login.
5. Vai a **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Nome: `PD Confort App`.
   - Em **Authorized JavaScript origins**, adiciona o endereço do Passo 1 **sem barra final**, por exemplo:
     `https://o-teu-utilizador.github.io`
   - Clica em **Create**.
6. Copia o **Client ID** gerado (algo como `123456789-abc...apps.googleusercontent.com`).

---

## Passo 3 — Colocar o Client ID na app

1. Abre o ficheiro `index.html` num editor de texto (ou diretamente no GitHub, clicando no ficheiro → ícone de lápis para editar).
2. Procura por:
   ```
   const GOOGLE_CLIENT_ID = 'SUBSTITUIR_PELO_TEU_CLIENT_ID.apps.googleusercontent.com';
   ```
3. Substitui pelo Client ID copiado no Passo 2, por exemplo:
   ```
   const GOOGLE_CLIENT_ID = '123456789-abc...apps.googleusercontent.com';
   ```
4. Grava e volta a enviar o ficheiro para o GitHub (se editaste localmente: **Add file → Upload files** novamente, substitui o `index.html`; se editaste diretamente no GitHub, basta clicar em **Commit changes**).

Ao fim de alguns segundos, abre o endereço da app e vai ao separador **Sincronização** — o aviso amarelo desaparece e aparece o botão **Ligar ao Google Drive**.

---

## Passo 4 — Instalar a app

### Windows (Chrome ou Edge)
1. Abre o endereço da app (`https://o-teu-utilizador.github.io/pdconfort-app/`).
2. Clica no ícone de instalação na barra de endereço (ou menu ⋮ → **Instalar aplicação / Instalar PD Confort**).
3. Fica com um ícone (o logótipo PD Confort) no ambiente de trabalho e no menu Iniciar, e abre numa janela própria, sem barra de navegador.

### Android (Chrome)
1. Abre o mesmo endereço no Chrome do telemóvel.
2. Toca no menu ⋮ → **Adicionar ao ecrã principal / Instalar app**.
3. Fica com o ícone da PD Confort no ecrã principal, como uma app normal.

---

## Passo 5 — Usar o backup do Google Drive

No separador **Sincronização**:
- **Ligar ao Google Drive** — pede autorização (só uma vez) e a partir daí guarda automaticamente um ficheiro `pdconfort-backup.json` na tua Google Drive, poucos segundos depois de qualqures alteração (novo cliente, orçamento, preço, etc.).
- **Fazer backup agora** — força uma sincronização imediata.
- **Restaurar do Google Drive** — traz para este dispositivo os dados guardados na Drive (por exemplo, ao abrir a app pela primeira vez noutro computador ou telemóvel).
- **Terminar sessão** — desliga a conta Google deste dispositivo (os dados continuam guardados localmente).

Também podes, em qualquer altura, usar **Transferir cópia completa (.json)** para guardar manualmente um ficheiro de backup (por exemplo dentro da pasta do Google Drive sincronizada no teu PC), e **Importar cópia (.json)** para o restaurar depois.

---

## Notas finais

- Podes também guardar uma cópia desta pasta inteira dentro da tua Google Drive, como arquivo/histórico de versões do código — mas quem "corre" mesmo é o endereço do Passo 1, instalado como app.
- Os dados introduzidos (preços, clientes, histórico de orçamentos) ficam sempre gravados no dispositivo onde estás a trabalhar; o Google Drive serve como cópia de segurança e forma de levar os dados de um dispositivo para outro.
- Se mais tarde quiseres publicar a app para toda a gente (sem limite de "test users"), no ecrã de consentimento OAuth da Google Cloud Console clica em **Publish App** — como só usamos o scope `drive.file`, não é necessário passar por verificação da Google.
