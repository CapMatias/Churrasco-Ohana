// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "https://elnekhxpmqqqqorobbdj.supabase.co";
const SUPABASE_KEY = "sb_publishable_0btHpgQFpGTH0j8s5CqVLQ_E3ZZ3ODk";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LISTA DE ITENS ---
let itens = [
    "Carne",
    "Queijo coalho",
    "Refrigerante ou Suco",
    "Asa ou Drumet",
    "Pão de Alho",
    "Coração",
    "Linguiça",
    "Sobremesa",
];

// --- RENDERIZAR LISTA ---
async function render() {
    const ul = document.getElementById("item-list");
    ul.innerHTML = "";

    const { data, error } = await db.from("itens").select("*");

    itens.forEach(item => {
        const selecionados = data?.filter(x => x.item === item) || [];

        const li = document.createElement("li");

        const nomes = selecionados.map(x => x.pessoa);

        li.innerHTML = `
            <div>
                <span>${item}</span>
                ${
                    nomes.length > 0
                    ? `<div class="nome-item">Por: ${nomes.join(", ")}</div>`
                    : `<div class="nome-item">Ninguém escolheu ainda</div>`
                }
            </div>

            <div style="display:flex; gap:8px;">
                <button class="btn btn-add">Adicionar</button>
                <button class="btn btn-remove">Remover</button>
            </div>
        `;

        // --- ADICIONAR ---
        li.querySelector(".btn-add").onclick = async () => {
            const nome = document.getElementById("nome").value.trim();

            if (nome === "") {
                alert("Digite seu nome antes!");
                return;
            }

            if (nomes.includes(nome)) {
                alert("Você já escolheu esse item!");
                return;
            }

            await db.from("itens").insert({ item, pessoa: nome });

            render(); 
        };

        // --- REMOVER ---
        li.querySelector(".btn-remove").onclick = async () => {
            const nome = document.getElementById("nome").value.trim();

            if (nome === "") {
                alert("Digite seu nome antes!");
                return;
            }

            // Procurar no banco a linha EXATA dessa pessoa
            const alvo = selecionados.find(x => x.pessoa === nome);

            if (!alvo) {
                alert("Você não marcou esse item!");
                return;
            }

            await db.from("itens").delete().eq("id", alvo.id);

            render();
        };

        ul.appendChild(li);
    });
}

// --- REALTIME ---
db.channel("realtime:itens")
  .on("postgres_changes", { event: "*", schema: "public", table: "itens" }, payload => {
      render();
  })
  .subscribe();

render();

// --- MÚSICA ---
const musica = document.getElementById("musica");
const playBtn = document.getElementById("playBtn");

let tocando = false;

playBtn.onclick = () => {
    if (!tocando) {
        musica.play();
        playBtn.textContent = "⏸ Pausar";
        tocando = true;
    } else {
        musica.pause();
        playBtn.textContent = "▶ Música";
        tocando = false;
    }
};
