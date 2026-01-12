// PELIN ASETUKSET JA TEHTÄVÄLISTA

const GRID_SIZE = 4; // 4x4-ruudukko
const STORAGE_KEYS = { // localStorage-avaimet:
  STATE: "pelitila", // mitkä tehtävät on merkitty valmiiksi
  ORDER: "ruutujarjestys" // missä järjestyksessä tehtävät näytetään
};

// Tehtävälista
const TASKS = [
  { id: "task-1",  text: "Löysin jonkun, joka on käynyt Kesteillä yhtä monta kertaa kuin minä" },
  { id: "task-2",  text: "Kehuin toisessa jotain, mikä ei liity ulkonäköön" },
  { id: "task-3",  text: "Arvasin jonkun horoskooppimerkin oikein" },
  { id: "task-4",  text: "Näytin viimeisimmän ottamani kuvan tuntemattomalle" },
  { id: "task-5",  text: "Löysin jonkun, joka on tullut minua myöhemmin kaapista" },
  { id: "task-6",  text: "Opetin jollekin murteeni/slangini sanan" },
  { id: "task-7",  text: "Kysyin, minkä ei-elollisen asian hän pelastaisi palavasta talosta" },
  { id: "task-8",  text: "Ylitin itseni tekemällä jotain täysin minulle uutta" },
  { id: "task-9",  text: "Aloitin keskustelun uuden ihmisen kanssa" },
  { id: "task-10", text: "Tunnistin itseni jonkun maneereista, tarinasta tai tavasta olla olemassa" },
  { id: "task-11", text: "Hymyilin jollekulle ohimennen" },
  { id: "task-12", text: "Heitin huonon läpän – ja selvisin siitä(kin)" },
  { id: "task-13", text: 'Sanoin 30 minuutin ajan kaikkeen "kyllä/miksi ei/todellakin/tehdään näin"' },
  { id: "task-14", text: "Kerroin jollekin viime vuoden hetkestä/saavutuksesta, josta olen ylpeä" },
  { id: "task-15", text: "Otin selfien tuntemattoman kanssa ja tägäsin @kestit_helsinki" },
  { id: "task-16", text: "Kehuin tuntematonta ihmistä" },
  { id: "task-17", text: "Lauloin dueton karaokessa" },
  { id: "task-18", text: "Opetin tuntemattomalle lempitanssiliikkeeni" },
  { id: "task-19", text: "Pelasin kivi-sakset-paperi tuntemattoman kanssa" },
  { id: "task-20", text: "Viihdytin vessajonoa" },
  { id: "task-21", text: "Dance like no one is watching" },
  { id: "task-22", text: "Pyysin ihastusta treffeille" },
  { id: "task-23", text: "Pyysin jonkun numeron" },
];

// Odotetaan, että koko HTML on ladattu ennen kuin ajetaan skriptiä
document.addEventListener("DOMContentLoaded", () => {
  const gridElement = document.getElementById("grid");
  const bingoBanner = document.getElementById("bingoBanner");
  let hasShownBingoThisSession = false; // Estää toistuvan ilmoituksen, jos pelaaja jatkaa uutta peliä  

  // PELIN ALUSTUS

  // Fisher–Yates-sekoitus: arpoo taulukon järjestyksen. Tätä käytetään seuraavassa funktiossa
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  // Lukee localStoragesta aiemmin arvotun järjestyksen tai arpoo uuden, jos sellaista ei ole.
  function loadOrder() {
    // Yritetään ladata vanha 16 ruudun peli
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER));
      // Tarkistetaan että tallennettu peli on oikean kokoinen (16 ruutua) (pelin kokoa voi säätää koodilla, siksi tämä..)
      if (Array.isArray(saved) && saved.length === (GRID_SIZE * GRID_SIZE)) {
        return saved; // Palautetaan jo aloitettu peli
      }
    } catch (e) {
      // virhetilanteessa jatketaan uuden arpomiseen
    }

    // Jos peliä ei ole, luodaan uusi
    // Tehdään kopio kaikkien tehtävien ID:tunnuksista
    const allIds = TASKS.map((t) => t.id);
    // Sekoitetaan kaikki tehtävät
    shuffleArray(allIds);
    // Valitaan sekoitetusta listasta 16 ensimmäistä
    const selectedIds = allIds.slice(0, GRID_SIZE * GRID_SIZE);
    // Tallennetaan ja palautetaan
    localStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(selectedIds));
    return selectedIds;
  }
  
  // Lukee pelitilan (valmiit tehtävät) localStoragesta.  
  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATE) || "[]");
    } catch (e) {
      return [];
    }
  }

  // Tallentaa pelitilan (valmiit tehtävät) localStorageen.
  function saveState(doneIds) {
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(doneIds));
  }

  // BINGON TARKISTUS

  function checkBingo(orderIds, doneIds) {
    const doneSet = new Set(doneIds);
    const size = GRID_SIZE;
    let winningIndices = new Set(); // Käytetään Setiä, jottei samoja ruutuja lasketa kahdesti

    // Tarkistetaan rivit
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) row.push(i * size + j);
      if (row.every(idx => doneSet.has(orderIds[idx]))) {
        row.forEach(idx => winningIndices.add(idx));
      }
    }

    // Tarkistetaan sarakkeet
    for (let i = 0; i < size; i++) {
      let col = [];
      for (let j = 0; j < size; j++) col.push(j * size + i);
      if (col.every(idx => doneSet.has(orderIds[idx]))) {
        col.forEach(idx => winningIndices.add(idx));
      }
    }

    // Diagonaali 1 (vasen ylä -> oikea ala)
    let d1 = [0, 5, 10, 15];
    if (d1.every(idx => doneSet.has(orderIds[idx]))) {
      d1.forEach(idx => winningIndices.add(idx));
    }

    // Diagonaali 2 (oikea ylä -> vasen ala)
    let d2 = [3, 6, 9, 12];
    if (d2.every(idx => doneSet.has(orderIds[idx]))) {
      d2.forEach(idx => winningIndices.add(idx));
    }

    return Array.from(winningIndices); // Palauttaa listan voittavista indekseistä (esim. [0,1,2,3])
  }

  // KÄYTTÖLIITTYMÄN PÄIVITYS

  // Piirretään ruudukko annetun järjestyksen mukaan ja merkitään valmiit tehtävät näkyviin
  function renderGrid(orderIds, doneIds) {
    gridElement.innerHTML = "";
    orderIds.forEach((taskId, index) => {
      const task = TASKS.find((t) => t.id === taskId);
      if (!task) return;

      const cell = document.createElement("div");
      cell.className = `cell ${doneIds.includes(taskId) ? 'done' : ''}`;
      
      // Asetetaan id, jolla tehdään tallennus ja bingo-tarkistus
      cell.id = task.id;

      cell.textContent = task.text;

      // Klikkauksien kuuntelija
      cell.addEventListener("click", () => {
        const isDone = cell.classList.toggle("done");
        // Päivitetään pelitila kaikkiin valmiisiin ruutuihin perustuen
        const currentDone = [...document.querySelectorAll(".cell.done")].map(c => c.id);
        
        // Tallennetaan tila localStorageen
        saveState(currentDone);

        // Haetaan kaikki voittavat indeksit
        const winningIndices = checkBingo(orderIds, currentDone);
        const allCells = document.querySelectorAll(".cell");

        // Poistetaan ensin bingo-luokka kaikilta (nollaus)
        allCells.forEach(c => c.classList.remove("bingo"));

        // Lisätään bingo-luokka vain niille, jotka kuuluvat voittoriviin
        if (winningIndices.length > 0) {
          winningIndices.forEach(idx => {
            allCells[idx].classList.add("bingo");
          });

          // Näytetään banneri vain kerran per Bingo-saavutus
          if (!hasShownBingoThisSession) {
            showBingoBanner();
            hasShownBingoThisSession = true;
          }
        } else {
          // Jos pelaaja poistaa rasteja niin että bingo katoaa, nollataan ilmoitusoikeus
          hasShownBingoThisSession = false;
          hideBingoBanner();
        }
      });
      gridElement.appendChild(cell);
    });

    // Nyt kun kaikki 16 ruutua on luotu ja lisätty sivulle,
    // värjätään seuraavaksi mahdolliset bingorivit
    const initialWins = checkBingo(orderIds, doneIds);
    if (initialWins && initialWins.length > 0) {
      const allCells = document.querySelectorAll(".cell");
      initialWins.forEach(idx => allCells[idx].classList.add("bingo"));
    }
  }

  // Näyttää bingo-bannerin (jos ei vielä näy).
  function showBingoBanner() {
    bingoBanner.classList.remove("hidden");
  }
  // Piilottaa bingo-bannerin (jos se on näkyvissä).
  function hideBingoBanner() {
    bingoBanner.classList.add("hidden");
  }

  // OSALLISTUMINEN ARVONTAAN SÄHKÖPOSTILLA

  function sendEmail() {
    const name = document.getElementById("nameInput").value.trim();
    // VAIHDA TÄMÄ OIKEAKSI:
    const address = "jarjestaja@example.com";
    const subject = encodeURIComponent("Be lez useless -arvonta");
    let body =
      "Hei!\n\nHaluan osallistua arvontaan.";
    if (name) {
      body += "\nNimi: " + name;
    }
    body += "\n\n(Viesti luotu pelisivulta.)";
    const mailtoLink =
      "mailto:" +
      address +
      "?subject=" +
      subject +
      "&body=" +
      encodeURIComponent(body);
    window.location.href = mailtoLink;
  }

  // Jos tätä klikataan, edellä oleva funktio käynnistyy
  document.getElementById("sendEmailBtn").addEventListener("click", sendEmail);

  // Jos tätä klikataan, bingo-ilmoitus häviää
  document.getElementById("closeBanner").addEventListener("click", hideBingoBanner);

  // KÄYNNISTYS

  const orderIds = loadOrder();   // jokaiselle laitteelle oma arvottu järjestys
  const doneIds = loadState();    // mitä tämä käyttäjä on jo tehnyt

  // Jos ladataan sivu ja bingo on jo valmis, asetetaan hasShownBingo trueksi, jottei overlay hyppää heti silmille häiritsevästi
  if (checkBingo(orderIds, doneIds)) hasShownBingoThisSession = true;

  renderGrid(orderIds, doneIds);
});