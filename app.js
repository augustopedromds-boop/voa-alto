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
   POSIÇÕES DA ÁGUIA
========================================= */

const POSICAO_CHAO = 78;

const POSICAO_ALTA = 42;


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
   MOVER ÁGUIA DURANTE DESCOLAGEM
========================================= */

function moverAguiaDuranteDescolagem(progresso) {

    if (!eagleElement) return;

    const inicio =
        POSICAO_CHAO;

    const fim =
        POSICAO_ALTA;

    /*
       Suavização:
       começa devagar,
       acelera,
       termina suavemente.
    */

    const suavizado =
        progresso *
        progresso *
        (3 - 2 * progresso);

    const posicao =
        inicio -
        (
            (inicio - fim) *
            suavizado
        );

    const inclinacao =
        -3 -
        (suavizado * 8);

    const escala =
        1 +
        (suavizado * 0.03);

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
        );


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


    /*
       Pequenas diferenças no segundo cenário.
    */

    diferenciarSegundoCenario(
        cenario2
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

        trees.style.transform =
            "translateX(70px)";

    }


    const mountainsBack =
        cenario.querySelector(
            ".mountains-back"
        );

    if (mountainsBack) {

        mountainsBack.style.left =
            "8%";

    }


    const mountainsFront =
        cenario.querySelector(
            ".mountains-front"
        );

    if (mountainsFront) {

        mountainsFront.style.left =
            "4%";

    }

}


/* =========================================
   INICIAR MOVIMENTO DO FUNDO
========================================= */

function iniciarMovimentoCenario() {

    if (!skyElement) return;


    prepararCenarioInfinito();


    /*
       Parar animação anterior.
    */

    if (cenarioAnimacao) {

        cenarioAnimacao.cancel();

        cenarioAnimacao =
            null;

    }


    /*
       Garantir posição inicial.
    */

    cenarioTrack.style.transform =
        "translateX(0)";


    /*
       MOVIMENTO CONTÍNUO:
       
       0%
       ↓
       -50%
       ↓
       reinicia
       ↓
       -50%
       ↓
       reinicia...

       Sempre para a ESQUERDA.
    */

    cenarioAnimacao =
        cenarioTrack.animate(
            [
                {
                    transform:
                        "translateX(0%)"
                },

                {
                    transform:
                        "translateX(-50%)"
                }
            ],
            {
                duration: 7000,
                iterations: Infinity,
                direction: "normal",
                easing: "linear",
                fill: "none"
            }
        );

}


/* =========================================
   PARAR MOVIMENTO DO FUNDO
========================================= */

function pararMovimentoCenario() {

    if (cenarioAnimacao) {

        cenarioAnimacao.cancel();

        cenarioAnimacao =
            null;

    }


    if (cenarioTrack) {

        cenarioTrack.style.transform =
            "translateX(0%)";

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
   INICIAR VOO NO ALTO
========================================= */

function iniciarVooAlto() {

    estadoVoo =
        "voando";


    inicioVoo =
        performance.now();


    multiplicador =
        1.00;


    atualizarMultiplicador();


    colocarAguiaNoAlto();


    /*
       Agora sim:
       começa a sensação de voo.
    */

    iniciarMovimentoCenario();


    statusElement.textContent =
        "A águia está a voar!";


    betStatus.textContent =
        "Aposta disponível.";


    /*
       Duração do voo verdadeiro.
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
   VOO
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


    const tempoVoo =
        (
            timestamp -
            inicioVoo
        ) / 1000;


    /*
       Multiplicador
    */

    multiplicador =
        1 +
        (tempoVoo * 0.45) +
        (tempoVoo * tempoVoo * 0.035);


    atualizarMultiplicador();


    verificarAutoCashout();


    /*
       A águia NÃO continua a subir.
       Fica no alto.
    */

    const pequenaOscilacao =
        Math.sin(
            tempoVoo * 2.4
        ) * 2;


    eagleElement.style.setProperty(
        "top",
        (POSICAO_ALTA + pequenaOscilacao) + "%",
        "important"
    );


    const inclinacao =
        -4 +
        Math.sin(
            tempoVoo * 2
        ) * 3;


    eagleElement.style.setProperty(
        "transform",
        `translate(-50%, -50%)
         rotate(${inclinacao}deg)
         scale(1.03)`,
        "important"
    );


    /*
       Finalizar voo
    */

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


    atualizarMultiplicador();


    pararMovimentoCenario();


    colocarAguiaNoChao();


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
       Queda suave no início
       e mais rápida depois.
    */

    const suavizado =
        progresso *
        progresso;


    const posicaoInicial =
        POSICAO_ALTA;


    const posicaoFinal =
        POSICAO_CHAO;


    const posicao =
        posicaoInicial +
        (
            (posicaoFinal -
            posicaoInicial) *
            suavizado
        );


    const inclinacao =
        -4 +
        (suavizado * 20);


    const escala =
        1.03 -
        (suavizado * 0.03);


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


    if (progresso >= 1) {

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
