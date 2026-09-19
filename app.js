/* =========================================
   VOA ALTO
   APP.JS
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
   ALTERAR VALOR DA APOSTA
========================================= */

plusButton.addEventListener("click", () => {

    let valor =
        Number(betAmountElement.value);

    valor += 100;

    betAmountElement.value = valor;

});


minusButton.addEventListener("click", () => {

    let valor =
        Number(betAmountElement.value);

    valor -= 100;

    if (valor < 100) {

        valor = 100;

    }

    betAmountElement.value = valor;

});


/* =========================================
   APOSTAR
========================================= */

betButton.addEventListener("click", () => {

    if (apostaFeita) {

        return;

    }


    if (!vooAtivo) {

        betStatus.textContent =
            "Aguarda o próximo voo.";

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

    valorAposta = valor;

    apostaFeita = true;

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


    apostaRetirada = true;


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
   VERIFICAR RETIRADA AUTOMÁTICA
========================================= */

function verificarAutoCashout() {

    if (!apostaFeita) {

        return;

    }


    if (apostaRetirada) {

        return;

    }


    const alvo =
        Number(autoCashoutElement.value);


    if (!alvo || alvo <= 1) {

        return;

    }


    if (multiplicador >= alvo) {

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


    /*
       Crescimento progressivo
       do multiplicador.
    */

    multiplicador =
        1 +
        (tempo * 0.45) +
        (tempo * tempo * 0.035);


    atualizarMultiplicador();


    /*
       Verificar retirada automática.
    */

    verificarAutoCashout();


    /*
       Pequeno movimento adicional
       da águia durante o voo.
    */

    const subida =
        Math.min(
            tempo * 2.2,
            130
        );


    const inclinacao =
        -8 +
        Math.sin(tempo * 2) * 3;


    eagleElement.style.transform =
        `translate(-50%, calc(-50% - ${subida}px))
         rotate(${inclinacao}deg)`;


    /*
       Voo continua.
    */

    animationFrame =
        requestAnimationFrame(
            animarVoo
        );

}


/* =========================================
   INICIAR VOO
========================================= */

function iniciarVoo() {

    vooAtivo = true;

    multiplicador = 1.00;

    apostaFeita = false;

    apostaRetirada = false;

    inicioVoo = 0;


    atualizarMultiplicador();


    statusElement.textContent =
        "A águia está a ganhar altitude...";


    betStatus.textContent =
        "Nenhuma aposta nesta rodada.";


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
       A águia começa novamente
       na posição inicial.
    */

    eagleElement.style.transform =
        "translate(-50%, -50%)";


    animationFrame =
        requestAnimationFrame(
            animarVoo
        );


    /*
       A rodada termina depois
       de alguns segundos.
    */

    fimVoo =
        9000 +
        Math.random() * 9000;


    setTimeout(
        terminarVoo,
        fimVoo
    );

}


/* =========================================
   TERMINAR VOO
========================================= */

function terminarVoo() {

    if (!vooAtivo) {

        return;

    }


    vooAtivo = false;


    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }


    /*
       Se o jogador ainda tinha
       uma aposta ativa, perdeu.
    */

    if (
        apostaFeita &&
        !apostaRetirada
    ) {

        betStatus.textContent =
            "VOO TERMINOU — aposta perdida.";

    }


    statusElement.textContent =
        "VOO TERMINOU";


    /*
       Guardar multiplicador
       no histórico.
    */

    adicionarHistorico(
        multiplicador
    );


    /*
       Pequena pausa antes
       do próximo voo.
    */

    setTimeout(
        prepararNovoVoo,
        3500
    );

}


/* =========================================
   NOVO VOO
========================================= */

function prepararNovoVoo() {

    multiplicador = 1.00;

    atualizarMultiplicador();


    statusElement.textContent =
        "A próxima águia vai levantar voo...";


    eagleElement.style.transform =
        "translate(-50%, -50%)";


    /*
       Pequena espera.
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

        item.classList.add("gold");

    }


    historyElement.prepend(item);


    /*
       Limitar histórico.
    */

    while (
        historyElement.children.length > 12
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


setTimeout(
    iniciarVoo,
    2500
);
