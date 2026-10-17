# Palestra Tracker – versione pubblicabile con sincronizzazione

Questa cartella contiene la versione "pulita" dell'app (parte vuota, senza lo storico di nessuno) e un piccolo server gratuito su Cloudflare che permette di usare gli stessi dati dal PC e dal telefono.

- `public/` contiene l'app: `index.html`, il manifest e le icone (per installarla come app), il service worker `sw.js` (funziona anche senza internet) e `vendor/` con la libreria per mostrare i PDF.
- `src/worker.js` è il server: conserva solo dati già cifrati dal browser, quindi non può leggerli.
- `wrangler.jsonc` è la configurazione per Cloudflare.

## Prima di cominciare: il backup

Dalla versione che usi adesso (quella sul link di Claude) vai in Altro → Crea backup, copia il testo e salvalo in un file. Ti servirà per portare lo storico nella nuova versione.

## Pubblicazione su Cloudflare

Ti serve un account gratuito su Cloudflare (dash.cloudflare.com) e Node.js installato sul PC. Apri un terminale dentro questa cartella ed esegui:

```
npx wrangler login
npx wrangler kv namespace create VAULT
```

Il secondo comando stampa un identificativo (`id`). Aprilo in `wrangler.jsonc` e sostituisci `INCOLLA_QUI_L_ID_DI_KV` con quell'id. Poi pubblica:

```
npx wrangler deploy
```

La prima volta Cloudflare ti chiede di scegliere un sottodominio `workers.dev`. Alla fine stampa l'indirizzo del sito, per esempio `https://palestra-tracker.tuonome.workers.dev`. Quell'indirizzo è sia l'app sia il server di sincronizzazione. Per aggiornare l'app in futuro basta sostituire `public/index.html` e rilanciare `npx wrangler deploy`.

## Primo avvio e sincronizzazione

Apri l'indirizzo sul PC, vai in Altro → Ripristina da backup e incolla il backup: lo storico torna visibile. Poi in Altro → Sincronizzazione tocca "Genera un codice nuovo", annota il codice (è l'unica chiave: senza non puoi collegare altri dispositivi) e tocca OK.

Sul telefono apri lo stesso indirizzo (dal menu del browser puoi aggiungerlo alla schermata Home), vai in Altro → Sincronizzazione, inserisci il codice e tocca "Attiva". I dati arrivano da soli. Se il secondo dispositivo aveva già dei dati, vengono uniti.


## Installarla come app (senza barra del browser)

Dopo aver aperto l'indirizzo del sito: sul PC (Brave o Chrome) compare il pulsante "Installa" nella barra dell'indirizzo; sul telefono Android usa il menu ⋮ → "Installa app" (o "Aggiungi a schermata Home"). L'app si apre in una finestra sua, senza barra degli indirizzi, e funziona anche offline. Ricorda: i dati sono per dispositivo, la sincronizzazione li allinea.

## Aggiornare l'app

Sostituisci i file della cartella `public/` con quelli nuovi e rilancia `npx wrangler deploy`. Alla prossima apertura online l'app si aggiorna da sola (a volte serve chiuderla e riaprirla una volta).

## PDF della scheda

In Altro → Schede PDF carichi il PDF con riscaldamento, serie, tips. Lo apri dal pulsante "📄 Scheda PDF" in cima alla schermata Allenamento. Il PDF resta solo sul dispositivo dove lo carichi (non si sincronizza, per non appesantire): caricalo anche sugli altri. È incluso nel file di backup.

## Backup

"Crea backup" scarica un file `.json` con tutto (serie, schede, pesi, impostazioni, foto, PDF); "Ripristina" accetta quel file. Non contiene la chiave di sincronizzazione.

## Come funziona

Il codice non viene mai inviato. Dal codice il browser ricava due cose: un identificativo anonimo, con cui il server archivia i dati, e una chiave con cui cifrare tutto prima dell'invio (AES-256). Il server vede solo un blocco di testo illeggibile.

L'app sincronizza quando si apre, quando ci torni (dal blocco schermo o da un'altra app), circa 4 secondi dopo ogni modifica e ogni 2 minuti mentre è aperta. Non invia niente se non è cambiato niente.

Serie, pesi ed esercizi personalizzati si uniscono voce per voce: se aggiungi serie diverse sui due dispositivi, le ritrovi tutte; se ne elimini una, sparisce da entrambi; se modifichi la stessa serie su due dispositivi vince l'ultima modifica. Schede, colori, categorie, impostazioni e badge, invece, sono sincronizzati a blocchi: se cambi la stessa impostazione su due dispositivi prima che si sincronizzino, vince l'ultima.

## Limiti da conoscere

- Le foto che aggiungi tu agli esercizi restano sul dispositivo (le immagini incluse nell'app ci sono ovunque).
- Il magazzino dati di Cloudflare (KV) è "eventualmente coerente": una modifica può impiegare fino a circa un minuto per essere visibile dall'altro dispositivo.
- Il piano gratuito di KV ha un limite giornaliero di scritture (da verificare sul sito di Cloudflare, l'ordine di grandezza è un migliaio). L'app invia al massimo una volta ogni 20 secondi e solo se ci sono modifiche, quindi non dovrebbe avvicinarsi.
- Chi conosce il codice può leggere e scrivere i tuoi dati: non condividerlo. Non c'è recupero: se lo perdi i dati restano sui dispositivi che hanno già la sincronizzazione attiva e nei backup.
- "Ripristina da backup" non cancella ciò che è già sul server: se ripristini un backup vecchio, le serie più recenti già sincronizzate tornano al prossimo giro. Per ripartire da zero serve cancellare i dati da tutti i dispositivi.
- Se usi un altro servizio per il sito (per esempio GitHub Pages), il server di sincronizzazione resta questo Worker: in Altro → Sincronizzazione scrivi il suo indirizzo nel campo "Indirizzo del server".

## Accessi con account

Questa versione usa un codice segreto, adatta a una persona sola. Un login con email e password (per dare l'app ad altri, ognuno con i suoi dati) è un passo successivo.

## Novità: attrezzi, zavorre e storico avanzato

- **Altro → Attrezzi e zavorre**: sbarre (20/15/10 kg), EZ, trap bar, Smith, macchinario con peso base, cavo singolo, doppia carrucola (×½) e tripla (×⅓). Puoi modificare i pesi e i fattori e aggiungere attrezzi tuoi.
- Nella scheda **Registra** scegli l'attrezzo: inserisci sempre i pesi che carichi. Nello storico vedi il tuo peso con l'icona dell'attrezzo; record, 1RM, grafici e classifica usano il carico totale.
- **Serie passate**: Attrezzi e zavorre → "Applica a serie già registrate" (con annulla) oppure "Attrezzo predefinito per esercizio".
- Storico: tocca una serie per i dettagli; in alto scegli cosa mostrare (ripetizioni, 1RM, volume, peso massimo, durata) e l'ordinamento.
- Foto illimitate e riordinabili (Info dell'esercizio), campo "Come farlo bene", barra A–Z, schede riordinabili col trascinamento, tasto indietro di Android.

I file modificati rispetto alla versione precedente sono solo `public/index.html` e `public/sw.js` (e questo file). Se hai già messo l'id reale di KV in `wrangler.jsonc`, non sovrascriverlo.

## Offline e apertura veloce

- Le immagini incluse nell'app sono ora in `public/imgdata.js`: `index.html` pesa circa 320 KB invece di 3,4 MB.
- Il service worker (`sw.js`, cache v4) apre l'app SEMPRE dalla copia salvata sul telefono, quindi parte subito anche con rete debole o assente, e scarica la versione nuova in background. Quando arriva un aggiornamento compare un avviso: chiudi e riapri l'app.
- Per l'offline basta aprire l'app una volta con la connessione dopo ogni aggiornamento (scarica da sola tutti i file, foto comprese).
- Quando carichi la nuova versione includi anche `public/imgdata.js`.
- Altro → "Cardio: durata minima": sotto la soglia (predefinita 15 minuti al giorno per attività) il cardio non conta come allenamento.


## Aggiornamento: cardio corretto e testi rivisti
- Cardio: tetto di 6 serie **per giorno e attività**, ritmi min/km modificabili (Altro → "Cardio: durata minima"), soglia predefinita 10 minuti, nuoto con il petto.
- Etichette volume "Sotto/Sopra obiettivo", testi di squat, panca, stacco, camminata, tapis, lento dietro la nuca e altri rivisti.
- Cache offline aggiornata (`palestra-v5`): apri l'app una volta online dopo il deploy, poi chiudi e riapri.

## Aggiornamento UI (v16)
- Tasto indietro: torna prima ai passaggi dentro la pagina (schede Registra/Storico/Grafico, sotto-schede Statistiche), poi alla pagina precedente.
- Corpo: peso di nuovo in fondo, con grafico; elenchi "Da allenare" e "Già allenati" con serie fatte / obiettivo; legende dietro "ⓘ Legenda".
- Recap del calendario ora colora rispetto agli obiettivi (come il tab Corpo).
- Zoom muscolo: primi 5 esercizi e "＋ altri".
- Grafici (esercizi e peso): periodo (sempre, mese, 3/6 mesi, anno, intervallo) e base zero o minimo.
- Elenco esercizi: categorie in ordine fisso dall'alto in basso; la riga resta scorsa dove l'hai lasciata.
- Attrezzo: scheda sottile in Registra; "serie passate" riscritta in 3 passaggi con ricerca e anteprima.
- Cache `palestra-v6`.
