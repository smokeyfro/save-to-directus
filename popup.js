// Get API URL and API Token values from local storage
const getOptions = () => {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get(["apiUrl", "apiToken"], items => {
        resolve(items);
      });
    });
  };
  
  // Get the collections from the Directus API
  const getCollections = (apiUrl, apiToken) => {
    return new Promise((resolve, reject) => {
      fetch(`${apiUrl}/collections`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + apiToken
        }
      })
        .then(response => response.json())
        .then(data => {
          resolve(data.data);
        })
        .catch(error => {
          reject(error);
        });
    });
  };
  
  // Show loading message
  const showLoading = () => {
    document.getElementById("loading").style.display = "block";
    document.getElementById("error").style.display = "none";
    document.getElementById("success").style.display = "none";
  };
  
  // Show error message
  const showError = error => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("error").innerHTML = error;
    document.getElementById("error").style.display = "block";
  };
  
  // Show success message
  const showSuccess = message => {
    document.getElementById("loading").style.display = "none";
    document.getElementById("success").innerHTML = message;
    document.getElementById("success").style.display = "block";
  };
  
  // Populate the collections dropdown
  const populateCollections = collections => {
    const select = document.getElementById("collection");
    collections.forEach(collection => {
      const option = document.createElement("option");
      option.value = collection.collection;
      option.innerHTML = collection.collection;
      select.appendChild(option);
    });
    select.removeAttribute("disabled");
  };
  
  // Handle form submission
  const handleFormSubmit = event => {
    event.preventDefault();
  
    const apiUrl = document.getElementById("api-url").value;
    const apiToken = document.getElementById("api-token").value;
    const collection = document.getElementById("collection").value;
  
    showLoading();
  
    // Save API URL and API Token to local storage
    chrome.storage.sync.set({ apiUrl, apiToken }, () => {
        console.log("API URL and API Token saved to local storage");
    });
    
    getCollections(apiUrl, apiToken)
    .then(collections => {
        populateCollections(collections);
    })
    .catch(error => {
        showError(error);
    });
    
    document.getElementById("site-capture-form").addEventListener("submit", handleFormSubmit);
    });