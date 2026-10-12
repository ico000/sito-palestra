# Palestra Tracker – versione pubblicabile con sincronizzazione

Questa cartella contiene la versione "pulita" dell'app (parte vuota, senza lo storico di nessuno) e un piccolo server gratuito su Cloudflare che permette di usare gli stessi dati dal PC e dal telefono.

- `public/index.html` è l'app.
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
