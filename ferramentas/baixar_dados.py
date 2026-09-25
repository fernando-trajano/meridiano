#!/usr/bin/env python3
"""
baixar_dados.py — baixa, UMA vez, os dados reais do Banco Mundial.

Roda na máquina do Fernando, não no site. O site nunca chama a API do Banco
Mundial: ele lê os CSVs que este script deixa em dados/base/mundo/.

Fonte: World Bank, World Development Indicators (WDI), licença CC BY 4.0.
API: https://api.worldbank.org/v2/ (sem chave, sem cadastro).

O que sai (tudo em inglês, UTF-8, vírgula como separador, ponto decimal,
campo vazio = NULL):

    dados/base/mundo/regions.csv           as 7 regiões
    dados/base/mundo/countries.csv         217 economias + 17 agregados
    dados/base/mundo/indicators.csv        os 12 indicadores
    dados/base/mundo/country_year.csv      país × ano, 2000 a 2023, formato largo
    dados/base/mundo/indicator_values.csv  os mesmos dados em formato longo,
                                           só com os valores que existem
    dados/base/mundo/COLETA.md             data da coleta, códigos, contagens

Os agregados (World, Euro area…) entram DE PROPÓSITO: são a armadilha do
curso. Eles não têm região, e quem esquece de filtrá-los acha que o
"país" mais populoso do mundo é o World.

Números: população e PIB como inteiros; o resto com 2 casas (a mesma
precisão da conferência das missões). Arredondamento "meio para cima".

Como usar:

    python3 ferramentas/baixar_dados.py            # usa o cache, se houver
    python3 ferramentas/baixar_dados.py --de-novo  # ignora o cache e baixa tudo

As respostas brutas da API ficam em ferramentas/cache/ (fora do Git), para
refazer os CSVs sem baixar de novo.

Plano B, se a API estiver fora do ar: baixar os mesmos indicadores pelo
DataBank (databank.worldbank.org), em CSV, e adaptar a leitura.

Só biblioteca padrão; testado no Python 3.9.
"""

import csv
import json
import sys
import time
import urllib.request
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA_SAIDA = RAIZ / "dados" / "base" / "mundo"
PASTA_CACHE = Path(__file__).resolve().parent / "cache"

API = "https://api.worldbank.org/v2"
ANO_INICIAL = 2000
ANO_FINAL = 2023

# Os 12 indicadores aprovados no passo 4, na ordem das colunas de
# country_year: (código do Banco Mundial, nome da coluna, unidade, tema,
# casas decimais).
INDICADORES = [
    ("SP.POP.TOTL", "population", "people", "society", 0),
    ("NY.GDP.MKTP.CD", "gdp_usd", "current US$", "economy", 0),
    ("NY.GDP.PCAP.CD", "gdp_per_capita", "current US$ per person", "economy", 2),
    ("SP.DYN.LE00.IN", "life_expectancy", "years", "health", 2),
    ("EN.GHG.CO2.PC.CE.AR5", "co2_per_capita", "tonnes of CO2 per person", "climate", 2),
    ("EG.FEC.RNEW.ZS", "renewable_pct", "% of final energy consumption", "energy", 2),
    ("IT.NET.USER.ZS", "internet_pct", "% of population", "society", 2),
    ("SI.POV.GINI", "gini", "index from 0 to 100", "inequality", 2),
    ("SP.URB.TOTL.IN.ZS", "urban_pct", "% of population", "society", 2),
    ("EG.ELC.ACCS.ZS", "electricity_pct", "% of population", "energy", 2),
    ("SH.DYN.MORT", "under5_mortality", "deaths per 1,000 live births", "health", 2),
    ("SH.XPD.CHEX.GD.ZS", "health_spend_pct", "% of GDP", "health", 2),
]

# Os 17 agregados que entram (aprovados no passo 4). Os outros 61 da API —
# nomes técnicos como "IDA blend" — ficam de fora.
AGREGADOS = [
    "WLD",                                            # o mundo
    "EAS", "ECS", "LCN", "MEA", "NAC", "SAS", "SSF",  # as 7 regiões
    "LIC", "LMC", "UMC", "HIC",                       # os 4 grupos de renda
    "EMU", "EUU", "OED", "ARB", "LDC",                # blocos conhecidos
]


# --------------------------------------------------------------------------
# Conversa com a API
# --------------------------------------------------------------------------

def baixar_json(url):
    """Baixa uma URL da API e devolve o JSON. Tenta de novo se falhar."""
    for tentativa in range(1, 4):
        try:
            with urllib.request.urlopen(url, timeout=120) as resposta:
                return json.load(resposta)
        except Exception as erro:  # rede instável: espera e tenta de novo
            if tentativa == 3:
                raise
            print(f"  falhou ({erro}); tentando de novo…")
            time.sleep(3 * tentativa)


def baixar_paginas(caminho, nome_cache, de_novo):
    """
    Baixa todas as páginas de uma consulta da API e guarda no cache.
    Devolve (cabeçalho da primeira página, lista de registros).
    """
    arquivo_cache = PASTA_CACHE / f"{nome_cache}.json"
    if arquivo_cache.exists() and not de_novo:
        guardado = json.loads(arquivo_cache.read_text(encoding="utf-8"))
        return guardado["cabecalho"], guardado["registros"]

    registros = []
    pagina = 1
    while True:
        separador = "&" if "?" in caminho else "?"
        url = f"{API}/{caminho}{separador}format=json&per_page=20000&page={pagina}"
        print(f"  baixando {url}")
        resposta = baixar_json(url)
        if len(resposta) < 2 or resposta[1] is None:
            raise RuntimeError(f"A API não devolveu dados para {caminho}: {resposta}")
        cabecalho = resposta[0] if pagina == 1 else cabecalho
        registros.extend(resposta[1])
        if pagina >= int(resposta[0]["pages"]):
            break
        pagina += 1

    PASTA_CACHE.mkdir(exist_ok=True)
    arquivo_cache.write_text(
        json.dumps({"cabecalho": cabecalho, "registros": registros}, ensure_ascii=False),
        encoding="utf-8",
    )
    return cabecalho, registros


# --------------------------------------------------------------------------
# Formatação
# --------------------------------------------------------------------------

def arredondar(valor, casas):
    """Arredonda "meio para cima" (o round() do Python arredonda para o par)."""
    if valor is None:
        return ""
    quantum = Decimal(1) if casas == 0 else Decimal(1).scaleb(-casas)
    numero = Decimal(str(valor)).quantize(quantum, rounding=ROUND_HALF_UP)
    return str(int(numero)) if casas == 0 else f"{numero:.{casas}f}"


def limpar(texto):
    """Tira espaços sobrando — a API devolve "Sub-Saharan Africa " com espaço."""
    return (texto or "").strip()


def gravar_csv(nome, colunas, linhas):
    caminho = PASTA_SAIDA / nome
    with caminho.open("w", encoding="utf-8", newline="") as arquivo:
        escritor = csv.writer(arquivo, lineterminator="\n")
        escritor.writerow(colunas)
        escritor.writerows(linhas)
    print(f"  {nome}: {len(linhas)} linhas")
    return len(linhas)


# --------------------------------------------------------------------------
# O trabalho
# --------------------------------------------------------------------------

def main():
    de_novo = "--de-novo" in sys.argv
    PASTA_SAIDA.mkdir(parents=True, exist_ok=True)

    # --- Países e regiões --------------------------------------------------
    print("Países e regiões")
    _, lista = baixar_paginas("country", "paises", de_novo)

    economias = [p for p in lista if p["region"]["id"] != "NA"]
    por_codigo = {p["id"]: p for p in lista}

    faltando = [codigo for codigo in AGREGADOS if codigo not in por_codigo]
    if faltando:
        raise RuntimeError(f"Agregados que a API não tem mais: {faltando}")

    regioes = {}
    for pais in economias:
        regioes[pais["region"]["id"]] = limpar(pais["region"]["value"])
    if len(regioes) != 7:
        raise RuntimeError(f"Esperava 7 regiões, vieram {len(regioes)}: {regioes}")

    contagem = {}
    contagem["regions"] = gravar_csv(
        "regions.csv",
        ["region_code", "region_name"],
        sorted(regioes.items()),
    )

    linhas_paises = []
    for pais in sorted(economias, key=lambda p: p["id"]):
        linhas_paises.append([
            pais["id"],
            limpar(pais["name"]),
            pais["region"]["id"],
            limpar(pais["incomeLevel"]["value"]),
            limpar(pais["capitalCity"]),
            limpar(pais["latitude"]),
            limpar(pais["longitude"]),
        ])
    # Agregados: sem região, sem grupo de renda, sem capital, sem coordenadas.
    for codigo in AGREGADOS:
        linhas_paises.append([codigo, limpar(por_codigo[codigo]["name"]), "", "", "", "", ""])
    linhas_paises.sort(key=lambda linha: linha[0])

    contagem["countries"] = gravar_csv(
        "countries.csv",
        ["country_code", "country_name", "region_code", "income_group",
         "capital_city", "latitude", "longitude"],
        linhas_paises,
    )
    codigos_paises = [linha[0] for linha in linhas_paises]
    conjunto_paises = set(codigos_paises)

    # Nos DADOS dos indicadores, a API deixa o código de 3 letras vazio para
    # alguns agregados (os grupos de renda: High income vem só como "XD") e
    # põe o de 2 letras em country.id. Esta ponte 2 → 3 letras recupera esses
    # registros — sem ela, HIC, LIC, LMC e UMC ficavam inteiros vazios
    # (achado no passo 10).
    tres_letras = {limpar(p.get("iso2Code")): p["id"] for p in lista if p.get("iso2Code")}

    def codigo_do_registro(registro):
        return registro["countryiso3code"] or tres_letras.get(registro["country"]["id"], "")

    # --- Indicadores ------------------------------------------------------
    print("Indicadores")
    valores = {}          # (país, ano, coluna) -> texto já arredondado
    linhas_indicadores = []
    atualizacoes = {}
    for codigo, coluna, unidade, tema, casas in INDICADORES:
        _, meta = baixar_paginas(f"indicator/{codigo}", f"meta-{codigo}", de_novo)
        cabecalho, dados = baixar_paginas(
            f"country/all/indicator/{codigo}?date={ANO_INICIAL}:{ANO_FINAL}",
            f"dados-{codigo}",
            de_novo,
        )
        atualizacoes[codigo] = cabecalho.get("lastupdated", "")
        linhas_indicadores.append([codigo, coluna, limpar(meta[0]["name"]), unidade, tema])

        for registro in dados:
            pais = codigo_do_registro(registro)
            if pais not in conjunto_paises or registro["value"] is None:
                continue
            valores[(pais, int(registro["date"]), coluna)] = arredondar(registro["value"], casas)

    contagem["indicators"] = gravar_csv(
        "indicators.csv",
        ["indicator_code", "column_name", "indicator_name", "unit", "topic"],
        linhas_indicadores,
    )

    # --- country_year: formato largo, a grade inteira (país × ano) ---------
    colunas_indicadores = [coluna for _, coluna, _, _, _ in INDICADORES]
    linhas_largas = []
    for pais in codigos_paises:
        for ano in range(ANO_INICIAL, ANO_FINAL + 1):
            linhas_largas.append(
                [pais, ano] + [valores.get((pais, ano, coluna), "") for coluna in colunas_indicadores]
            )
    contagem["country_year"] = gravar_csv(
        "country_year.csv",
        ["country_code", "year"] + colunas_indicadores,
        linhas_largas,
    )

    # --- indicator_values: formato longo, só o que existe -----------------
    linhas_longas = []
    for pais in codigos_paises:
        for codigo, coluna, _, _, _ in INDICADORES:
            for ano in range(ANO_INICIAL, ANO_FINAL + 1):
                valor = valores.get((pais, ano, coluna))
                if valor is not None:
                    linhas_longas.append([pais, codigo, ano, valor])
    contagem["indicator_values"] = gravar_csv(
        "indicator_values.csv",
        ["country_code", "indicator_code", "year", "value"],
        linhas_longas,
    )

    # --- COLETA.md: de onde veio, quando, quanto --------------------------
    escrever_coleta(contagem, atualizacoes, len(economias))
    print("Pronto.")


def escrever_coleta(contagem, atualizacoes, total_economias):
    hoje = date.today().isoformat()
    linhas = [
        "# Coleta dos dados do mundo",
        "",
        "Gerado por `ferramentas/baixar_dados.py`. Não editar à mão.",
        "",
        f"- **Data da coleta:** {hoje}",
        "- **Fonte:** World Bank, *World Development Indicators* (WDI) —",
        "  https://datacatalog.worldbank.org/search/dataset/0037712/World-Development-Indicators",
        f"- **API:** {API}/",
        "- **Licença:** Creative Commons Attribution 4.0 (CC BY 4.0) —",
        "  https://creativecommons.org/licenses/by/4.0/",
        f"- **Anos:** {ANO_INICIAL} a {ANO_FINAL}",
        f"- **Países:** {total_economias} economias + {len(AGREGADOS)} agregados "
        f"({', '.join(AGREGADOS)})",
        "- **Números:** população e PIB inteiros; o resto com 2 casas, arredondado",
        "  meio para cima.",
        "",
        "## Indicadores",
        "",
        "| Código | Coluna | Última atualização na API |",
        "|---|---|---|",
    ]
    for codigo, coluna, _, _, _ in INDICADORES:
        linhas.append(f"| `{codigo}` | `{coluna}` | {atualizacoes.get(codigo, '')} |")
    linhas += [
        "",
        "## Linhas por arquivo",
        "",
        "| Arquivo | Linhas |",
        "|---|---|",
    ]
    for tabela, total in contagem.items():
        linhas.append(f"| `{tabela}.csv` | {total} |")
    linhas.append("")
    (PASTA_SAIDA / "COLETA.md").write_text("\n".join(linhas), encoding="utf-8")
    print("  COLETA.md")


if __name__ == "__main__":
    main()
