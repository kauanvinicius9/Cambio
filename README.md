## Technical Documentation - Cambio

## Overview

Câmbio is a mobile-first web application for simulating currency conversion, focusing on the Brazilian Real and international currencies. The system allows you to calculate the effective cost of foreign currency buying and selling operations by considering not only the real-time commercial quotation, but also practical charges in the Brazilian market: exchange house spread and IOF (Tax on Financial Operations) according to the payment method.

## Objetivos

- **100% Client-Side Execution (JAMStack)**: Static architecture without dependency on proprietary `backend`, ensuring low latency and free hosting by **GitHub Pages**;
- **Cost Transparency**: Detailed breakdown between commercial value, spread increase, taxation and final effective rate;
- **Historical View**: Rendering of variation charts from the last 30 days in native `SVG`, avoiding heavy graphic libraries.

## Stack Tech

| Layer | Tool | Function |
|-------------|-----------------|------------|
| User Interface | Rect + TypeScript | Componentization, typing and state reactivity |
| Build & Bundler | Vite + NodeJS | Fast build, hot-reload and production-optimized packaging |
| Stylization | CSS3 | Monochrome system design with gold accents theme support |
| Exchange Data | API Frankfurter | Obtaining currency catalogs, dailly quotes and historical series |
| CI/CD & Hosting | GitHub Actions + GitHub Pages | Automated build and continuous publishing with every push on the branch |

## Integration

The application uses the **Frankfurter API**, an open service based on reference data published by the **European Central Bank**, without the need for an authentication key.

### Endpoints

1. **Support Currency Catalog**

    - Request: `GET /currencies`;
    - Usage: Population of the currency selector with `ISO 4217` code and desctiptive name, prioritizing currencies with higher liquidity at the top of the list.

2. **Cotações Atuais**

    - Request: `GET /latest?from=BRL`;
    - Normalization: How the API returns the amount in foreign currency `1 BRL` $R_{\text{BRL} \to X}$, the module performs the mathematical inversion to obtain the unit price of the foreign currency in **Reais** $C_{\text{comercial}}$.

    $$
    C_{\text{comercial}} = \frac{1}{R_{\text{BRL} \to X}}
    $$

3. **30-days Historical Series**

    - Request: `GET /{data_inicio}..{data_fim}?from={MOEDA}&to=BRL`;
    - Usage: Feeds the `PriceHistoryChart` (`src/ui/charts.tsx`) component, calculating the minimum, maximum, and trend curve values of the period.

## Exchange Rate Calculation Engine

Financial calculation is performance synchronously and deterministically whenever the user changes any input parameter.

### Input Parameters

- `currency`: ISO code of the foreign currency;
- `amount`: Numeric value provided by the user;
- `direction`: Direction of operation;
    - `foreign_to_brl`: The user tells how much they want to buy in the foreign currency and finds out the total to pay in BRL;
    - `brl_to_foreign`: The user reports how much they have in BRL and finds out how much they will receive in foreign currency;
- `paymentMethod`: Modality that defines the standard IOF rate (`cash_money` = $1,1\%$ for species; `prepaid_card` = $3,5\%$ to card/prepaid);
- `exchangeHouseSpread`: Percentage margin applied by the financial institution on the commercial quotation, initial standard: $2.0\%$;
- `iofPercent`: Percentage of tax levied on the operation.

## Applied Formulas

1. **Quote Spread $C_{\text{spread}}$**:

    $$
    C_{\text{spread}} = C_{\text{comercial}} \times \left(1 + \frac{\text{Spread}}{100}\right)
    $$

2. **Mode 1 - Purchase of Foreign Currency (`foreign_to_brl`)**:

Given a desired amount $M_{\text{est}}$ in foreign currency:

- Base value in Reais: $V_{\text{base}} = M_{\text{est}} \times C_{\text{comercial}}$;
- Spread cost in BRL: $V_{\text{spread}} = M_{\text{est}} \times (C_{\text{spread}} - C_{\text{comercial}})$;
- Taxable subtotal: $V_{\text{sub}} = M_{\text{est}} \times C_{\text{spread}}$;
- IOF value in BRL: $V_{\text{iof}} = V_{\text{sub}} \times \left(\frac{\text{IOF}}{100}\right)$;
- **Total Payable BRL**:

    $$
    V_{\text{total}} = V_{\text{sub}} + V_{\text{iof}}
    $$

- **Total Effective Rate**:

    $$
    C_{\text{effective}} = \frac{V_{\text{total}}}{M_{\text{est}}}
    $$

2. **Mode 2 - Conversion from Reais**:

Given a fixed budget $V_{\text{total}}$ in BRL:

- Total Effective Rate:

    $$
    C_{\text{effective}} = C_{\text{spread}} \times \left(1 + \frac{\text{IOF}}{100}\right)
    $$

- Amount Purchase in Foreign Currency:

    $$
    M_{\text{est}} = \frac{V_{\text{total}}}{C_{\text{effective}}}
    $$

## Design Systems e Graphic Visualization

### Tokens and Themes

The interface uses customs CSS variables applied to the attribute in the root element `data-theme`, with persistence of user preference by `localStorage`:

- **Dark Mode `[data-theme="dark"]`**: Matte black background (`#0C0C0C`), graphite cards (`#161616`) and metallic gold accents (`#D4AF37`);
- **Light Mode `:root`**: Soft gray background (`#F5F5F5`), with cards (`#FFFFFF`) and dark gold accents (`#B88B2A`).

### SVG Graphic

The component maps the vector of historical points `PriceHistoryChart` ${t_i, r_i}$ for normalized coordinates in a responsive `viewBox 420 x 140`:

$$
x_i = \text{pad} + \left(\frac{i}{N - 1}\right) \times (W - 2\cdot \text{pad})
$$

$$
y_i = \text{pad} + \left(1 - \frac{r_i - r_{\min}}{r_{\max} - r_{\min}}\right) \times (H - 2 \cdot \text{pad})
$$

The rendering combines `<polyline`/> for the trendline and `<polygon/>` filled with a linear gradient`<linearGradient/>` for visual highlight.

## Local Environment and Deployment Pipeline

### Prerequisites and Local Execution

- **NodeJS**: v20+;
- **Package manager**: npm.

Install dependences

```powershell
npm install
```

Run development server

```powershell
npm run dev
```

Generating build of production and validating TypeScript typing

```powershell
npm run build
```

### Automation by GitHub Actions

Each `push` on the branch `main`:

1. The Ubuntu runner checks out the code and configures NodeJS 22 width dependecy caching `npm ci`;
2. Executes `npm run build`, generating the optimized static assets in `dist/`;
3. Packages the directory `dist/` by `actions/upload-pages-artifact` and publishes in the environment `github-pages` by `actions/deploy-pages`.

> [!NOTE]
**Note about asset routing**: When hosted in the default GitHub Pages subdirectory `https://<user>.github.io/<repository>/`, the property `base` in file `vite.config.ts` should reflect the exact repository name `base: "/<repository>/"`. In domains configured via DNS record `CNAME`, uses `base: "/"`.