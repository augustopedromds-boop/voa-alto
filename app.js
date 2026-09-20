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
   ANIMAÇÃO DAS ASAS
========================================= */

function iniciarBatimentoAsas() {

    if (!eagleSprite) return;

    /*
       Força a animação mesmo com
       animation:none !important
       existente no CSS.
    */

    eagleSprite.style.setProperty(
        "animation",
        "eagle-wings 0.72s steps(1) infinite",
        "important"
    );

}


function pararBatimentoAsas() {

    if (!eagleSprite) return;

    eagleSprite.style.setProperty(
        "animation",
        "none",
        "important"
    );

}


/* =========================================
   MOVIMENTO DO CENÁRIO
========================================= */

function iniciarMovimentoCenario() {

    if (!skyElement) return;

    skyElement.dataset.voando =
        "true";


    /*
       Nuvens
    */

    const cloud1 =
        skyElement.querySelector(".cloud-1");

    const cloud2 =
        skyElement.querySelector(".cloud-2");

    const cloud3 =
        skyElement.querySelector(".cloud-3");


    /*
       Montanhas
    */

    const mountainsBack =
        skyElement.querySelector(".mountains-back");

    const mountainsFront =
        skyElement.querySelector(".mountains-front");


    /*
       Árvores
    */

    const trees =
        skyElement.querySelector(".park-trees");


    /*
       Relva
    */

    const grass =
        skyElement.querySelector(".grass");


    /*
       Criar animações independentes.
    */

    if (cloud1) {

        cloud1._voaAnim =
            cloud1.animate(
                [
                    {
                        left: "12%"
                    },
                    {
                        left: "-15%"
                    }
                ],
                {
                    duration: 9000,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (cloud2) {

        cloud2._voaAnim =
            cloud2.animate(
                [
                    {
                        right: "25%"
                    },
                    {
                        right: "-10%"
                    }
                ],
                {
                    duration: 13000,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (cloud3) {

        cloud3._voaAnim =
            cloud3.animate(
                [
                    {
                        left: "45%"
                    },
                    {
                        left: "10%"
                    }
                ],
                {
                    duration: 11000,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (mountainsBack) {

        mountainsBack._voaAnim =
            mountainsBack.animate(
                [
                    {
                        left: "-5%"
                    },
                    {
                        left: "-18%"
                    }
                ],
                {
                    duration: 8000,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (mountainsFront) {

        mountainsFront._voaAnim =
            mountainsFront.animate(
                [
                    {
                        left: "0%"
                    },
                    {
                        left: "-20%"
                    }
                ],
                {
                    duration: 5000,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (trees) {

        trees._voaAnim =
            trees.animate(
                [
                    {
                        transform: "translateX(0)"
                    },
                    {
                        transform: "translateX(-180px)"
                    }
                ],
                {
                    duration: 3500,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }


    if (grass) {

        grass._voaAnim =
            grass.animate(
                [
                    {
                        transform: "translateX(0)"
                    },
                    {
                        transform: "translateX(-120px)"
                    }
                ],
                {
                    duration: 1800,
                    iterations: Infinity,
                    direction: "alternate",
                    easing: "linear"
                }
            );

    }

}


/* =========================================
   PARAR MOVIMENTO DO CENÁRIO
========================================= */

function pararMovimentoCenario() {

    if (!skyElement) return;

    skyElement.dataset.voando =
        "false";


    const elementos =
        [
            ".cloud-1",
            ".cloud-2",
            ".cloud-3",
            ".mountains-back",
            ".mountains-front",
            ".park-trees",
            ".grass"
        ];


    elementos.forEach(seletor => {

        const elemento =
            skyElement.querySelector(seletor);

        if (
            elemento &&
            elemento._voaAnim
        ) {

            elemento._voaAnim.cancel();

            elemento._voaAnim =
                null;

        }

    });

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
