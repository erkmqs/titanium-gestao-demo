# Publicar pelo celular — GitHub + Vercel

Esta edição não usa banco de dados e não salva cadastros permanentemente.

## 1. Criar o repositório

1. Abra `github.com` no Chrome;
2. Ative **Versão para computador** no menu do navegador;
3. Toque em **+ > New repository**;
4. Nome sugerido: `titanium-gestao-demo`;
5. Marque **Add a README file**;
6. Crie o repositório.

## 2. Abrir um Codespace

1. Dentro do repositório, toque em **Code**;
2. Abra a guia **Codespaces**;
3. Toque em **Create codespace on main**;
4. No editor que abrir, use o menu do Explorer para escolher **Upload...**;
5. Envie o ZIP `titanium-gestao-demo-vercel.zip` sem extrair no celular.

## 3. Descompactar e enviar ao GitHub

Abra o Terminal do Codespace e execute:

```bash
unzip -o titanium-gestao-demo-vercel.zip
rm titanium-gestao-demo-vercel.zip
git add .
git commit -m "MVP demonstrativo Titanium Gestão"
git push
```

Depois, atualize a página do repositório e confirme que aparecem as pastas `app`, `components`, `lib` e o arquivo `package.json`.

## 4. Hospedar na Vercel

1. Abra `vercel.com` e entre com o GitHub;
2. Escolha **Add New > Project**;
3. Importe `titanium-gestao-demo`;
4. Confirme o framework **Next.js**;
5. Não adicione banco nem variáveis de ambiente;
6. Toque em **Deploy**.

A Vercel fornecerá um endereço parecido com:

```text
https://titanium-gestao-demo.vercel.app
```

## 5. Apresentação

Abra no mesmo navegador:

- `/checkin`
- `/painel`
- `/admin`
- `/fila`

PIN da demonstração: `1234`.

Os dados ficam somente na memória das abas abertas. Ao fechar todas as abas, desaparecem.
