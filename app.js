```javascript
/* =========================================
   VOA ALTO
   APP.JS
   VERSÃO: CHÃO → DESCOLAGEM → VOO → QUEDA
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

let tempoDescolagem = 0;

let estadoVoo = "chao";


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


/* =========================================
   FORMATAR SALDO
========================================= */

function atualizarSaldo() {

    saldoElement.textContent =
        saldo.toLocaleString("pt-AO") + " Kz";

}


/* =========================================
   FORMATAR MULTIPLICADOR
========================================= */

function atualizarMultiplicador() {

    multiplierElement.textContent =
        multiplicador.toFixed(2) + "x";

}


/* =========================================
   POSIÇÃO DA ÁGUIA
========================================= */

function colocarAguiaNoChao() {

    eagleElement.style.left = "50%";

    eagleElement.style.top = "79%";

    eagleElement.style.transform =
        "translate(-50%, -50%) rotate(0deg)";

}


/* =========================================
   MOVIMENTO DA ÁGUIA
========================================= */

function moverAguia(
    altura,
    inclinacao = -5,
    escala = 1
) {

    eagleElement.style.transform =
        `translate(
            -50%,
            calc(-50% - ${altura}px)
         )
         rotate(${inclinacao}deg)
         scale(${escala})`;

}


/* =========================================
   ALTERAR VALOR DA APOSTA
========================================= */

plusButton.addEventListener("click", () => {

    let valor =
        Number(betAmountElement.value);

    valor += 100;

    betAmountElement.value =
        valor;

});


minusButton.addEventListener("click", () => {

    let valor =
        Number(betAmountElement.value);

    valor -= 100;

    if (valor < 100) {

        valor = 100;

    }

    betAmountElement.value =
        valor;

});


/* =========================================
   APOSTAR
========================================= */

betButton.addEventListener("click", () => {

    if (apostaFeita) {

        return;

    }


    /*
       Não permite apostar
       enquanto a águia está no chão.
    */

    if (!vooAtivo) {

        betStatus.textContent =
            "Aguarda a águia levantar voo.";

        return;

    }


    const valor =
        Number(betAmountElement.value);


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

});


/* =========================================
   RETIRAR
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
   RETIRADA AUTOMÁTICA
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
   ANIMAÇÃO DO VOO
========================================= */

function animarVoo(timestamp) {

    if (!vooAtivo) {

        return;

    }


    if (!inicioVoo) {

        inicioVoo =
            timestamp;

    }


    const tempo =
        (timestamp - inicioVoo) / 1000;


    /* =====================================
       FASE 1 — DESCOLAGEM
    ===================================== */

    if (estadoVoo === "descolando") {

        const progresso =
            Math.min(
                tempo / 2.2,
                1
            );


        /*
           Curva suave para levantar
           do chão.
        */

        const suavizado =
            progresso *
            progresso *
            (3 - 2 * progresso);


        const altura =
            suavizado * 145;


        const inclinacao =
            -8 -
            (suavizado * 7);


        const escala =
            1 +
            (suavizado * 0.05);


        moverAguia(
            altura,
            inclinacao,
            escala
        );


        statusElement.textContent =
            "A águia está a levantar voo...";


        /*
           Ainda não começa
           o multiplicador.
        */

        multiplicador =
            1.00;

        atualizarMultiplicador();


        /*
           Depois de levantar,
           começa o voo verdadeiro.
        */

        if (progresso >= 1) {

            estadoVoo =
                "voando";

            inicioVoo =
                timestamp;

            statusElement.textContent =
                "A águia está a voar!";

        }

    }


    /* =====================================
       FASE 2 — VOO
    ===================================== */

    else if (estadoVoo === "voando") {

        const tempoVoo =
            (timestamp - inicioVoo) / 1000;


        /*
           Multiplicador.
        */

        multiplicador =
            1 +
            (tempoVoo * 0.45) +
            (tempoVoo * tempoVoo * 0.035);


        atualizarMultiplicador();


        verificarAutoCashout();


        /*
           Movimento vertical.
        */

        const subidaBase =
            145;


        const subidaExtra =
            Math.min(
                tempoVoo * 10,
                250
            );


        /*
           Movimento ondulado
           para dar sensação de voo.
        */

        const ondulacao =
            Math.sin(
                tempoVoo * 2.2
            ) * 12;


        const altura =
            subidaBase +
            subidaExtra +
            ondulacao;


        const inclinacao =
            -12 +
            Math.sin(
                tempoVoo * 2
            ) * 4;


        moverAguia(
            altura,
            inclinacao,
            1.03
        );


        /*
           Voo terminou.
        */

        if (
            timestamp - inicioVoo >=
            fimVoo
        ) {

            iniciarQueda();

            return;

        }

    }


    animationFrame =
        requestAnimationFrame(
            animarVoo
        );

}


/* =========================================
   INICIAR VOO
========================================= */

function iniciarVoo() {

    if (vooAtivo) {

        return;

    }


    vooAtivo =
        true;


    estadoVoo =
        "descolando";


    multiplicador =
        1.00;


    apostaFeita =
        false;


    apostaRetirada =
        false;


    inicioVoo =
        0;


    tempoDescolagem =
        0;


    atualizarMultiplicador();


    colocarAguiaNoChao();


    statusElement.textContent =
        "A águia está a preparar-se...";


    betStatus.textContent =
        "Aguarda a descolagem.";


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
       A duração do voo verdadeiro.
    */

    fimVoo =
        9000 +
        Math.random() * 9000;


    /*
       Pequena preparação
       antes de começar a bater asas.
    */

    setTimeout(() => {

        if (!vooAtivo) {

            return;

        }


        statusElement.textContent =
            "A águia está a bater as asas...";


        animationFrame =
            requestAnimationFrame(
                animarVoo
            );

    }, 1000);

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


    statusElement.textContent =
        "A águia está a cair...";


    /*
       Congelar o multiplicador
       no valor final.
    */

    atualizarMultiplicador();


    /*
       Cancelar animação anterior.
    */

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    /*
       Começar queda.
    */

    requestAnimationFrame(
        animarQueda
    );

}


/* =========================================
   ANIMAÇÃO DA QUEDA
========================================= */

function animarQueda(timestamp) {

    const duracaoQueda =
        1800;


    if (!tempoQuedaInicio) {

        tempoQuedaInicio =
            timestamp;

    }


    const tempo =
        timestamp -
        tempoQuedaInicio;


    let progresso =
        tempo /
        duracaoQueda;


    if (progresso > 1) {

        progresso = 1;

    }


    /*
       Suavização.
    */

    const suavizado =
        progresso *
        progresso;


    /*
       Começa alto e vai para o chão.
    */

    const alturaInicial =
        145 +
        Math.min(
            fimVoo / 1000 * 10,
            250
        );


    const altura =
        alturaInicial *
        (1 - suavizado);


    const inclinacao =
        10 +
        suavizado * 18;


    moverAguia(
        altura,
        inclinacao,
        1 -
        suavizado * 0.05
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
   VARIÁVEL DA QUEDA
========================================= */

let tempoQuedaInicio = 0;


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


    /*
       Se havia aposta ativa,
       perdeu quando o voo terminou.
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
       Preparar próxima rodada.
    */

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
       Pequena pausa no chão
       antes da próxima descolagem.
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
```
