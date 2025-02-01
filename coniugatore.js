// Carica i dati dal file JSON
fetch('verbi.json')
  .then(response => response.json())
  .then(data => {
    const verbi = data.verbi;
    const irregolari = data.irregolari;

    // Elementi del DOM
    const nomeVerbo = document.getElementById('nomeVerbo');
    const verboInput = document.getElementById('verbo-input');
    const risultatoDiv = document.getElementById('risultato');
    const coniugaBtn = document.getElementById('coniuga-btn');

    // Ausiliari essere e avere
    const ausiliari = {
      "esser": {
        presente: ["sûn", "ē", "ē", "sòm", "sî", "sûn"], 
        passatoProssimo: ["sûn stê", "ē stê", "ē stê", "sòm stê", "sî stê", "sûn stê"],
        imperfetto: ["j'ēra", "ēr", "ēra", "j'ēren", "j'ēri", "j'ēren"],
        trapassatoProssimo: ["j'ēra stê", "ēr stê", "ēra stê", "j'ēren stê", "j'ēri stê", "j'ēren stê"],
        futuro: ["sró", "asrê", "srà", "sròm", "srî", "srân"],
        futuroAnteriore: ["sró stê", "asrê stê", "srà stê", "sròm stê", "srî stê", "srân stê"],
        condizionale: ["sré", "asrés", "sré", "srén", "srési", "srén"],
        condizionalePassato: ["sré stê", "asrés stê", "sré stê", "srén stê", "srési stê", "srén stê"],
        congiuntivoPresente: ["sía", "sía", "sía", "sòma", "sîdi", "síen"],
        congiuntivoPassato: ["sía stê", "sèi stê", "sía stê", "sòma stê", "sîdi stê", "síen stê"],
        congiuntivoImperfetto: ["fós", "fós", "fós", "fósen", "fósi", "fósen"],
        congiuntivoTrapassato: ["fós stê", "fós stê", "fós stê", "fósen stê", "fósi stê", "fósen stê"],
        participio: "stê"
      },
      "aveir": {
        presente: ["j'ó", "ê", "à", "j'òm", "î", "j'ân"],
        passatoProssimo: ["j'ó avû", "ê avû", "à avû", "j'òm avû", "î avû", "j'ân avû"],
        imperfetto: ["iva", "iv", "iva", "îven", "îvi", "îven"],
        trapassatoProssimo: ["iva avû", "iv avû", "iva avû", "îven avû", "îvi avû", "îven avû"],
        futuro: ["aró", "arê", "arà","aròm", "arî", "arân"],
        futuroAnteriore: ["aró avû", "arê avû", "arà avû","aròm avû", "arî avû", "arân avû"],
        condizionale: ["aré", "arés", "aré", "arén", "arési", "arén"],
        condizionalePassato: ["aré avû", "arés avû", "aré avû", "arén avû", "arési avû", "arén avû"],
        congiuntivoPresente: ["âbia", "âbi", "âbia", "j'òma", "j'îdi", "j'âbien"],
        congiuntivoPassato: ["âbia avû", "âbi avû", "âbia avû", "j'òma avû", "j'îdi avû", "j'âbien avû"],
        congiuntivoImperfetto: ["és", "és", "és", "ésen", "ési", "ésen"],
        congiuntivoTrapassato: ["és avû", "és avû", "és avû", "ésen avû", "ési avû", "ésen avû"],
        participio: "avû"
      }
    };

    // Configurazione delle desinenze
    const desinenze = {
      presente: {
        êr: ["", "", "a", "òmm", "êv", "en"],
        er: ["", "", "", "òmm", "îv", "en"],
        èir: ["", "", "", "òmm", "îv", "en"],
        îr: ["és", "és", "és", "òmm", "îv", "ésen"]
      },
      futuro: {
        êr: ["arò", "arê", "arà", "aròm", "arî", "arân"],
        er: ["rò", "rê", "rà", "ròm", "rî", "rân"],
        èir: ["rò", "rê", "rà", "ròm", "rî", "rân"],
        îr: ["irò", "irê", "irà", "iròm", "irî", "irân"]
      },
      condizionale: {
        êr: ["arés", "arés", "arés", "arén", "arési", "arén"],
        er: ["rés", "rés", "rés", "rén", "rési", "rén"],
        èir: ["rés", "rés", "rés", "rén", "rési", "rén"],
        îr: ["irés", "irés", "irés", "irén", "irési", "irén"]
      },
      imperfetto: {
        êr: ["êva", "êv", "êva", "êven", "êvi", "êven"],
        er: ["îva", "îv", "îva", "îven", "îvi", "îven"],
        èir: ["îva", "îv", "îva", "îven", "îvi", "îven"],
        îr: ["îva", "îv", "îva", "îven", "îvi", "îven"]
      },
      participio: {
        êr: "ê",
        er: "û",
        èir: "û",
        îr: "î"
      }
    };

    // Soggetti per la coniugazione
    const soggetti = ["mé a", "té t’", "ló (a)l’", "nuêter a", "vuêter a", "lōr"];

    // Aggiungi ascoltatori per il pulsante "Coniuga" e il tasto INVIO
    coniugaBtn.addEventListener('click', coniuga);
    verboInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') coniuga();
    });

    // Funzione per normalizzare le stringhe (rimuove accenti e rende tutto minuscolo)
    function normalizzaStringa(str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Rimuove i segni diacritici (es. accenti)
    }

    // Funzione per generare il participio passato
    function generaParticipio(verbo) {

      // Controlla se il participio è già presente nel JSON del verbo
    if (verbo.participio) {
      return verbo.participio;
    }

      const { radiceAtona, terminazione } = verbo;
      const desinenzaParticipio = desinenze.participio[terminazione];

      if (!desinenzaParticipio) {
        console.error("Terminazione non supportata per il participio:", terminazione);
        return "";
      }

      // Il participio si forma con la radice atona + la desinenza del participio
      return radiceAtona + desinenzaParticipio;
    }

    // Funzione generica per creare una coniugazione
    function creaConiugazione(radiceAtona, radiceTonica, desinenze, usaRadiceTonica) {
      return soggetti.map((soggetto, index) => ({
        soggetto: soggetto,
        verbo: (usaRadiceTonica[index] ? radiceTonica : radiceAtona) + desinenze[index]
      }));
    }


    // Funzione per coniugare il passato prossimo (VERSIONE FINALE)
function coniugaPassatoProssimo(verbo) {
  const ausiliareKey = normalizzaStringa(verbo.ausiliare)
  const ausiliare = ausiliari[ausiliareKey]; // Prende direttamente dall'oggetto ausiliari
  const participio = generaParticipio(verbo);

  if (!ausiliare) {
    console.error("Ausiliare non supportato:", verbo.ausiliare);
    return [];
  }

  return soggetti.map((soggetto, index) => ({
    soggetto: soggetto,
    verbo: `${ausiliare.presente[index]} ${participio}`
  }));
}

// Funzione per coniugare il trapassato prossimo (VERSIONE FINALE)
function coniugaTrapassatoProssimo(verbo) {
  const ausiliareKey = normalizzaStringa(verbo.ausiliare); // Normalizza "Esser" e "Aveir"
  const ausiliare = ausiliari[ausiliareKey]; // Prende l'ausiliare corretto
  const participio = generaParticipio(verbo);

  if (!ausiliare) {
    console.error("Ausiliare non supportato:", verbo.ausiliare);
    return [];
  }

  return soggetti.map((soggetto, index) => ({
    soggetto: soggetto,
    verbo: `${ausiliare.imperfetto[index]} ${participio}`
  }));
}

// Funzione per coniugare il futuro anteriore
function coniugaFuturoAnteriore(verbo) {
  const ausiliareKey = normalizzaStringa(verbo.ausiliare); // Normalizza "Esser" e "Aveir"
  const ausiliare = ausiliari[ausiliareKey]; // Prende l'ausiliare corretto
  const participio = generaParticipio(verbo);

  if (!ausiliare) {
    console.error("Ausiliare non supportato:", verbo.ausiliare);
    return [];
  }

  return soggetti.map((soggetto, index) => ({
    soggetto: soggetto,
    verbo: `${ausiliare.futuro[index]} ${participio}`
  }));
}

// Funzione per coniugare il condizionale passato
function coniugaCondizionalePassato(verbo) {
  const ausiliareKey = normalizzaStringa(verbo.ausiliare); // Normalizza "Esser" e "Aveir"
  const ausiliare = ausiliari[ausiliareKey]; // Prende l'ausiliare corretto
  const participio = generaParticipio(verbo);

  if (!ausiliare) {
    console.error("Ausiliare non supportato:", verbo.ausiliare);
    return [];
  }

  return soggetti.map((soggetto, index) => ({
    soggetto: soggetto,
    verbo: `${ausiliare.condizionale[index]} ${participio}`
  }));
}


    // Funzione per generare l'HTML della coniugazione
    function generaHTML(coniugazione) {
      return coniugazione
        .map(row => `<div class="row"><div class="soggetto">${row.soggetto}</div><div class="verbo">${row.verbo}</div></div>`)
        .join("");
    }

    // Funzione per coniugare un tempo verbale
    function coniugaTempo(verbo, tempo) {
      // Se il verbo è irregolare e ha una coniugazione specifica per il tempo, usala
      if (verbo[tempo]) {
        return soggetti.map((soggetto, index) => ({
          soggetto: soggetto,
          verbo: verbo[tempo][index]
        }));
      }

      // Altrimenti, usa la coniugazione regolare
      const { radiceAtona, radiceTonica, terminazione } = verbo;
      const desinenzeTempo = desinenze[tempo][terminazione];

      if (!desinenzeTempo) {
        console.error("Terminazione non supportata:", terminazione);
        return [];
      }

      // Definisce quando usare la radice tonica (solo per il presente indicativo)
      const usaRadiceTonica = tempo === 'presente' ? [true, true, true, false, false, true] : [false, false, false, false, false, false];

      return creaConiugazione(radiceAtona, radiceTonica, desinenzeTempo, usaRadiceTonica);
    }

    // Funzione principale per coniugare il verbo
    function coniuga() {
      const inputVerbo = normalizzaStringa(verboInput.value.trim());

     

// 1. Controllo diretto per ausiliari
if (inputVerbo === normalizzaStringa("esser") || inputVerbo === normalizzaStringa("aveir")) {
  const ausiliare = inputVerbo === normalizzaStringa("esser") ? ausiliari["esser"] : ausiliari["aveir"];

  // Genera tutte le coniugazioni
  const tempi = {
    "Presente indicativo": ausiliare.presente,
    "Passato prossimo": ausiliare.passatoProssimo,
    "Imperfetto indicativo": ausiliare.imperfetto,
    "Trapassato prossimo": ausiliare.trapassatoProssimo,
    "Futuro": ausiliare.futuro,
    "Futuro Anteriore": ausiliare.futuroAnteriore,
    "Condizionale": ausiliare.condizionale,
    "Condizionale Passato": ausiliare.condizionalePassato,
    "Congiuntivo presente": ausiliare.congiuntivoPresente,
    "Congiuntivo imperfetto": ausiliare.congiuntivoImperfetto,
    "Congiuntivo passato": ausiliare.congiuntivoPassato,
    "Congiuntivo trapassato": ausiliare.congiuntivoTrapassato
  };

  // Costruisci l'HTML
  let htmlOutput = "";
  for (const [tempo, coniugazione] of Object.entries(tempi)) {
    htmlOutput += `
      <div class="tempo">
        <h3>${tempo}</h3>
        ${soggetti.map((soggetto, index) => `
          <div class="row">
            <div class="soggetto">${soggetto}</div>
            <div class="verbo">${coniugazione[index]}</div>
          </div>
        `).join("")}
      </div>`;
  }

  // Aggiungi il participio
  htmlOutput += `
    <div class="tempo">
      <h3>Participio</h3>
      <div class="row">
        <div class="soggetto">Participio</div>
        <div class="verbo">${ausiliare.participio}</div>
      </div>
    </div>`;

  nomeVerbo.innerHTML = `<h2>Verbo: ${ausiliare === ausiliari["esser"] ? "èsser" : "avèir"}</h2>`;
  risultatoDiv.innerHTML = htmlOutput;
  return;
}

// 2. Coniugazione normale per altri verbi
// ... (resto del codice invariato)

      
      let verbo = verbi.find(v => normalizzaStringa(v.infinito) === inputVerbo);

      // Cerca anche tra i verbi irregolari
      if (!verbo) {
        verbo = data.irregolari.find(v => normalizzaStringa(v.infinito) === inputVerbo);
      }

      if (!verbo) {
        nomeVerbo.innerHTML = "";
        risultatoDiv.innerHTML = "Verbo non trovato. Assicurati di scrivere correttamente.";
        return;
      }

      nomeVerbo.innerHTML = `<h2>Verbo: ${verbo.infinito}</h2>`;

      // Coniuga i tempi verbali
      const presente = generaHTML(coniugaTempo(verbo, 'presente'));
      const imperfetto = generaHTML(coniugaTempo(verbo, 'imperfetto'));
      const futuro = generaHTML(coniugaTempo(verbo, 'futuro'));
      const condizionale = generaHTML(coniugaTempo(verbo, 'condizionale'));
      const participio = generaParticipio(verbo);

      // Coniuga il passato prossimo e il trapassato prossimo
      const passatoProssimo = generaHTML(coniugaPassatoProssimo(verbo));
      const trapassatoProssimo = generaHTML(coniugaTrapassatoProssimo(verbo));
      const futuroAnteriore = generaHTML(coniugaFuturoAnteriore(verbo));
      const condizionalePassato = generaHTML(coniugaCondizionalePassato(verbo));

      // Mostra le coniugazioni
      risultatoDiv.innerHTML = `
        <div class="tempo">
          <h3>Presèint Indicatîv</h3>
          ${presente}
        </div>
        <div class="tempo">
          <h3>Passê Prôssim</h3>
          ${passatoProssimo}
        </div>
        <div class="tempo">
          <h3>Imperfèt Indicatîv</h3>
          ${imperfetto}
        </div>
        <div class="tempo">
          <h3>Trapassê Prôssim</h3>
          ${trapassatoProssimo}
        </div>
        <div class="tempo">
          <h3>Futûr</h3>
          ${futuro}
        </div>
        <div class="tempo">
          <h3>Futûr Anteriôr</h3>
          ${futuroAnteriore}
        </div>
        <div class="tempo">
          <h3>Condisiunêl</h3>
          ${condizionale}
        </div>
        <div class="tempo">
          <h3>Condisiunêl Passê</h3>
          ${condizionalePassato}
        </div>
        <div class="tempo">
          <h3>Particépi Passê</h3>
          <div class="row"><div class="soggetto"></div><div class="verbo">${participio}</div></div>
        </div>
      `;
    }
  })
  .catch(err => {
    console.error("Errore nel caricamento dei dati:", err);
  });