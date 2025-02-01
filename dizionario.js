document.getElementById("search-btn").addEventListener("click", () => {
  const word = document.getElementById("word-input").value.trim();

  if (word === "") {
    alert("Please enter a word!");
    return;
  }

  const apiUrl = "https://api.sheety.co/ee3239ab0421cb056a9d75f351831560/dizionarioProva/foglio1";

  // Function to normalize strings
  const normalizeString = (str) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data from the API");
      }
      return response.json();
    })
    .then((data) => {
      const entries = data.foglio1;

      // Normalize input word and dictionary words
      const normalizedWord = normalizeString(word);
      const result = entries.find(
        (entry) => normalizeString(entry.parola) === normalizedWord
      );

      if (result) {
        document.getElementById("word").textContent = result.parola;
        document.getElementById("definition").textContent = `${result.traduzione}`;
        
      } else {
        document.getElementById("word").textContent = "Not Found";
        document.getElementById("definition").textContent =
          "Translation not available for this word.";
      }
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("word").textContent = "Error";
      document.getElementById("definition").textContent =
        "There was an error fetching the translation. Please try again.";
    });
    document.getElementById("word-input").value = "";
});

// Trigger search when Enter key is pressed
document.getElementById("word-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("search-btn").click(); // Trigger the search button's click event
  }
});
