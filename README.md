# GIGA — Edição Vasco da Gama · Landing Page de Produção

Landing page de lançamento da scooter elétrica **GIGA edição especial Vasco da Gama** (CRVG × MotoChefe).
Estática, self-hosted, sem build: funciona em qualquer hospedagem (Hostgator, Vercel, S3, nginx).

## Stack

- HTML único (`index.html`) + `assets/css/style.css` + `assets/js/main.js`
- **GSAP 3.12.5 + ScrollTrigger** (pins, scrubs, reveals) — vendorizado em `assets/vendor/`
- **Lenis 1.1.14** (smooth scroll) e **SplitType 0.3.4** (reveal por linha) — vendorizados
- Fontes self-hosted: VASCO Arquibancada (oficial do clube, só títulos-assinatura), Big Shoulders Display (substituta provisória da Versus, ver `projeto/brand/vascotokens.css`), Barlow Semi Condensed
- Zero dependência de CDN em runtime

## Seções

1. Preloader ("Traçando a rota…", counter, cortina)
2. Hero com vídeo full-screen (`assets/video/giga-reveal.mp4`) + pin scrub
3. Manifesto pinado com reveal palavra-a-palavra (Resposta Histórica como lastro documental)
4. "A Cruz" — símbolo com watermark GIGA em parallax
5. Detalhes — galeria horizontal pinada (5 painéis, barra de progresso; vira stack no mobile)
6. Benefícios — coluna direita sticky com crossfade de imagens de estúdio
7. Vantagens 01–06 (grid editorial)
8. Prova emocional (full-bleed parallax)
9. Galeria com lightbox acessível (teclado, focus trap, contador)
10. Oferta SEM PREÇO + formulário de lista (LGPD, honeypot, validação)
11. CTA final "CASACA!" + footer institucional

Copy: `docs/copy-deck-vasco-giga.md` (Copy Chief, Hopkins 90/100).
Cultura e guarda-rails: `docs/vasco-cultura-dossie.md` — **ler antes de editar qualquer texto.**

## Pendências antes de publicar (bloqueantes — ver copy deck, tabela D)

1. Confirmar enquadramento CONTRAN 996/23 com jurídico (base dos selos "sem CNH / sem emplacamento")
2. Validar redação de licenciamento ("edição especial oficial") com o jurídico
3. Aprovação do layout + lockup CRVG × MotoChefe pelo licenciante (obrigatório, Manual 2024)
4. Confirmar cor/acabamento de série com a MotoChefe
5. **Backend do formulário:** configurar `data-endpoint="https://..."` no `<form id="form">` (index.html). O JS envia POST JSON com o payload `lead`. **Sem endpoint configurado o envio FALHA de propósito** (mensagem de erro + `console.warn`) — nunca finge sucesso.
6. **Domínio final:** trocar `https://giga-vasco.motochefebrasil.com.br` (placeholder marcado com comentário) em `canonical`, `og:url`, `og:image` e `twitter:image` no `<head>`.
7. Especificações (autonomia, recarga, garantia): quando a MotoChefe liberar, a autonomia deve entrar no HERO (recomendação do copy deck).

## Rodar localmente

```bash
cd site_producao
python -m http.server 8000
# http://localhost:8000
```

## Regras de marca aplicadas (não regredir)

- Escudo: PNG alfa oficial, largura mínima 50px, **nunca animado** (Manual 2024 §9)
- Vermelho `#e1251b`: acento (~10% da tela), nunca fundo de hero/seção
- Destaques do manifesto em **branco** (vermelho+preto lê como outro clube — vascotokens §9)
- Cruz de Malta isolada: usada em vermelho (cursor, favicon, selos) — nunca em P&B isolada
- `prefers-reduced-motion`: página 100% funcional sem motion
- Conteúdo visível sem JS (reveals são progressive enhancement)
