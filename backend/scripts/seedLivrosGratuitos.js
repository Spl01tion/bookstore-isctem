// Popula o catálogo com livros de distribuição gratuita e legal
// (domínio público ou licenças abertas como CC BY / CC BY-NC), com link direto para PDF.
// Uso:  npm run seed:livros [-- --dry-run]
// Idempotente: identifica cada livro por título + autor e atualiza em vez de duplicar.
import 'dotenv/config';
import mongoose from "mongoose";
import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";

const dryRun = process.argv.includes("--dry-run");

const ol = (id) => `https://covers.openlibrary.org/b/id/${id}-L.jpg`;
const ia = (id) => `https://archive.org/services/img/${id}`;
const iaPdf = (id, file) => `https://archive.org/download/${id}/${encodeURIComponent(file)}`;
const planet = (slug) => `https://www.planetebook.com/free-ebooks/${slug}.pdf`;

// cat: nomes de categorias (criadas se não existirem)
const LIVROS = [
    // ---------- Clássicos em português (domínio público) ----------
    {
        titulo: "Dom Casmurro",
        autores: "Machado de Assis",
        descricao: "Bento Santiago, o Dom Casmurro, recorda a juventude e o amor por Capitu, e tenta provar a si próprio que foi traído. Um dos romances mais importantes da língua portuguesa. Edição digitalizada de 1899, domínio público (digitalização sob CC BY-NC-SA).",
        imagem_uri: ia("domcasmurro_1899"),
        download_link: iaPdf("domcasmurro_1899", "000181844.pdf"),
        publiData: "1899-01-01",
        editora: "Garnier",
        lingua: "pt",
        cat: ["Romance", "Clássicos"],
    },
    {
        titulo: "O Alienista",
        autores: "Machado de Assis",
        descricao: "O médico Simão Bacamarte funda um asilo em Itaguaí e começa a internar quem considera louco, até que quase toda a vila está lá dentro. Uma sátira sobre ciência, poder e razão. Domínio público.",
        imagem_uri: ia("o-alienista-machado-de-assis"),
        download_link: iaPdf("o-alienista-machado-de-assis", "O Alienista - Machado de Assis.pdf"),
        publiData: "1882-01-01",
        lingua: "pt",
        cat: ["Clássicos"],
    },
    {
        titulo: "Os Lusíadas",
        autores: "Luís de Camões",
        descricao: "Poema épico em dez cantos que narra a viagem de Vasco da Gama à Índia e celebra a história de Portugal. Edição de Paris, 1865 (J.-P. Aillaud, Guillard e C.ª). Domínio público.",
        imagem_uri: ia("oslusiadas00camo_0"),
        download_link: iaPdf("oslusiadas00camo_0", "oslusiadas00camo_0.pdf"),
        publiData: "1572-01-01",
        editora: "J.-P. Aillaud, Guillard e C.ª",
        pag: 566,
        lingua: "pt",
        cat: ["Clássicos"],
    },
    {
        titulo: "Iracema",
        autores: "José de Alencar",
        descricao: "A lenda da índia tabajara Iracema e do português Martim, que simboliza o nascimento do povo cearense. Clássico do romantismo brasileiro. Domínio público (edição Luso Livros).",
        imagem_uri: ia("iracema-jose-de-alencar-original-lusolivros"),
        download_link: iaPdf("iracema-jose-de-alencar-original-lusolivros", "Iracema-Jose-de-Alencar.pdf"),
        publiData: "1865-01-01",
        editora: "Luso Livros",
        lingua: "pt",
        cat: ["Romance", "Clássicos"],
    },
    {
        titulo: "Os Maias",
        autores: "Eça de Queirós",
        descricao: "A história de três gerações da família Maia, centrada em Carlos da Maia, e um retrato crítico da sociedade lisboeta do século XIX. Domínio público (edição Luso Livros).",
        imagem_uri: ia("os-maias_lusolivros"),
        download_link: iaPdf("os-maias_lusolivros", "Os-Maias-Eca-de-Queiros.pdf"),
        publiData: "1888-01-01",
        editora: "Luso Livros",
        lingua: "pt",
        cat: ["Romance", "Clássicos"],
    },
    {
        titulo: "O Primo Basílio",
        autores: "Eça de Queirós",
        descricao: "Luísa, casada e entediada, envolve-se com o primo Basílio enquanto o marido está ausente, e passa a ser chantageada pela criada Juliana. Romance realista sobre a burguesia lisboeta. Edição digitalizada de 1900, domínio público.",
        imagem_uri: ia("oprimobazilioep00queigoog"),
        download_link: iaPdf("oprimobazilioep00queigoog", "oprimobazilioep00queigoog.pdf"),
        publiData: "1878-01-01",
        pag: 622,
        lingua: "pt",
        cat: ["Romance", "Clássicos"],
    },
    {
        titulo: "A Cidade e as Serras",
        autores: "Eça de Queirós",
        descricao: "Jacinto, rico e farto da civilização de Paris, redescobre a felicidade na vida simples das serras portuguesas. Edição Lello & Irmão, 1912. Domínio público.",
        imagem_uri: ia("cidadeeasserras00quei"),
        download_link: iaPdf("cidadeeasserras00quei", "cidadeeasserras00quei.pdf"),
        publiData: "1901-01-01",
        editora: "Lello & Irmão",
        pag: 326,
        lingua: "pt",
        cat: ["Clássicos"],
    },

    // ---------- Clássicos em inglês (domínio público, PDF Planet eBook) ----------
    {
        titulo: "Pride and Prejudice",
        autores: "Jane Austen",
        descricao: "Elizabeth Bennet e o orgulhoso Sr. Darcy enfrentam preconceitos, mal-entendidos e as convenções sociais da Inglaterra rural do início do século XIX. Domínio público (em inglês).",
        imagem_uri: ol(14348537),
        download_link: planet("pride-and-prejudice"),
        publiData: "1813-01-01",
        lingua: "en",
        cat: ["Romance"],
    },
    {
        titulo: "Jane Eyre",
        autores: "Charlotte Brontë",
        descricao: "Órfã e preceptora em Thornfield Hall, Jane Eyre apaixona-se pelo misterioso Sr. Rochester, cuja casa esconde um segredo. Domínio público (em inglês).",
        imagem_uri: ol(8235363),
        download_link: planet("jane-eyre"),
        publiData: "1847-01-01",
        lingua: "en",
        cat: ["Romance"],
    },
    {
        titulo: "The Time Machine",
        autores: "H. G. Wells",
        descricao: "Um cientista vitoriano constrói uma máquina do tempo e viaja até ao ano 802 701, onde a humanidade se dividiu em Eloi e Morlocks. Domínio público (em inglês).",
        imagem_uri: ol(9009316),
        download_link: planet("the-time-machine"),
        publiData: "1895-01-01",
        lingua: "en",
        cat: ["Ficção Científica"],
    },
    {
        titulo: "The War of the Worlds",
        autores: "H. G. Wells",
        descricao: "Marcianos aterram em Inglaterra e devastam o país com máquinas de guerra e raios de calor. Um dos primeiros romances de invasão extraterrestre. Domínio público (em inglês).",
        imagem_uri: ol(36314),
        download_link: planet("the-war-of-the-worlds"),
        publiData: "1898-01-01",
        lingua: "en",
        cat: ["Ficção Científica"],
    },
    {
        titulo: "Frankenstein",
        autores: "Mary Shelley",
        descricao: "Victor Frankenstein dá vida a uma criatura feita de partes de cadáveres e foge da sua criação, com consequências trágicas. Considerado o primeiro romance de ficção científica. Domínio público (em inglês).",
        imagem_uri: ol(12356249),
        download_link: planet("frankenstein"),
        publiData: "1818-01-01",
        lingua: "en",
        cat: ["Ficção Científica"],
    },

    // ---------- Tecnologia (licenças abertas) ----------
    {
        titulo: "Think Python (2.ª edição)",
        autores: "Allen B. Downey",
        descricao: "Introdução à programação em Python 3 para principiantes: variáveis, funções, recursividade, estruturas de dados e classes, com exercícios em cada capítulo. Gratuito sob licença CC BY-NC 3.0 (em inglês).",
        imagem_uri: ol(7363360),
        download_link: "https://greenteapress.com/thinkpython2/thinkpython2.pdf",
        publiData: "2015-01-01",
        editora: "Green Tea Press",
        lingua: "en",
        cat: ["Tecnologia"],
    },
    {
        titulo: "Think Stats (2.ª edição)",
        autores: "Allen B. Downey",
        descricao: "Estatística e análise exploratória de dados com Python: distribuições, probabilidades, testes de hipóteses e regressão, aplicados a dados reais. Gratuito sob licença CC BY-NC-SA 4.0 (em inglês).",
        imagem_uri: ol(6956191),
        download_link: "https://greenteapress.com/thinkstats2/thinkstats2.pdf",
        publiData: "2014-01-01",
        editora: "Green Tea Press",
        lingua: "en",
        cat: ["Tecnologia"],
    },
    {
        titulo: "Eloquent JavaScript",
        autores: "Marijn Haverbeke",
        descricao: "Guia moderno de JavaScript e de programação em geral: valores, funções, objetos, programação assíncrona, o browser e Node.js, com projetos práticos. Gratuito sob licença CC BY-NC 3.0 (em inglês).",
        imagem_uri: ol(7082166),
        download_link: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf",
        publiData: "2024-01-01",
        editora: "No Starch Press",
        lingua: "en",
        cat: ["Tecnologia"],
    },
    {
        titulo: "Pro Git (2.ª edição)",
        autores: "Scott Chacon, Ben Straub",
        descricao: "O livro oficial do Git: do básico (commits, branches, merges) ao trabalho em equipa com GitHub e ao funcionamento interno do Git. Gratuito sob licença CC BY-NC-SA 3.0 (em inglês).",
        imagem_uri: ol(7892827),
        download_link: "https://github.com/progit/progit2/releases/latest/download/progit.pdf",
        publiData: "2014-01-01",
        editora: "Apress",
        lingua: "en",
        cat: ["Tecnologia"],
    },

    // ---------- Gestão (OpenStax, CC BY 4.0) ----------
    {
        titulo: "Principles of Management",
        autores: "David S. Bright, Anastasia H. Cortes (OpenStax)",
        descricao: "Manual universitário de gestão: planeamento, liderança, organização, tomada de decisão, motivação e gestão de equipas. Gratuito sob licença CC BY 4.0 (em inglês).",
        imagem_uri: ol(10220922),
        download_link: "https://assets.openstax.org/oscms-prodcms/media/documents/PrinciplesofManagement-OP.pdf",
        publiData: "2019-01-01",
        editora: "OpenStax",
        lingua: "en",
        cat: ["Gestão"],
    },
    {
        titulo: "Introduction to Business",
        autores: "Lawrence J. Gitman, Carl McDaniel et al. (OpenStax)",
        descricao: "Introdução ao mundo dos negócios: economia, ética, empreendedorismo, marketing, finanças e gestão de recursos humanos. Gratuito sob licença CC BY 4.0 (em inglês).",
        imagem_uri: ol(13213770),
        download_link: "https://assets.openstax.org/oscms-prodcms/media/documents/IntroductionToBusiness-OP.pdf",
        publiData: "2018-01-01",
        editora: "OpenStax",
        lingua: "en",
        cat: ["Gestão"],
    },
    {
        titulo: "Entrepreneurship",
        autores: "Michael Laverty, Chris Littel et al. (OpenStax)",
        descricao: "Como identificar oportunidades, validar ideias, criar um plano de negócio, financiar e lançar uma empresa. Gratuito sob licença CC BY 4.0 (em inglês). Ficheiro grande (cerca de 120 MB).",
        imagem_uri: ol(15231809),
        download_link: "https://assets.openstax.org/oscms-prodcms/media/documents/Entrepreneurship-WEB.pdf",
        publiData: "2020-01-01",
        editora: "OpenStax",
        lingua: "en",
        cat: ["Gestão"],
    },
];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

await mongoose.connect(process.env.MONGO_URI);

try {
    // 1. Categorias: reutiliza as existentes (sem distinguir maiúsculas), cria as que faltam
    const catIds = {};
    for (const nome of new Set(LIVROS.flatMap((l) => l.cat))) {
        let cat = await Categoria.findOne({ nome: new RegExp(`^${escapeRegex(nome)}$`, "i") });
        if (!cat) {
            console.log(`${dryRun ? "[dry-run] " : ""}categoria criada: ${nome}`);
            if (!dryRun) cat = await Categoria.create({ nome });
        }
        catIds[nome] = cat?._id;
    }

    // 2. Livros: atualiza se já existir (título + autor), senão cria
    let criados = 0, atualizados = 0;
    for (const { cat, ...dados } of LIVROS) {
        const categoria = cat.map((n) => catIds[n]).filter(Boolean);
        const existente = await Livro.findOne({
            titulo: new RegExp(`^${escapeRegex(dados.titulo)}$`, "i"),
            autores: new RegExp(`^${escapeRegex(dados.autores)}$`, "i"),
        });

        if (existente) {
            atualizados++;
            console.log(`${dryRun ? "[dry-run] " : ""}atualizado: ${dados.titulo}`);
            if (!dryRun) {
                // Só acrescenta link, capa e categorias; não apaga dados que já lá estavam
                const anteriores = [].concat(existente.categoria ?? []).map(String);
                const novas = categoria.filter((id) => !anteriores.includes(String(id)));
                await Livro.updateOne(
                    { _id: existente._id },
                    {
                        $set: {
                            download_link: dados.download_link,
                            imagem_uri: dados.imagem_uri,
                            descricao: dados.descricao,
                            categoria: [...anteriores, ...novas.map(String)],
                        },
                    }
                );
                await Categoria.updateMany({ _id: { $in: categoria } }, { $addToSet: { livros: existente._id } });
            }
        } else {
            criados++;
            console.log(`${dryRun ? "[dry-run] " : ""}criado: ${dados.titulo}`);
            if (!dryRun) {
                const livro = await Livro.create({ ...dados, publiData: new Date(dados.publiData), categoria });
                await Categoria.updateMany({ _id: { $in: categoria } }, { $addToSet: { livros: livro._id } });
            }
        }
    }

    console.log(`\nLivros criados: ${criados} | atualizados: ${atualizados} | total na BD: ${await Livro.countDocuments()}`);
} catch (error) {
    console.error("Erro:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
