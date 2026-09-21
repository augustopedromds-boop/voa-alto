/* =========================================
   VOA ALTO
   APP.JS
   CHÃO → BATER AS ASAS → DESCOLAGEM
   → VOO FIXO → CENÁRIO A MOVER → QUEDA
========================================= */


/* =========================================
   ESTADO DO JOGO
========================================= */

let saldo = 10000;

let multiplicador = 1.00;

let vooAtivo = false;

let apostaFeita = false;

let valorAposta = 500;

let apostaRetirada = false;

let animationFrame = null;

let inicioVoo = 0;

let fimVoo = 0;

let estadoVoo = "chao";

let tempoPreparacao = 0;

let tempoDescolagem = 0;

let tempoQuedaInicio = 0;

let timerPreparacao = null;

let timerQueda = null;


/* =========================================
   ELEMENTOS
========================================= */

const saldoElement =
    document.getElementById("saldo");

const multiplierElement =
    document.getElementById("multiplier");

const statusElement =
    document.getElementById("flightStatus");

const eagleElement =
    document.getElementById("eagle");

const eagleSprite =
    eagleElement
        ? eagleElement.querySelector(".eagle-sprite")
        : null;

const betAmountElement =
    document.getElementById("betAmount");

const autoCashoutElement =
    document.getElementById("autoCashout");

const betButton =
    document.getElementById("betButton");

const cashoutButton =
    document.getElementById("cashoutButton");

const betStatus =
    document.getElementById("betStatus");

const plusButton =
    document.getElementById("plus");

const minusButton =
    document.getElementById("minus");

const historyElement =
    document.getElementById("history");

const skyElement =
    document.querySelector(".sky");


/* =========================================
   TRAJETÓRIA DO VOO
========================================= */

const POSICAO_CHAO = 78;


/*
   Posição onde a águia entra
   no voo verdadeiro.
*/

const VOO_INICIO_X = 38;
const VOO_INICIO_Y = 70;


/*
   Limites da trajetória.

   A águia vai avançar para a direita
   enquanto sobe.
*/

const VOO_FIM_X = 82;
const VOO_FIM_Y = 20;


/*
   Compatibilidade com funções antigas.
*/

const POSICAO_ALTA = VOO_FIM_Y;


/*
   Última posição real da águia.
   É usada para iniciar a queda
   exatamente de onde ela terminou.
*/

let ultimaPosicaoX = VOO_INICIO_X;
let ultimaPosicaoY = VOO_INICIO_Y;
/*
   Elementos do gráfico.
*/

let flightGraph = null;
let flightPath = null;
let flightGlow = null;
let flightDot = null;

let pontosVoo = [];

let windParticlesContainer = null;
let windParticleTimer = null;
let windIntensity = 0;

function prepararParticulasVento() {
    windParticlesContainer =
        document.getElementById("windParticles");

    if (!windParticlesContainer) {
        console.error("Container das partículas de vento não encontrado.");
        return;
    }

    windParticlesContainer.innerHTML = "";
}

function criarParticulaVento() {
    if (!windParticlesContainer || !vooAtivo) {
        return;
    }

    const particle = document.createElement("div");

    particle.classList.add("wind-particle");

    const tipo = Math.random();

    if (tipo > 0.82) {
        particle.classList.add("fast");
    }

    if (tipo < 0.20) {
        particle.classList.add("long");
    }

    const largura =
        25 + Math.random() * 100;

    const posicaoY =
        8 + Math.random() * 82;

    const duracao =
        Math.max(
            0.35,
            1.6 - (windIntensity * 0.9)
        );

    particle.style.width =
        `${largura}px`;

    particle.style.top =
        `${posicaoY}%`;

    particle.style.right =
        `${-largura}px`;

    particle.style.animation =
        `ventoPassar ${duracao}s linear forwards`;

    windParticlesContainer.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, (duracao * 1000) + 100);
}

function iniciarParticulasVento() {
    prepararParticulasVento();

    if (windParticleTimer) {
        clearInterval(windParticleTimer);
    }

    windParticleTimer = setInterval(() => {

        if (!vooAtivo || estadoVoo !== "voando") {
            return;
        }

        windIntensity =
            Math.min(
                multiplicador / 10,
                1
            );

        const quantidade =
            Math.floor(
                1 + (windIntensity * 4)
            );

        for (let i = 0; i < quantidade; i++) {
            criarParticulaVento();
        }

    }, 180);
}

function pararParticulasVento() {

    if (windParticleTimer) {
        clearInterval(windParticleTimer);
        windParticleTimer = null;
    }

    if (windParticlesContainer) {
        windParticlesContainer.innerHTML = "";
    }

    windIntensity = 0;
}

/* =========================================
   SALDO
========================================= */

function atualizarSaldo() {

    saldoElement.textContent =
        saldo.toLocaleString("pt-AO") + " Kz";

}


/* =========================================
   MULTIPLICADOR
========================================= */

function atualizarMultiplicador() {

    multiplierElement.textContent =
        multiplicador.toFixed(2) + "x";

}


/* =========================================
   COLOCAR ÁGUIA NO CHÃO
========================================= */

function colocarAguiaNoChao() {

    if (!eagleElement) return;

    eagleElement.style.setProperty(
        "left",
        "50%",
        "important"
    );

    eagleElement.style.setProperty(
        "top",
        POSICAO_CHAO + "%",
        "important"
    );

    eagleElement.style.setProperty(
        "transform",
        "translate(-50%, -50%) rotate(0deg) scale(1)",
        "important"
    );

}


/* =========================================
   POSICIONAR ÁGUIA NO ALTO
========================================= */

function colocarAguiaNoAlto() {

    if (!eagleElement) return;

    eagleElement.style.setProperty(
        "left",
        "50%",
        "important"
    );

    eagleElement.style.setProperty(
        "top",
        POSICAO_ALTA + "%",
        "important"
    );

    eagleElement.style.setProperty(
        "transform",
        "translate(-50%, -50%) rotate(-4deg) scale(1.03)",
        "important"
    );

}


/* =========================================
   DESCOLAGEM
========================================= */

function moverAguiaDuranteDescolagem(progresso) {

    if (!eagleElement) return;


    /*
       Suavização da subida.
    */

    const suavizado =
        progresso *
        progresso *
        (3 - 2 * progresso);


    /*
       Movimento vertical.
    */

    const inicio =
        POSICAO_CHAO;

    const fim =
        VOO_INICIO_Y;


    const posicaoY =
        inicio -
        (
            (inicio - fim) *
            suavizado
        );


    /*
       Pequeno avanço horizontal
       durante a descolagem.
    */

    const posicaoX =
        50 -
        (
            (50 - VOO_INICIO_X) *
            suavizado
        );


    /*
       Inclinação do corpo.
    */

    const inclinacao =
        -3 -
        (suavizado * 7);


    const escala =
        1 +
        (suavizado * 0.04);


    eagleElement.style.setProperty(
        "left",
        posicaoX + "%",
        "important"
    );


    eagleElement.style.setProperty(
        "top",
        posicaoY + "%",
        "important"
    );


    eagleElement.style.setProperty(
        "transform",
        `translate(-50%, -50%)
         rotate(${inclinacao}deg)
         scale(${escala})`,
        "important"
    );

}


/* =========================================
   BATER ASAS — 8 FRAMES DO SPRITE
========================================= */

let intervaloAsas = null;

const framesAsas = [
    "0% 0%",
    "33.333% 0%",
    "66.666% 0%",
    "100% 0%",

    "0% 100%",
    "33.333% 100%",
    "66.666% 100%",
    "100% 100%"
];


function iniciarBatimentoAsas() {

    if (!eagleSprite) return;

    /*
       Primeiro limpa qualquer animação CSS
       que possa estar a interferir.
    */

    eagleSprite.style.setProperty(
        "animation",
        "none",
        "important"
    );


    /*
       Garante o tamanho correto
       da folha de sprites.
    */

    eagleSprite.style.setProperty(
        "background-size",
        "400% 200%",
        "important"
    );


    eagleSprite.style.setProperty(
        "background-repeat",
        "no-repeat",
        "important"
    );


    /*
       Cancela animação anterior.
    */

    if (intervaloAsas) {

        clearInterval(
            intervaloAsas
        );

    }


    let frameAtual = 0;


    /*
       Primeiro frame.
    */

    eagleSprite.style.setProperty(
        "background-position",
        framesAsas[frameAtual],
        "important"
    );


    /*
       Troca os frames continuamente.
       90 ms = movimento rápido das asas.
    */

    intervaloAsas =
        setInterval(() => {

            frameAtual++;

            if (
                frameAtual >=
                framesAsas.length
            ) {

                frameAtual = 0;

            }


            eagleSprite.style.setProperty(
                "background-position",
                framesAsas[frameAtual],
                "important"
            );

        }, 90);

}


function pararBatimentoAsas() {

    if (intervaloAsas) {

        clearInterval(
            intervaloAsas
        );

        intervaloAsas =
            null;

    }


    if (!eagleSprite) return;


    /*
       Para no primeiro frame.
    */

    eagleSprite.style.setProperty(
        "background-position",
        "0% 0%",
        "important"
    );


    eagleSprite.style.setProperty(
        "animation",
        "none",
        "important"
    );

}


/* =========================================
   FUNDO INFINITO
   ÁGUIA FICA FORA DO CENÁRIO MÓVEL
========================================= */

let cenarioAnimacao = null;
let cenarioTrack = null;
let cenarioPreparado = false;


/* =========================================
   PREPARAR CENÁRIO
========================================= */

function prepararCenarioInfinito() {

    if (!skyElement) return;

    if (cenarioPreparado) return;


    /*
       Procurar a área principal do jogo.
    */

    const flightElement =
        document.querySelector(".flight");


    /*
       IMPORTANTE:
       tira a águia do SKY e coloca
       diretamente no FLIGHT.

       Assim o cenário pode andar
       sem levar a águia consigo.
    */

    if (
        eagleElement &&
        flightElement
    ) {

        flightElement.appendChild(
            eagleElement
        );

        eagleElement.style.setProperty(
            "position",
            "absolute",
            "important"
        );

        eagleElement.style.setProperty(
            "left",
            "50%",
            "important"
        );

        eagleElement.style.setProperty(
            "z-index",
            "1000",
            "important"
        );

    }


    /*
       Pegar somente os elementos
       que pertencem ao cenário.
    */

    const elementosOriginais =
    Array.from(
        skyElement.children
    ).filter(elemento => {
        return elemento.id !== "eagle" &&
               !elemento.classList.contains("sun");
    });

    /*
       Criar pista infinita.
    */

    cenarioTrack =
        document.createElement(
            "div"
        );


    cenarioTrack.className =
        "voa-cenario-track";


    cenarioTrack.style.position =
        "absolute";

    cenarioTrack.style.left =
        "0";

    cenarioTrack.style.top =
        "0";

    cenarioTrack.style.width =
        "200%";

    cenarioTrack.style.height =
        "100%";

    cenarioTrack.style.display =
        "flex";

    cenarioTrack.style.pointerEvents =
        "none";

    cenarioTrack.style.zIndex =
        "1";


    /*
       CENÁRIO 1
    */

    const cenario1 =
        document.createElement(
            "div"
        );


    cenario1.className =
        "voa-cenario-painel";


    cenario1.style.position =
        "relative";

    cenario1.style.width =
        "50%";

    cenario1.style.height =
        "100%";

    cenario1.style.flex =
        "0 0 50%";

    cenario1.style.overflow =
        "hidden";


    /*
       CENÁRIO 2
    */

    const cenario2 =
        document.createElement(
            "div"
        );


    cenario2.className =
        "voa-cenario-painel";


    cenario2.style.position =
        "relative";

    cenario2.style.width =
        "50%";

    cenario2.style.height =
        "100%";

    cenario2.style.flex =
        "0 0 50%";

    cenario2.style.overflow =
        "hidden";


    /*
       Colocar os elementos originais
       no primeiro cenário.
    */

    elementosOriginais.forEach(
        elemento => {

            cenario1.appendChild(
                elemento
            );

        }
    );

const arvores =
    cenario1.querySelector(".park-trees");

if (arvores) {
    arvores.style.display = "none";
}
   
    /*
       Criar cópia do cenário.
    */

    elementosOriginais.forEach(
        elemento => {

            const copia =
                elemento.cloneNode(true);

            cenario2.appendChild(
                copia
            );

        }
    );


    /*
       Adicionar os dois painéis.
    */

    cenarioTrack.appendChild(
        cenario1
    );

    cenarioTrack.appendChild(
        cenario2
    );


    /*
       Colocar a pista dentro do SKY.
    */

    skyElement.appendChild(
        cenarioTrack
    );


    


    cenarioPreparado =
        true;

}


/* =========================================
   DIFERENÇA DO SEGUNDO CENÁRIO
========================================= */

function diferenciarSegundoCenario(
    cenario
) {

    const cloud1 =
        cenario.querySelector(
            ".cloud-1"
        );

    if (cloud1) {

        cloud1.style.left =
            "28%";

    }


    const cloud2 =
        cenario.querySelector(
            ".cloud-2"
        );

    if (cloud2) {

        cloud2.style.right =
            "12%";

    }


    const cloud3 =
        cenario.querySelector(
            ".cloud-3"
        );

    if (cloud3) {

        cloud3.style.left =
            "62%";

    }


    const trees =
    cenario.querySelector(
        ".park-trees"
    );

if (trees) {

    trees.style.display =
        "none";

}


    

}


/* =========================================
   MOVIMENTO INFINITO DO CENÁRIO
========================================= */

function iniciarMovimentoCenario() {
    prepararCenarioInfinito();

    const flight = document.querySelector(".flight");
    const track = document.querySelector(".voa-cenario-track");

    if (!flight || !track) {
        console.error("Cenário não encontrado.");
        return;
    }

    const paineis = track.querySelectorAll(".voa-cenario-painel");

    if (paineis.length < 2) {
        console.error("Painéis do cenário não encontrados.");
        return;
    }

    const largura = flight.clientWidth;

    if (!largura) {
        console.error("Largura do voo inválida.");
        return;
    }

    track.style.width = (largura * 2) + "px";

    paineis.forEach((painel, index) => {
        painel.style.position = "absolute";
        painel.style.top = "0";
        painel.style.width = largura + "px";
        painel.style.height = "100%";
        painel.style.left = (index * largura) + "px";
    });

    let deslocamento = 0;
    let ultimoTempo = performance.now();

    if (cenarioAnimacao) {
        cancelAnimationFrame(cenarioAnimacao);
    }

    function moverCenario(tempo) {
        if (!vooAtivo || estadoVoo !== "voando") {
            cenarioAnimacao = null;
            return;
        }

        const delta = tempo - ultimoTempo;
        ultimoTempo = tempo;

        /* =========================================
   VELOCIDADE DINÂMICA
   Quanto maior o multiplicador,
   mais rápido o cenário passa.
========================================= */

const velocidadeBase = 0.025;

const velocidadeExtra =
    Math.min(
        multiplicador * 0.012,
        0.16
    );

const velocidadeCenario =
    velocidadeBase +
    velocidadeExtra;

deslocamento +=
    delta * velocidadeCenario;

        if (deslocamento >= largura) {
    deslocamento = deslocamento - largura;
}
        track.style.transform =
            `translate3d(${-deslocamento}px, 0, 0)`;

      
        cenarioAnimacao = requestAnimationFrame(moverCenario);
    }

    cenarioAnimacao = requestAnimationFrame(moverCenario);
}


/* =========================================
   PARAR CENÁRIO
========================================= */

function pararMovimentoCenario() {
    if (cenarioAnimacao) {
        cancelAnimationFrame(cenarioAnimacao);
        cenarioAnimacao = null;
    }

    const track = document.querySelector(".voa-cenario-track");

    if (track) {
        track.style.transform = "translate3d(0, 0, 0)";
    }
}


/* =========================================
   PLUS
========================================= */

plusButton.addEventListener(
    "click",
    () => {

        let valor =
            Number(
                betAmountElement.value
            );

        valor += 100;

        betAmountElement.value =
            valor;

    }
);


/* =========================================
   MINUS
========================================= */

minusButton.addEventListener(
    "click",
    () => {

        let valor =
            Number(
                betAmountElement.value
            );

        valor -= 100;

        if (valor < 100) {

            valor = 100;

        }

        betAmountElement.value =
            valor;

    }
);


/* =========================================
   APOSTAR
========================================= */

betButton.addEventListener(
    "click",
    () => {

        if (apostaFeita) {

            return;

        }


        if (!vooAtivo) {

            betStatus.textContent =
                "Aguarda a águia levantar voo.";

            return;

        }


        const valor =
            Number(
                betAmountElement.value
            );


        if (!valor || valor < 100) {

            betStatus.textContent =
                "A aposta mínima é 100 Kz.";

            return;

        }


        if (valor > saldo) {

            betStatus.textContent =
                "Saldo insuficiente.";

            return;

        }


        saldo -= valor;

        valorAposta =
            valor;

        apostaFeita =
            true;

        apostaRetirada =
            false;


        atualizarSaldo();


        betButton.textContent =
            "APOSTA FEITA ✓";

        betButton.style.background =
            "#31c96b";


        cashoutButton.disabled =
            false;


        betStatus.textContent =
            "Aposta ativa em " +
            valor.toLocaleString("pt-AO") +
            " Kz";

    }
);


/* =========================================
   CASH OUT
========================================= */

cashoutButton.addEventListener(
    "click",
    retirarAposta
);


function retirarAposta() {

    if (!vooAtivo) {

        return;

    }


    if (!apostaFeita) {

        return;

    }


    if (apostaRetirada) {

        return;

    }


    apostaRetirada =
        true;


    const ganho =
        Math.floor(
            valorAposta *
            multiplicador
        );


    saldo += ganho;

    atualizarSaldo();


    betStatus.textContent =
        "Retiraste " +
        ganho.toLocaleString("pt-AO") +
        " Kz em " +
        multiplicador.toFixed(2) +
        "x";


    cashoutButton.disabled =
        true;

    cashoutButton.textContent =
        "RETIRADO ✓";

    cashoutButton.style.background =
        "#555";

}


/* =========================================
   AUTO CASHOUT
========================================= */

function verificarAutoCashout() {

    if (!apostaFeita) {

        return;

    }


    if (apostaRetirada) {

        return;

    }


    const alvo =
        Number(
            autoCashoutElement.value
        );


    if (!alvo || alvo <= 1) {

        return;

    }


    if (
        multiplicador >= alvo
    ) {

        retirarAposta();

    }

}


/* =========================================
   FASE DE DESCOLAGEM
========================================= */

function animarDescolagem(timestamp) {

    if (!vooAtivo) {

        return;

    }


    if (!tempoDescolagem) {

        tempoDescolagem =
            timestamp;

    }


    const tempo =
        timestamp -
        tempoDescolagem;


    const duracao =
        2200;


    let progresso =
        tempo / duracao;


    if (progresso > 1) {

        progresso = 1;

    }


    moverAguiaDuranteDescolagem(
        progresso
    );


    /*
       Ainda não existe multiplicador.
    */

    multiplicador =
        1.00;

    atualizarMultiplicador();


    statusElement.textContent =
        "A águia está a levantar voo...";


    /*
       Quando chega ao alto,
       começa o verdadeiro voo.
    */

    if (progresso >= 1) {

        iniciarVooAlto();

        return;

    }


    animationFrame =
        requestAnimationFrame(
            animarDescolagem
        );

}


/* =========================================
   INICIAR VOO ALTO
========================================= */

function iniciarVooAlto() {

    estadoVoo =
        "voando";


    inicioVoo =
        performance.now();


    multiplicador =
        1.00;


    atualizarMultiplicador();


    /*
       Posicionar exatamente
       no início da trajetória.
    */

    eagleElement.style.setProperty(
        "left",
        VOO_INICIO_X + "%",
        "important"
    );


    eagleElement.style.setProperty(
    "top",
    VOO_INICIO_Y + "%",
    "important"
);


    eagleElement.style.setProperty(
        "transform",
        `translate(-50%, -50%)
         rotate(-7deg)
         scale(1.03)`,
        "important"
    );


    /*
       Criar e mostrar gráfico.
    */

    criarGraficoVoo();

    limparGraficoVoo();

    mostrarGraficoVoo();


    /*
       Começar cenário.
    */

    iniciarMovimentoCenario();
iniciarParticulasVento();

    statusElement.textContent =
        "A águia está a voar!";


    betStatus.textContent =
        "Aposta disponível.";


    /*
       Duração aleatória.
    */

    fimVoo =
        9000 +
        Math.random() * 9000;


    animationFrame =
        requestAnimationFrame(
            animarVoo
        );

}

/* =========================================
   CRIAR GRÁFICO DE VOO
========================================= */

function criarGraficoVoo() {

    const flight =
        document.querySelector(".flight");

    if (!flight) return;


    /*
       Se já existir, não cria novamente.
    */

    if (flightGraph) return;


    /*
       Criar SVG.
    */

    flightGraph =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );


    flightGraph.setAttribute(
        "id",
        "voaFlightGraph"
    );


    flightGraph.setAttribute(
        "viewBox",
        "0 0 100 100"
    );


    flightGraph.setAttribute(
        "preserveAspectRatio",
        "none"
    );


    /*
       Brilho da trajetória.
    */

    flightGlow =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );


    flightGlow.setAttribute(
        "id",
        "voaFlightGlow"
    );


    /*
       Linha principal.
    */

    flightPath =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );


    flightPath.setAttribute(
        "id",
        "voaFlightPath"
    );


    /*
       Ponto da águia.
    */

    flightDot =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );


    flightDot.setAttribute(
        "id",
        "voaFlightDot"
    );


    flightDot.setAttribute(
        "r",
        "0.9"
    );


    flightGraph.appendChild(
        flightGlow
    );


    flightGraph.appendChild(
        flightPath
    );


    flightGraph.appendChild(
        flightDot
    );


    flight.appendChild(
        flightGraph
    );

}


/* =========================================
   LIMPAR GRÁFICO
========================================= */

function limparGraficoVoo() {

    pontosVoo = [];


    if (!flightPath) return;


    flightPath.setAttribute(
        "points",
        ""
    );


    flightGlow.setAttribute(
        "points",
        ""
    );


    flightDot.setAttribute(
        "cx",
        VOO_INICIO_X
    );


    flightDot.setAttribute(
        "cy",
        VOO_INICIO_Y
    );

}


/* =========================================
   ATUALIZAR GRÁFICO
========================================= */

function atualizarGraficoVoo(x, y) {

    if (!flightPath || !flightGlow || !flightDot) {
        return;
    }

    pontosVoo.push({
        x: x,
        y: y
    });

    if (pontosVoo.length > 240) {
        pontosVoo.shift();
    }

    const pontos = pontosVoo
        .map(p => `${p.x},${p.y}`)
        .join(" ");

    flightPath.setAttribute(
        "points",
        pontos
    );

    flightGlow.setAttribute(
        "points",
        pontos
    );

    flightDot.setAttribute(
        "cx",
        x
    );

    flightDot.setAttribute(
        "cy",
        y
    );
}

/* =========================================
   ESCONDER GRÁFICO
========================================= */

function esconderGraficoVoo() {

    if (!flightGraph) return;

    flightGraph.style.opacity = "0";

}


/* =========================================
   MOSTRAR GRÁFICO
========================================= */

function mostrarGraficoVoo() {

    if (!flightGraph) return;

    flightGraph.style.opacity = "1";

}

/* =========================================
   VOO CRESCENTE
========================================= */

function animarVoo(timestamp) {

    if (!vooAtivo) {

        return;

    }


    if (
        estadoVoo !==
        "voando"
    ) {

        return;

    }


    /*
       Tempo desde o início
       do voo verdadeiro.
    */

    const tempoVoo =
        (
            timestamp -
            inicioVoo
        ) / 1000;


    /*
       Progresso da rodada.

       0 = início
       1 = final
    */

    const progresso =
        Math.min(
            tempoVoo /
            (fimVoo / 1000),
            1
        );


    /* =====================================
       MULTIPLICADOR
    ====================================== */

    multiplicador =
        1 +
        (tempoVoo * 0.45) +
        (tempoVoo * tempoVoo * 0.035);


    atualizarMultiplicador();


    verificarAutoCashout();


   /* =========================================
   TRAJETÓRIA LIGADA AO MULTIPLICADOR
   ========================================= */

const progressoCurva = Math.min(
    progresso,
    1
);

/*
   Movimento horizontal.
   A águia avança continuamente.
*/
const x =
    VOO_INICIO_X +
    ((VOO_FIM_X - VOO_INICIO_X) * progresso);

/*
   A subida acelera progressivamente.
   No início sobe pouco.
   Depois ganha altitude.
*/
const curvaAltitude =
    Math.pow(progressoCurva, 0.72);

const y =
    VOO_INICIO_Y -
    (
        (VOO_INICIO_Y - VOO_FIM_Y) *
        curvaAltitude
    );

const oscilacaoY =
    Math.sin(tempoVoo * 2.4) * 1.2;

const posicaoY =
    y + oscilacaoY;

ultimaPosicaoX = x;
ultimaPosicaoY = posicaoY;
   
    /* =====================================
       INCLINAÇÃO
    ====================================== */

    /*
       Inclina para cima
       e acompanha o movimento.
    */

    const inclinacao =
        -8 +
        (
            Math.sin(
                tempoVoo * 2.2
            ) * 3
        );


    /*
       Pequena variação de escala.
    */

    const escala =
        1.03 +
        (
            Math.sin(
                tempoVoo * 2
            ) * 0.015
        );


    /* =====================================
       APLICAR POSIÇÃO DA ÁGUIA
    ====================================== */

    eagleElement.style.setProperty(
        "left",
        x + "%",
        "important"
    );


    eagleElement.style.setProperty(
    "top",
    posicaoY + "%",
    "important"
);


    eagleElement.style.setProperty(
        "transform",
        `translate(-50%, -50%)
         rotate(${inclinacao}deg)
         scale(${escala})`,
        "important"
    );


    /* =====================================
       GRÁFICO
    ====================================== */

    atualizarGraficoVoo(
    x,
    posicaoY
);


    /* =====================================
       FINALIZAR RODADA
    ====================================== */

    if (
        timestamp -
        inicioVoo >=
        fimVoo
    ) {

        iniciarQueda();

        return;

    }


    animationFrame =
        requestAnimationFrame(
            animarVoo
        );

}

/* =========================================
   INICIAR RODADA
========================================= */

function iniciarVoo() {

    if (vooAtivo) {

        return;

    }


    vooAtivo =
        true;


    estadoVoo =
        "preparando";


    multiplicador =
        1.00;


    apostaFeita =
        false;


    apostaRetirada =
        false;


    tempoPreparacao =
        0;


    tempoDescolagem =
        0;


   pararMovimentoCenario();

colocarAguiaNoChao();

criarGraficoVoo();

limparGraficoVoo();

esconderGraficoVoo();

    /*
       Primeiro:
       águia parada no chão.
    */

    statusElement.textContent =
        "A águia está no chão...";


    betStatus.textContent =
        "A águia está a preparar-se.";


    betButton.textContent =
        "APOSTAR";


    betButton.style.background =
        "";


    cashoutButton.disabled =
        true;


    cashoutButton.textContent =
        "RETIRAR";


    cashoutButton.style.background =
        "";


    /*
       Começa a bater as asas.
    */

    iniciarBatimentoAsas();


    /*
       Fica alguns segundos
       a bater as asas no chão.
    */

    timerPreparacao =
        setTimeout(
            () => {

                if (!vooAtivo) {

                    return;

                }


                iniciarDescolagem();

            },
            2500
        );

}


/* =========================================
   INICIAR DESCOLAGEM
========================================= */

function iniciarDescolagem() {

    if (!vooAtivo) {

        return;

    }


    estadoVoo =
        "descolando";


    tempoDescolagem =
        0;


    statusElement.textContent =
        "A águia está a levantar voo...";


    betStatus.textContent =
        "Aguarda a águia chegar ao alto.";


    /*
       Continua a bater as asas
       durante a subida.
    */

    iniciarBatimentoAsas();


    animationFrame =
        requestAnimationFrame(
            animarDescolagem
        );

}


/* =========================================
   INICIAR QUEDA
========================================= */

function iniciarQueda() {

   pararParticulasVento();
   
    if (!vooAtivo) {

        return;

    }


    estadoVoo =
        "caindo";


    /*
       Para o cenário.
    */

    pararMovimentoCenario();


    /*
       Para a animação principal.
    */

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame =
            null;

    }


    /*
       Multiplicador fica congelado
       no valor final.
    */

    atualizarMultiplicador();


    statusElement.textContent =
        "VOO TERMINOU";


    /*
       Continua a bater as asas
       durante a queda.
    */

    iniciarBatimentoAsas();


    tempoQuedaInicio =
        0;


    requestAnimationFrame(
        animarQueda
    );

}


/* =========================================
   QUEDA
========================================= */

function animarQueda(timestamp) {

    if (
        estadoVoo !==
        "caindo"
    ) {

        return;

    }


    if (!tempoQuedaInicio) {

        tempoQuedaInicio =
            timestamp;

    }


    const duracao =
        1800;


    const tempo =
        timestamp -
        tempoQuedaInicio;


    let progresso =
        tempo / duracao;


    if (progresso > 1) {

        progresso = 1;

    }


    /*
       Começa exatamente
       onde a águia terminou o voo.
    */

    const suavizado =
        progresso *
        progresso;


    const posicaoInicial =
        ultimaPosicaoY;


    const posicaoFinal =
        POSICAO_CHAO;


    const posicao =
        posicaoInicial +
        (
            (posicaoFinal -
            posicaoInicial) *
            suavizado
        );


    /*
       Durante a queda,
       a águia continua no lado
       onde terminou o voo.
    */

    const posicaoX =
        ultimaPosicaoX +
        (
            Math.sin(
                progresso * Math.PI
            ) * 2
        );


    /*
       Vai inclinando o corpo
       enquanto cai.
    */

    const inclinacao =
        -4 +
        (
            suavizado * 24
        );


    const escala =
        1.03 -
        (
            suavizado * 0.03
        );


    eagleElement.style.setProperty(
        "left",
        posicaoX + "%",
        "important"
    );


    eagleElement.style.setProperty(
        "top",
        posicao + "%",
        "important"
    );


    eagleElement.style.setProperty(
        "transform",
        `translate(-50%, -50%)
         rotate(${inclinacao}deg)
         scale(${escala})`,
        "important"
    );


    if (
        progresso >= 1
    ) {

        finalizarQueda();

        return;

    }


    requestAnimationFrame(
        animarQueda
    );

}


/* =========================================
   FINALIZAR QUEDA
========================================= */

function finalizarQueda() {

    tempoQuedaInicio =
        0;


    vooAtivo =
        false;


    estadoVoo =
        "chao";


    colocarAguiaNoChao();


    pararBatimentoAsas();


    /*
       Se apostou e não retirou:
       perdeu a aposta.
    */

    if (
        apostaFeita &&
        !apostaRetirada
    ) {

        betStatus.textContent =
            "VOO TERMINOU — aposta perdida.";

    }


    statusElement.textContent =
        "A águia voltou ao chão.";


    adicionarHistorico(
        multiplicador
    );


    /*
       Próxima rodada.
    */

    timerQueda =
        setTimeout(
            prepararNovoVoo,
            3500
        );

}


/* =========================================
   PREPARAR NOVO VOO
========================================= */

function prepararNovoVoo() {

    multiplicador =
        1.00;


    atualizarMultiplicador();


    colocarAguiaNoChao();


    statusElement.textContent =
        "A águia está no chão...";


    betStatus.textContent =
        "Prepara a tua aposta.";


    /*
       Pequena pausa antes
       de começar novamente.
    */

    setTimeout(
        iniciarVoo,
        1800
    );

}


/* =========================================
   HISTÓRICO
========================================= */

function adicionarHistorico(valor) {

    const item =
        document.createElement("span");


    item.textContent =
        valor.toFixed(2) + "x";


    if (valor >= 2) {

        item.classList.add(
            "gold"
        );

    }


    historyElement.prepend(
        item
    );


    while (
        historyElement.children.length >
        12
    ) {

        historyElement.removeChild(
            historyElement.lastElementChild
        );

    }

}


/* =========================================
   INICIALIZAÇÃO
========================================= */

atualizarSaldo();

atualizarMultiplicador();

colocarAguiaNoChao();

pararBatimentoAsas();

pararMovimentoCenario();


statusElement.textContent =
    "A águia está no chão...";


betStatus.textContent =
    "Aguarda a próxima rodada.";


/*
   Primeira rodada.
*/

setTimeout(
    iniciarVoo,
    2500
);
