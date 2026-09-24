# Coleta dos dados do mundo

Gerado por `ferramentas/baixar_dados.py`. Não editar à mão.

- **Data da coleta:** 2026-09-24
- **Fonte:** World Bank, *World Development Indicators* (WDI) —
  https://datacatalog.worldbank.org/search/dataset/0037712/World-Development-Indicators
- **API:** https://api.worldbank.org/v2/
- **Licença:** Creative Commons Attribution 4.0 (CC BY 4.0) —
  https://creativecommons.org/licenses/by/4.0/
- **Anos:** 2000 a 2023
- **Países:** 217 economias + 17 agregados (WLD, EAS, ECS, LCN, MEA, NAC, SAS, SSF, LIC, LMC, UMC, HIC, EMU, EUU, OED, ARB, LDC)
- **Números:** população e PIB inteiros; o resto com 2 casas, arredondado
  meio para cima.

## Indicadores

| Código | Coluna | Última atualização na API |
|---|---|---|
| `SP.POP.TOTL` | `population` | 2026-07-13 |
| `NY.GDP.MKTP.CD` | `gdp_usd` | 2026-07-13 |
| `NY.GDP.PCAP.CD` | `gdp_per_capita` | 2026-07-13 |
| `SP.DYN.LE00.IN` | `life_expectancy` | 2026-07-13 |
| `EN.GHG.CO2.PC.CE.AR5` | `co2_per_capita` | 2026-07-13 |
| `EG.FEC.RNEW.ZS` | `renewable_pct` | 2026-07-13 |
| `IT.NET.USER.ZS` | `internet_pct` | 2026-07-13 |
| `SI.POV.GINI` | `gini` | 2026-07-13 |
| `SP.URB.TOTL.IN.ZS` | `urban_pct` | 2026-07-13 |
| `EG.ELC.ACCS.ZS` | `electricity_pct` | 2026-07-13 |
| `SH.DYN.MORT` | `under5_mortality` | 2026-07-13 |
| `SH.XPD.CHEX.GD.ZS` | `health_spend_pct` | 2026-07-13 |

## Linhas por arquivo

| Arquivo | Linhas |
|---|---|
| `regions.csv` | 7 |
| `countries.csv` | 234 |
| `indicators.csv` | 12 |
| `country_year.csv` | 5616 |
| `indicator_values.csv` | 59454 |
