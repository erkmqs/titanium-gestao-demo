# Titanium Gestão — demonstração sem armazenamento

MVP de apresentação da **Titanium Barbearia**, preparado para GitHub e Vercel.

## Privacidade desta edição

- Não usa banco de dados;
- Não usa Supabase;
- Não envia cadastros para uma API;
- Não usa `localStorage` nem `sessionStorage`;
- Os dados existem somente na memória das abas abertas;
- Ao fechar todas as abas da demonstração, os dados desaparecem;
- Fotos capturadas também ficam somente na memória temporária da página.

Abas abertas no mesmo navegador trocam atualizações temporárias usando `BroadcastChannel`. Isso permite demonstrar check-in, painel da TV e administração no mesmo celular sem gravar os dados.

> Em aparelhos diferentes, cada aparelho terá uma demonstração independente. Esta versão não foi feita para operação real da barbearia.

## Telas

| Tela | Endereço |
|---|---|
| Início | `/` |
| Check-in | `/checkin` |
| Painel da TV | `/painel` |
| Fila pública | `/fila` |
| Administração | `/admin` |

PIN administrativo padrão: `1234`.

## Publicação na Vercel

O projeto não exige banco nem variáveis de ambiente.

1. Envie os arquivos para um repositório do GitHub;
2. Na Vercel, escolha **Add New > Project**;
3. Importe o repositório;
4. Confirme o preset **Next.js**;
5. Clique em **Deploy**.

Opcionalmente, crie na Vercel a variável:

```text
NEXT_PUBLIC_DEMO_ADMIN_PIN=1234
```

## Teste local

```bash
npm install
npm run dev
```

## Validação

```bash
npm run lint
npm run build
```

## Tecnologias

- Next.js;
- React;
- TypeScript;
- BroadcastChannel para sincronização temporária entre abas;
- QR Code Pix exclusivamente demonstrativo.
