document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("apiUrl");
  const accessTokenInput = document.getElementById("accessToken");
  const collectionSelect = document.getElementById("collection");

  console.log('DOMContentLoaded event listener fired');

  function updateOptions() {
    console.log('updateOptions function fired');
    const options = {
      apiUrl: apiUrlInput.value,
      accessToken: accessTokenInput.value,
      collection: collectionSelect.value
    };

    chrome.storage.local.set({ options }, () => {
      console.log("Options saved.");
    });
  }

  // Load the options from storage and set the form inputs
  chrome.storage.local.get(["options"], ({ options }) => {
    console.log('options retrieved from storage:', options);

    apiUrlInput.value = options.apiUrl;
    accessTokenInput.value = options.accessToken;
    collectionSelect.value = options.collection;

    // Fetch the collections from the Directus API
    fetch(options.apiUrl + "/collections", {
      headers: {
        "Authorization": "Bearer " + options.accessToken
      }
    })
    .then(response => response.json())
    .then(collections => {
      console.log('collections fetched from Directus API:', collections);

      collections.forEach(collection => {
        const option = document.createElement("option");
        option.value = collection.collection;
        option.textContent = collection.collection;
        collectionSelect.appendChild(option);
      });
    });
  });
});