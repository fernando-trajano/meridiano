#!/usr/bin/env python3
"""
gerar_instituto.py — gera os dados INVENTADOS do Observatório Meridiano.

Roda na máquina do Fernando, não no site, DEPOIS do baixar_dados.py: ele lê
os dados reais de dados/base/mundo/ para que o instituto faça sentido com o
mundo (projetos de energia em países com pouco acesso à eletricidade, de
saúde onde a mortalidade infantil é alta, e assim por diante).

Semente fixa: rodar de novo, com os mesmos dados do mundo, gera exatamente os
mesmos arquivos.

O que sai (em inglês, UTF-8, vírgula, ponto decimal, datas AAAA-MM-DD,
campo vazio = NULL), em dados/base/instituto/:

    staff.csv          60 pessoas, com gestor (os 7 personagens incluídos)
    projects.csv       80 projetos, alguns ainda sem data de fim
    disbursements.csv  1.500 pagamentos, com 20 lançados em dobro
    field_trips.csv    400 viagens (40 sem projeto: conferências)
    publications.csv   150 publicações (algumas sem projeto)
    authorships.csv    300 autorias — a ponte muitos-para-muitos

As "armadilhas" que as missões vão usar, todas de propósito:
    - projetos sem data de fim (IS NULL, COALESCE);
    - pagamentos em dobro, iguais em tudo menos o id (DISTINCT, GROUP BY);
    - viagens e publicações sem projeto (LEFT JOIN);
    - gente que nunca viajou nem publicou (LEFT JOIN, NOT EXISTS);
    - a hierarquia de gestores com até quatro níveis (self join, WITH RECURSIVE);
    - a nacionalidade da equipe numa coluna de nome diferente de
      country_code (JOIN ... ON com nomes diferentes).

Regras de coerência: ninguém lidera projeto, viaja ou publica antes de ser
contratado; nenhum pagamento ou viagem fica fora das datas do projeto; nada
passa de 31/12/2024, o "hoje" do instituto.

Só biblioteca padrão; testado no Python 3.9.
"""

import csv
import random
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PASTA_MUNDO = RAIZ / "dados" / "base" / "mundo"
PASTA_SAIDA = RAIZ / "dados" / "base" / "instituto"

# O dia em que a base nasceu. Trocar a semente troca o instituto inteiro.
SEMENTE = 20260924
HOJE = date(2024, 12, 31)   # o "hoje" dentro da história

acaso = random.Random(SEMENTE)


# --------------------------------------------------------------------------
# Leitura do mundo
# --------------------------------------------------------------------------

def ler_csv(caminho):
    with caminho.open(encoding="utf-8", newline="") as arquivo:
        return list(csv.DictReader(arquivo))


paises = {linha["country_code"]: linha for linha in ler_csv(PASTA_MUNDO / "countries.csv")}
economias = [codigo for codigo, linha in paises.items() if linha["region_code"]]

# indicador[(país, ano)] = linha de country_year
pais_ano = {
    (linha["country_code"], int(linha["year"])): linha
    for linha in ler_csv(PASTA_MUNDO / "country_year.csv")
}


def ultimo_valor(pais, coluna, ate_ano):
    """O valor mais recente de um indicador até um ano (ou None)."""
    for ano in range(ate_ano, 1999, -1):
        texto = pais_ano.get((pais, ano), {}).get(coluna, "")
        if texto != "":
            return float(texto)
    return None


# --------------------------------------------------------------------------
# Ajudantes de data e dinheiro
# --------------------------------------------------------------------------

def data_entre(inicio, fim):
    """Um dia qualquer entre duas datas, inclusive."""
    return inicio + timedelta(days=acaso.randint(0, (fim - inicio).days))


def somar_meses(dia, meses):
    ano = dia.year + (dia.month - 1 + meses) // 12
    mes = (dia.month - 1 + meses) % 12 + 1
    return date(ano, mes, 1)


def arredondar_a(valor, passo):
    return int(round(valor / passo) * passo)


def centavos(valor):
    return f"{valor:.2f}"


def gravar_csv(nome, colunas, linhas):
    PASTA_SAIDA.mkdir(parents=True, exist_ok=True)
    with (PASTA_SAIDA / nome).open("w", encoding="utf-8", newline="") as arquivo:
        escritor = csv.writer(arquivo, lineterminator="\n")
        escritor.writerow(colunas)
        escritor.writerows(linhas)
    print(f"  {nome}: {len(linhas)} linhas")


def texto_ou_vazio(valor):
    return "" if valor is None else valor


# --------------------------------------------------------------------------
# 1. Equipe (staff)
# --------------------------------------------------------------------------

DEPARTAMENTOS = [
    "Director's Office", "Research", "Economics", "Climate & Energy",
    "Partnerships", "Cooperation Projects", "Data Engineering",
]

# Os 7 personagens: (nome, cargo, departamento, nacionalidade, admissão, salário)
PERSONAGENS = [
    ("Nadia Haddad", "Director-General", "Director's Office", "LBN", date(2011, 3, 1), 248000),
    ("Ingrid Solberg", "Research Coordinator", "Research", "NOR", date(2012, 9, 3), 186500),
    ("Kofi Mensah", "Lead Economist", "Economics", "GHA", date(2013, 1, 7), 182000),
    ("Lucía Ferreyra", "Climate and Energy Lead", "Climate & Energy", "ARG", date(2014, 5, 5), 179500),
    ("Amélie Laurent", "Head of Institutional Relations", "Partnerships", "FRA", date(2012, 2, 1), 176000),
    ("Tomasz Nowak", "Head of Cooperation Projects", "Cooperation Projects", "POL", date(2013, 10, 1), 177500),
    ("Hiroshi Tanaka", "Lead Data Engineer", "Data Engineering", "JPN", date(2015, 4, 1), 181000),
]

# O resto da equipe, por departamento: (cargo, quantos, nível). Nível 2 =
# sênior (responde ao chefe do departamento); 3 = pleno; 4 = assistente
# (responde a um sênior, quando há — é o que dá à hierarquia quatro níveis).
QUADRO = {
    "Director's Office": [("Chief of Staff", 1, 2), ("Communications Officer", 1, 3),
                          ("Executive Assistant", 1, 4)],
    "Research": [("Senior Research Analyst", 2, 2), ("Research Analyst", 7, 3),
                 ("Research Assistant", 3, 4)],
    "Economics": [("Senior Economist", 2, 2), ("Economist", 4, 3),
                  ("Research Assistant", 3, 4)],
    "Climate & Energy": [("Senior Climate Analyst", 1, 2), ("Senior Energy Analyst", 1, 2),
                         ("Climate Analyst", 4, 3), ("Energy Analyst", 4, 3)],
    "Partnerships": [("Senior Partnerships Officer", 1, 2), ("Partnerships Officer", 3, 3),
                     ("Events Coordinator", 2, 4)],
    "Cooperation Projects": [("Senior Project Manager", 2, 2), ("Project Officer", 5, 3),
                             ("Project Assistant", 2, 4)],
    "Data Engineering": [("Senior Data Engineer", 1, 2), ("Data Engineer", 2, 3),
                         ("Data Analyst", 1, 3)],
}

# Salário anual em francos suíços, por nível (mínimo, máximo).
SALARIOS = {2: (132000, 152000), 3: (96000, 124000), 4: (68000, 86000)}

# Nomes inventados, agrupados para que nome, sobrenome e nacionalidade
# combinem. Nenhum é de pessoa conhecida.
GRUPOS_DE_NOMES = [
    (["NOR", "SWE", "DNK", "FIN"], ["Astrid", "Erik", "Sigrid", "Lars", "Maja", "Henrik"],
     ["Lindqvist", "Berg", "Haugen", "Nieminen", "Dahl"]),
    (["GHA", "NGA", "SEN", "CIV"], ["Ama", "Kwame", "Chiamaka", "Tunde", "Aminata", "Moussa"],
     ["Owusu", "Adeyemi", "Diallo", "Okafor", "Ndiaye"]),
    (["KEN", "TZA", "ETH", "UGA", "RWA"], ["Wanjiru", "Baraka", "Selam", "Tesfaye", "Neema"],
     ["Mwangi", "Otieno", "Bekele", "Kamau", "Uwase"]),
    (["ARG", "BRA", "MEX", "COL", "CHL", "PER"],
     ["Mariana", "Joaquín", "Camila", "Thiago", "Valentina", "Rafael"],
     ["Silva", "Oliveira", "Gómez", "Ramírez", "Castro", "Pereira"]),
    (["FRA", "DEU", "ITA", "ESP", "NLD", "BEL", "CHE", "PRT"],
     ["Claire", "Matteo", "Sophie", "Jonas", "Inès", "Lukas"],
     ["Moreau", "Fischer", "Rossi", "Janssen", "Keller", "Costa"]),
    (["ROU", "HRV", "UKR", "SRB"], ["Ioana", "Pavel", "Olena", "Marek", "Ana"],
     ["Popescu", "Horvat", "Kovalenko", "Stoica"]),
    (["IND", "BGD", "NPL", "LKA"], ["Priya", "Arjun", "Farhana", "Rohan", "Anjali"],
     ["Sharma", "Rahman", "Perera", "Iyer", "Thapa"]),
    (["JPN", "KOR", "CHN", "VNM"], ["Yuki", "Min-jun", "Mei", "Linh", "Takumi", "Seo-yeon"],
     ["Sato", "Kim", "Chen", "Nguyen", "Park", "Wang"]),
    (["LBN", "JOR", "MAR", "TUN", "TUR"], ["Layla", "Omar", "Yasmine", "Karim", "Salma", "Emre"],
     ["Mansour", "Benali", "Aziz", "Khoury", "Yilmaz"]),
    (["USA", "CAN", "AUS", "NZL", "GBR", "IRL"], ["Emily", "Daniel", "Hannah", "Liam", "Grace"],
     ["Walker", "Thompson", "Clarke", "Mitchell", "Bennett"]),
    (["IDN", "PHL", "THA", "MYS"], ["Siti", "Arif", "Maria", "Dewi", "Rizal"],
     ["Santos", "Wijaya", "Reyes", "Halim"]),
]


def gerar_equipe():
    equipe = []   # dicionários, na ordem do id
    usados = {nome for nome, *_ in PERSONAGENS}

    # Os personagens primeiro: Nadia é a 1, sem gestor; os outros seis
    # respondem a ela e chefiam um departamento cada.
    for posicao, (nome, cargo, depto, nac, admissao, salario) in enumerate(PERSONAGENS, start=1):
        equipe.append({
            "id": posicao, "nome": nome, "cargo": cargo, "depto": depto,
            "gestor": None if posicao == 1 else 1, "nac": nac,
            "admissao": admissao, "salario": salario, "nivel": 0 if posicao == 1 else 1,
        })
    chefe_do_depto = {pessoa["depto"]: pessoa["id"] for pessoa in equipe}

    def nome_novo():
        while True:
            nacs, primeiros, sobrenomes = acaso.choice(GRUPOS_DE_NOMES)
            nome = f"{acaso.choice(primeiros)} {acaso.choice(sobrenomes)}"
            if nome not in usados:
                usados.add(nome)
                return nome, acaso.choice(nacs)

    for depto in DEPARTAMENTOS:
        seniores = []
        for cargo, quantos, nivel in QUADRO[depto]:
            for _ in range(quantos):
                nome, nac = nome_novo()
                # Quanto mais sênior, mais cedo tende a ter entrado.
                inicio = {2: date(2012, 1, 1), 3: date(2013, 1, 1), 4: date(2016, 1, 1)}[nivel]
                admissao = data_entre(inicio, date(2024, 6, 30))
                if nivel == 2:
                    gestor = chefe_do_depto[depto]
                elif nivel == 4 and seniores:
                    gestor = acaso.choice(seniores)
                else:
                    gestor = acaso.choice(seniores) if seniores and acaso.random() < 0.4 else chefe_do_depto[depto]
                pessoa = {
                    "id": len(equipe) + 1, "nome": nome, "cargo": cargo, "depto": depto,
                    "gestor": gestor, "nac": nac, "admissao": admissao,
                    "salario": arredondar_a(acaso.uniform(*SALARIOS[nivel]), 500), "nivel": nivel,
                }
                equipe.append(pessoa)
                if nivel == 2:
                    seniores.append(pessoa["id"])

    # Ninguém pode ter entrado antes do próprio gestor.
    por_id = {pessoa["id"]: pessoa for pessoa in equipe}
    for pessoa in equipe:
        if pessoa["gestor"]:
            admissao_gestor = por_id[pessoa["gestor"]]["admissao"]
            if pessoa["admissao"] <= admissao_gestor:
                pessoa["admissao"] = data_entre(admissao_gestor + timedelta(days=30), date(2024, 6, 30))

    assert len(equipe) == 60, len(equipe)
    for pessoa in equipe:
        assert pessoa["nac"] in paises, pessoa
    return equipe


def contratados_ate(equipe, dia, deptos=None):
    return [p for p in equipe if p["admissao"] <= dia and (deptos is None or p["depto"] in deptos)]


# --------------------------------------------------------------------------
# 2. Projetos
# --------------------------------------------------------------------------

# tema: (quantos, departamentos que lideram, critério do país, títulos, orçamento)
TEMAS = {
    "energy": (18, ["Climate & Energy"], lambda c, a: (ultimo_valor(c, "electricity_pct", a) or 100) < 85,
               ["Rural electrification monitoring", "Off-grid solar data review",
                "Household energy access survey", "Mini-grid performance tracking"],
               (250000, 2400000)),
    "health": (18, ["Research"], lambda c, a: (ultimo_valor(c, "under5_mortality", a) or 0) > 40,
               ["Child health indicators review", "Health spending tracking",
                "Maternal and child health data systems", "Health facility survey support"],
               (200000, 2000000)),
    "climate": (14, ["Climate & Energy"], lambda c, a: ultimo_valor(c, "co2_per_capita", a) is not None,
                ["Emissions inventory support", "Renewable energy transition planning",
                 "Climate data capacity building", "Urban air quality study"],
                (150000, 1800000)),
    "inequality": (14, ["Economics"], lambda c, a: (ultimo_valor(c, "gini", a) or 0) >= 40,
                   ["Household income survey support", "Income distribution analysis",
                    "Poverty mapping update", "Social protection data review"],
                   (120000, 1500000)),
    "digital": (16, ["Data Engineering", "Research"], lambda c, a: (ultimo_valor(c, "internet_pct", a) or 100) < 50,
                ["Internet access and public services", "Digital skills survey",
                 "Connectivity mapping", "Open data portal support"],
                (100000, 1200000)),
}


def gerar_projetos(equipe):
    projetos = []
    vezes_por_pais = {}
    for tema, (quantos, deptos, criterio, titulos, (orc_min, orc_max)) in TEMAS.items():
        for _ in range(quantos):
            inicio = somar_meses(date(2014, 1, 1), acaso.randint(0, 125))   # 2014-01 a 2024-06
            candidatos = [c for c in economias if criterio(c, inicio.year - 1) and vezes_por_pais.get(c, 0) < 3]
            pais = acaso.choice(sorted(candidatos))
            vezes_por_pais[pais] = vezes_por_pais.get(pais, 0) + 1

            fim = somar_meses(inicio, acaso.randint(12, 48)) - timedelta(days=1)
            fim = None if fim > HOJE else fim   # ainda em andamento

            # Quem lidera: alguém do departamento do tema ou da equipe de
            # cooperação, contratado antes do início (nunca a diretora).
            lideres = [p for p in contratados_ate(equipe, inicio, deptos + ["Cooperation Projects"])
                       if p["nivel"] in (1, 2, 3)]
            lider = acaso.choice(lideres)

            projetos.append({
                "tema": tema, "pais": pais, "inicio": inicio, "fim": fim, "lider": lider["id"],
                "titulo": f"{acaso.choice(titulos)}: {paises[pais]['country_name']}",
                "orcamento": arredondar_a(acaso.uniform(orc_min, orc_max), 5000),
            })

    projetos.sort(key=lambda p: (p["inicio"], p["pais"]))
    for numero, projeto in enumerate(projetos, start=1):
        projeto["id"] = numero

    # Títulos repetidos confundiriam: acrescenta o ano ao segundo.
    vistos = set()
    for projeto in projetos:
        if projeto["titulo"] in vistos:
            projeto["titulo"] += f" ({projeto['inicio'].year})"
        vistos.add(projeto["titulo"])

    assert len(projetos) == 80
    assert any(p["fim"] is None for p in projetos), "precisa haver projeto sem data de fim"
    return projetos


# --------------------------------------------------------------------------
# 3. Desembolsos
# --------------------------------------------------------------------------

CATEGORIAS = ["personnel", "travel", "equipment", "grants", "training", "consultancy"]
PESOS_CATEGORIAS = [30, 12, 14, 20, 10, 14]


def gerar_desembolsos(projetos):
    total_orcamento = sum(p["orcamento"] for p in projetos)
    base = 1480
    duplicados = 20

    # Cada projeto recebe pagamentos em proporção ao orçamento (pelo menos 4).
    cotas = [max(4, round(base * p["orcamento"] / total_orcamento)) for p in projetos]
    while sum(cotas) > base:
        cotas[cotas.index(max(cotas))] -= 1
    while sum(cotas) < base:
        cotas[acaso.randrange(len(cotas))] += 1

    pagamentos = []
    for projeto, quantos in zip(projetos, cotas):
        fim = projeto["fim"] or HOJE
        gasto = projeto["orcamento"] * (acaso.uniform(0.7, 0.97) if projeto["fim"] else acaso.uniform(0.3, 0.7))
        pesos = [acaso.uniform(0.3, 1.7) for _ in range(quantos)]
        soma = sum(pesos)
        for peso in pesos:
            pagamentos.append([
                projeto["id"],
                data_entre(projeto["inicio"], fim),
                round(gasto * peso / soma, 2),
                acaso.choices(CATEGORIAS, PESOS_CATEGORIAS)[0],
            ])

    # Os lançados em dobro: iguais em tudo, menos no id.
    for original in acaso.sample(pagamentos, duplicados):
        pagamentos.append(list(original))

    pagamentos.sort(key=lambda linha: (linha[1], linha[0]))
    linhas = [[numero] + [p[0], p[1].isoformat(), centavos(p[2]), p[3]]
              for numero, p in enumerate(pagamentos, start=1)]
    assert len(linhas) == 1500
    return linhas


# --------------------------------------------------------------------------
# 4. Viagens de campo
# --------------------------------------------------------------------------

MOTIVOS = ["field visit", "data collection", "workshop", "partner meeting", "monitoring visit"]


def gerar_viagens(equipe, projetos):
    viagens = []
    por_id = {p["id"]: p for p in equipe}
    viajantes_de_campo = ["Research", "Economics", "Climate & Energy", "Cooperation Projects", "Data Engineering"]

    # 360 ligadas a projetos.
    while len(viagens) < 360:
        projeto = acaso.choice(projetos)
        fim = min(projeto["fim"] or HOJE, HOJE - timedelta(days=15))
        if fim <= projeto["inicio"]:
            continue
        ida = data_entre(projeto["inicio"], fim)
        lider = por_id[projeto["lider"]]
        if acaso.random() < 0.4 and lider["admissao"] <= ida:
            pessoa = lider
        else:
            aptos = [p for p in contratados_ate(equipe, ida, [lider["depto"], "Cooperation Projects"]) if p["nivel"] >= 1]
            if not aptos:
                continue
            pessoa = acaso.choice(aptos)
        dias = acaso.randint(3, 14)
        viagens.append([pessoa["id"], projeto["id"], projeto["pais"], ida, ida + timedelta(days=dias),
                        round(1200 + 185 * dias + acaso.uniform(-300, 900), 2),
                        acaso.choice(MOTIVOS)])

    # 40 sem projeto: conferências, em qualquer país.
    while len(viagens) < 400:
        ida = data_entre(date(2014, 3, 1), HOJE - timedelta(days=15))
        aptos = contratados_ate(equipe, ida, viajantes_de_campo + ["Director's Office", "Partnerships"])
        pessoa = acaso.choice(aptos)
        dias = acaso.randint(2, 6)
        viagens.append([pessoa["id"], None, acaso.choice(sorted(economias)), ida, ida + timedelta(days=dias),
                        round(1500 + 210 * dias + acaso.uniform(-200, 1200), 2), "conference"])

    viagens.sort(key=lambda v: (v[3], v[0]))
    return [[numero, v[0], texto_ou_vazio(v[1]), v[2], v[3].isoformat(), v[4].isoformat(),
             centavos(v[5]), v[6]]
            for numero, v in enumerate(viagens, start=1)]


# --------------------------------------------------------------------------
# 5. Publicações e autorias
# --------------------------------------------------------------------------

TIPOS = ["report", "working paper", "policy brief", "article", "data note"]
PESOS_TIPOS = [30, 25, 25, 15, 5]

TITULOS_POR_TEMA = {
    "energy": ["Electricity access in {c}: trends since 2000", "Off-grid solar and rural households in {c}",
               "Energy access survey results: {c}", "Mini-grids in {c}: a monitoring note"],
    "health": ["Under-five mortality in {c}: a data review", "Health spending and outcomes in {c}",
               "Child health survey results: {c}", "Health facility data in {c}"],
    "climate": ["CO2 emissions per person in {c}", "Renewable energy use in {c}: where the data stands",
                "Emissions inventory notes: {c}", "Air quality monitoring in {c}"],
    "inequality": ["Measuring income inequality in {c}", "What the Gini index says about {c}",
                   "Household income survey results: {c}", "Social protection coverage in {c}"],
    "digital": ["Internet use in {c}: who is still offline", "Digital access and public services in {c}",
                "Connectivity mapping results: {c}", "Digital skills survey results: {c}"],
}

# 36 títulos gerais, um por publicação — mais os 9 relatórios anuais.
TITULOS_GERAIS = [
    "Life expectancy since 2000: a global view", "Renewable energy by region",
    "Urbanisation and electricity access", "Reading the Gini index: a primer",
    "Why aggregates are not countries", "Child mortality: two decades of data",
    "Internet adoption by income group", "Health spending as a share of GDP",
    "CO2 per person across income groups", "Missing values in development data",
    "GDP per capita: what current dollars hide", "Measuring access to electricity",
    "How population growth shapes per-capita figures", "A guide to World Bank income groups",
    "Comparing regions fairly", "Rural and urban gaps in electricity access",
    "Two decades of internet growth", "The long road to universal electricity",
    "When data stops: gaps in renewable energy statistics",
    "Life expectancy and health spending: a first look", "Emissions and income: what the data shows",
    "Small states in global statistics", "Averages, medians and outliers in country data",
    "Tracking progress on child survival", "Energy transition indicators explained",
    "Inequality data: coverage and limits", "Urban growth since 2000",
    "Digital divides between income groups", "Clean energy and household access",
    "Reading time series of country indicators", "Data quality notes for researchers",
    "Population estimates: how they are made", "Health outcomes by region",
    "Renewables in final energy consumption", "Country classifications and why they change",
    "Open data at the Meridiano Observatory",
]

DEPTO_POR_TEMA = {"energy": "Climate & Energy", "climate": "Climate & Energy", "health": "Research",
                  "inequality": "Economics", "digital": "Data Engineering"}


def gerar_publicacoes(equipe, projetos):
    publicacoes = []

    # 105 ligadas a projetos, publicadas depois de 6 meses de projeto.
    # O mesmo modelo não se repete no mesmo país.
    ja_usados = set()
    while len(publicacoes) < 105:
        projeto = acaso.choice(projetos)
        cedo = projeto["inicio"] + timedelta(days=180)
        tarde = min((projeto["fim"] or HOJE) + timedelta(days=365), HOJE)
        livres = [m for m in TITULOS_POR_TEMA[projeto["tema"]] if (m, projeto["pais"]) not in ja_usados]
        if cedo > tarde or not livres:
            continue
        modelo = acaso.choice(livres)
        ja_usados.add((modelo, projeto["pais"]))
        titulo = modelo.format(c=paises[projeto["pais"]]["country_name"])
        publicacoes.append({"titulo": titulo, "dia": data_entre(cedo, tarde), "projeto": projeto,
                            "tema": projeto["tema"]})

    # 45 sem projeto: os 36 títulos gerais, cada um uma vez, e os relatórios
    # anuais de 2015 a 2023, publicados em abril do ano seguinte.
    for titulo in TITULOS_GERAIS:
        publicacoes.append({"titulo": titulo, "dia": data_entre(date(2014, 6, 1), HOJE),
                            "projeto": None, "tema": None})
    for ano in range(2015, 2024):
        publicacoes.append({"titulo": f"Meridiano Observatory annual report {ano}",
                            "dia": data_entre(date(ano + 1, 4, 1), date(ano + 1, 4, 30)),
                            "projeto": None, "tema": None})
    assert len(publicacoes) == 150, len(publicacoes)

    publicacoes.sort(key=lambda p: (p["dia"], p["titulo"]))

    # Título repetido vira nova edição — resolvido em ordem de data, para a
    # primeira publicação ficar com o título puro e as seguintes com o ano.
    usados = set()
    for pub in publicacoes:
        if pub["titulo"] in usados:
            pub["titulo"] = f"{pub['titulo']} ({pub['dia'].year} edition)"
        while pub["titulo"] in usados:  # duas edições no mesmo ano: improvável
            pub["titulo"] += " II"
        usados.add(pub["titulo"])

    linhas_pub = []
    for numero, pub in enumerate(publicacoes, start=1):
        pub["id"] = numero
        # Downloads: a maioria na casa das centenas, poucas passam de milhares;
        # as mais antigas tiveram mais tempo para acumular.
        anos_no_ar = (HOJE - pub["dia"]).days / 365 + 0.3
        downloads = int(acaso.lognormvariate(5.0, 0.9) * anos_no_ar ** 0.6)
        linhas_pub.append([numero, pub["titulo"], acaso.choices(TIPOS, PESOS_TIPOS)[0],
                           pub["dia"].isoformat(),
                           texto_ou_vazio(pub["projeto"]["id"] if pub["projeto"] else None), downloads])

    # Autorias: 1 a 4 autores por publicação, 300 no total.
    quantos = [acaso.choices([1, 2, 3, 4], [35, 35, 20, 10])[0] for _ in publicacoes]
    while sum(quantos) > 300:
        i = acaso.randrange(len(quantos))
        if quantos[i] > 1:
            quantos[i] -= 1
    while sum(quantos) < 300:
        i = acaso.randrange(len(quantos))
        if quantos[i] < 4:
            quantos[i] += 1

    por_id = {p["id"]: p for p in equipe}
    linhas_aut = []
    for pub, n in zip(publicacoes, quantos):
        aptos = contratados_ate(equipe, pub["dia"])
        # Os da área do tema têm mais chance; o Director's Office quase nunca.
        depto = DEPTO_POR_TEMA.get(pub["tema"])
        pesos = [6 if p["depto"] == depto else 0.3 if p["depto"] == "Director's Office" else 1 for p in aptos]
        autores = []
        if pub["projeto"] and acaso.random() < 0.6 and por_id[pub["projeto"]["lider"]]["admissao"] <= pub["dia"]:
            autores.append(pub["projeto"]["lider"])
        while len(autores) < n:
            escolhido = acaso.choices(aptos, pesos)[0]["id"]
            if escolhido not in autores:
                autores.append(escolhido)
        for posicao, pessoa in enumerate(autores, start=1):
            linhas_aut.append([pub["id"], pessoa, posicao])

    assert len(linhas_aut) == 300
    return linhas_pub, linhas_aut


# --------------------------------------------------------------------------
# Tudo junto
# --------------------------------------------------------------------------

def main():
    print("Instituto (semente fixa)")
    equipe = gerar_equipe()
    projetos = gerar_projetos(equipe)
    desembolsos = gerar_desembolsos(projetos)
    viagens = gerar_viagens(equipe, projetos)
    publicacoes, autorias = gerar_publicacoes(equipe, projetos)

    gravar_csv(
        "staff.csv",
        ["staff_id", "full_name", "job_title", "department", "manager_id",
         "nationality_code", "hire_date", "salary_chf"],
        [[p["id"], p["nome"], p["cargo"], p["depto"], texto_ou_vazio(p["gestor"]), p["nac"],
          p["admissao"].isoformat(), p["salario"]] for p in equipe],
    )
    gravar_csv(
        "projects.csv",
        ["project_id", "title", "topic", "country_code", "lead_id", "start_date", "end_date", "budget_usd"],
        [[p["id"], p["titulo"], p["tema"], p["pais"], p["lider"], p["inicio"].isoformat(),
          p["fim"].isoformat() if p["fim"] else "", p["orcamento"]] for p in projetos],
    )
    gravar_csv(
        "disbursements.csv",
        ["disbursement_id", "project_id", "paid_on", "amount_usd", "category"],
        desembolsos,
    )
    gravar_csv(
        "field_trips.csv",
        ["trip_id", "staff_id", "project_id", "country_code", "departure_date", "return_date",
         "cost_usd", "purpose"],
        viagens,
    )
    gravar_csv(
        "publications.csv",
        ["publication_id", "title", "pub_type", "published_on", "project_id", "downloads"],
        publicacoes,
    )
    gravar_csv(
        "authorships.csv",
        ["publication_id", "staff_id", "author_position"],
        autorias,
    )
    print("Pronto.")


if __name__ == "__main__":
    main()
