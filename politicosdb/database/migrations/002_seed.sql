-- PolíticosDB — Dados iniciais
-- Migration: 002_seed.sql

INSERT INTO partidos (sigla, nome, numero, cor_hex) VALUES
('PT',          'Partido dos Trabalhadores',              13,  '#D85A30'),
('PL',          'Partido Liberal',                        22,  '#185FA5'),
('MDB',         'Movimento Democrático Brasileiro',       15,  '#1D9E75'),
('PSOL',        'Partido Socialismo e Liberdade',         50,  '#BA7517'),
('PSD',         'Partido Social Democrático',             55,  '#533AB7'),
('PSB',         'Partido Socialista Brasileiro',          40,  '#D4537E'),
('PDT',         'Partido Democrático Trabalhista',        12,  '#0F6E56'),
('União',       'União Brasil',                           44,  '#633806'),
('Rede',        'Rede Sustentabilidade',                  18,  '#3B6D11'),
('Solidariedade','Solidariedade',                         77,  '#993C1D'),
('PP',          'Progressistas',                          11,  '#444441'),
('Republicanos','Republicanos',                           10,  '#BA7517');

INSERT INTO candidatos
    (nome, nome_urna, numero_candidato, cargo, partido_id, uf, municipio, ano_eleicao, situacao, votos, genero, idade, instrucao, patrimonio_declarado, bio)
VALUES
('Ricardo Nunes',     'Ricardo Nunes',  11,   'Prefeito',          (SELECT id FROM partidos WHERE sigla='MDB'),  'SP','São Paulo',     2024,'Eleito',   3241418,'M',62,'Superior completo',  4200000.00, 'Empresário e político, reeleito prefeito de SP em 2024.'),
('Guilherme Boulos',  'Boulos',         50,   'Vereador',          (SELECT id FROM partidos WHERE sigla='PSOL'), 'SP','São Paulo',     2024,'Eleito',    184023,'M',42,'Superior completo',   120000.00, 'Ativista e político, eleito vereador após disputar a prefeitura.'),
('Eduardo Braide',    'Braide',         55,   'Prefeito',          (SELECT id FROM partidos WHERE sigla='PSD'),  'MA','São Luís',      2024,'Eleito',    318740,'M',45,'Superior completo',  2100000.00, 'Reeleito prefeito de São Luís com ampla margem em 2024.'),
('Evandro Leitão',    'Evandro',        13,   'Prefeito',          (SELECT id FROM partidos WHERE sigla='PT'),   'CE','Fortaleza',     2024,'Eleito',    524901,'M',48,'Superior completo',  1500000.00, 'Ex-presidente da ALCE, eleito prefeito de Fortaleza.'),
('João Campos',       'João Campos',    40,   'Prefeito',          (SELECT id FROM partidos WHERE sigla='PSB'),  'PE','Recife',        2024,'Eleito',    625010,'M',32,'Superior completo',   870000.00, 'Reeleito com 78%, o prefeito mais votado da história do Recife.'),
('Luiz Lima',         'Luiz Lima',      22,   'Vereador',          (SELECT id FROM partidos WHERE sigla='PL'),   'RJ','Rio de Janeiro',2024,'Eleito',     38904,'M',40,'Superior completo',   560000.00, 'Ex-atleta olímpico eleito vereador carioca.'),
('Lídice da Mata',    'Lídice',         40,   'Vereadora',         (SELECT id FROM partidos WHERE sigla='PSB'),  'BA','Salvador',      2024,'Eleita',     42310,'F',68,'Superior completo',   890000.00, 'Veterana da política baiana, eleita vereadora em Salvador.'),
('Ana Paula Matos',   'Ana Paula',      12,   'Vereadora',         (SELECT id FROM partidos WHERE sigla='PDT'),  'BA','Salvador',      2024,'Eleita',     29883,'F',44,'Superior completo',   450000.00, 'Assistente social, reeleita vereadora em Salvador.'),
('Nikolas Ferreira',  'Nikolas',        2233, 'Deputado Federal',  (SELECT id FROM partidos WHERE sigla='PL'),   'MG','Belo Horizonte',2022,'Eleito',   1492047,'M',28,'Superior incompleto', 310000.00, 'Deputado mais votado da história com 1,49 milhão de votos.'),
('Tabata Amaral',     'Tabata Amaral',  4040, 'Deputada Federal',  (SELECT id FROM partidos WHERE sigla='PSB'),  'SP','São Paulo',     2022,'Eleita',    481090,'F',31,'Superior completo',   240000.00, 'Astrofísica e educadora, reeleita deputada federal.'),
('Luizianne Lins',    'Luizianne',      1313, 'Deputada Federal',  (SELECT id FROM partidos WHERE sigla='PT'),   'CE','Fortaleza',     2022,'Eleita',    126803,'F',57,'Doutorado',           730000.00, 'Ex-prefeita de Fortaleza, reeleita deputada federal.'),
('Kim Kataguiri',     'Kim Kataguiri',  4444, 'Deputado Federal',  (SELECT id FROM partidos WHERE sigla='União'),'SP','São Paulo',     2022,'Eleito',    175301,'M',29,'Superior completo',   190000.00, 'Fundador do MBL, reeleito deputado federal por SP.'),
('Marina Silva',      'Marina Silva',   18,   'Senadora',          (SELECT id FROM partidos WHERE sigla='Rede'), 'AC','Rio Branco',    2022,'Eleita',    318022,'F',66,'Superior completo',  1100000.00, 'Ministra do Meio Ambiente, ex-candidata à presidência.'),
('Clécio Luis',       'Clécio',         77,   'Governador',        (SELECT id FROM partidos WHERE sigla='Solidariedade'),'AP','Macapá',2022,'Eleito',   191340,'M',50,'Superior completo',   980000.00, 'Ex-prefeito de Macapá, eleito governador do Amapá.'),
('Coronel Chrisostomo','Chrisostomo',   2222, 'Deputado Federal',  (SELECT id FROM partidos WHERE sigla='PL'),   'RO','Porto Velho',  2022,'Eleito',     74231,'M',55,'Superior completo',  2300000.00, 'Ex-militar, deputado federal por Rondônia.');
