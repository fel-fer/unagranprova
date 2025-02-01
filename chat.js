// Stato della conversazione (per gestire le sottocategorie)
let statoConversazione = null;
let database = null;

// Funzione per normalizzare il testo (rimuove accenti, punteggiatura e converte in minuscolo)
function normalizzaTesto(testo) {
    return testo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// Funzione per cercare corrispondenze nelle parole chiave
function cercaKeywords(domandaNormalizzata, items) {
    for (const item of items) {
        if (item.keywords) {
            for (const keyword of item.keywords) {
                if (domandaNormalizzata.includes(keyword)) {
                    return item;
                }
            }
        }
    }
    return null;
}

// Funzione per trovare la risposta migliore
function trovaRisposta(domanda) {
    const domandaNormalizzata = normalizzaTesto(domanda);

    // Se c'è uno stato attivo (sottocategorie), cerca solo in quelle
    if (statoConversazione) {
        for (const item of statoConversazione) {
            if (new RegExp(item.pattern, "i").test(domandaNormalizzata)) {
                if (item.tipo === "diretta") {
                    statoConversazione = null; // Resetta lo stato
                    return item.risposta;
                } else if (item.tipo === "complessa") {
                    statoConversazione = item.sottocategorie || [];
                    return item.risposta;
                }
            }
        }

        // Se non trova una corrispondenza esatta, cerca nelle parole chiave
        const itemCorrispondente = cercaKeywords(domandaNormalizzata, statoConversazione);
        if (itemCorrispondente) {
            if (itemCorrispondente.tipo === "diretta") {
                statoConversazione = null; // Resetta lo stato
                return itemCorrispondente.risposta;
            } else if (itemCorrispondente.tipo === "complessa") {
                statoConversazione = itemCorrispondente.sottocategorie || [];
                return itemCorrispondente.risposta;
            }
        }

        // Se non trova nulla, resetta lo stato
        statoConversazione = null;
        return "Vè, a j'ó mía capî tant bèin. Pōt turnêr'l a dîr?";
    }

    // Se non c'è uno stato attivo, cerca nelle domande principali
    for (const item of database.domande) {
        if (new RegExp(item.pattern, "i").test(domandaNormalizzata)) {
            if (item.tipo === "diretta") {
                return item.risposta;
            } else if (item.tipo === "complessa") {
                statoConversazione = item.sottocategorie || [];
                return item.risposta;
            }
        }
    }

    // Se non trova una corrispondenza esatta, cerca nelle parole chiave
    const itemCorrispondente = cercaKeywords(domandaNormalizzata, database.domande);
    if (itemCorrispondente) {
        if (itemCorrispondente.tipo === "diretta") {
            return itemCorrispondente.risposta;
        } else if (itemCorrispondente.tipo === "complessa") {
            statoConversazione = itemCorrispondente.sottocategorie || [];
            return itemCorrispondente.risposta;
        }
    }

    // Se non trova nulla, restituisci una risposta generica
    return "Vè, a j'ó mía capî tant bèin. Pōt turnêr'l a dîr?";
}



// Funzione per gestire l'invio del messaggio
function inviaMessaggio() {
    const inputUtente = document.getElementById("userInput").value;
    const chatbox = document.getElementById("chatbox");

    if (!inputUtente) return;

    // Mostra il messaggio dell'utente (a destra)
    chatbox.innerHTML += `<div class="user-message"><strong>Tu:</strong> ${inputUtente}</div>`;

    // Trova la risposta
    const risposta = trovaRisposta(inputUtente);

    // Mostra la risposta del bot (a sinistra)
    chatbox.innerHTML += `<div class="bot-message"><strong>Bot:</strong> ${risposta}</div>`;

    // Pulisci l'input e scrolla la chat
    document.getElementById("userInput").value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
}


// Carica il file JSON esterno
fetch("chat.json") // Assicurati che il percorso sia corretto
    .then((response) => response.json())
    .then((data) => {
        database = data; // Salva il database in una variabile globale
        console.log("Database caricato con successo!");
    })
    .catch((error) => {
        console.error("Errore nel caricamento del database:", error);
    });

// Gestisci l'invio con "Invio"
document.getElementById("userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") inviaMessaggio();
});