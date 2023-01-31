// Set up the variables needed for the extension
var options = {
    apiUrl: "",
    accessToken: "",
    selectedCollection: ""
};

// Load the options from storage
browser.storage.local.get().then(function(items) {
    // Merge the stored options with the default options
    options = Object.assign(options, items);
}, function(error) {
    // Log the error to the console
    console.error(error);
});

// Listen for changes in the options
browser.storage.onChanged.addListener(function(changes, area) {
    // Check if the changes are for the local storage and for the "options" item
    if (area === "local" && changes.options) {
        // Merge the new options with the current options
        options = Object.assign(options, changes.options.newValue);
    }
});

// Function to save the current site to Directus
async function saveSiteToDirectus(tab) {
    // Check if the required options are set
    if (!options.apiUrl || !options.accessToken || !options.selectedCollection) {
        // If the options are not set, show an error message
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("icon48.png"),
            "title": "Error",
            "message": "Please set the Directus API connection details in the options page."
        });
        return;
    }

    // Set up the request headers
    var headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Bearer " + options.accessToken);

    // Get the title, description, and screenshot of the current site
    var title = tab.title;
    var description = "";
    var screenshot = null;

    // Try to get the description of the site
    try {
        // Get the meta tags of the site
        var metaTags = await new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open("GET", tab.url);
            request.onreadystatechange = function() {
                if (request.readyState === XMLHttpRequest.DONE) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(request.responseText, "text/html");
                    resolve(Array.from(doc.getElementsByTagName("meta")));
                }
            };
            request.send();
        });

        // Find the description meta tag
        var descriptionTag = metaTags.find(function(tag) {
            return tag.getAttribute("name") === "description";
        });
        description = descriptionTag ? descriptionTag.getAttribute("content") : "";
    } catch (e) {
        // Log the error to the console
        console.error(e);
    }

    // Try to get the screenshot
    try {
        screenshot = await new Promise(resolve => {
            var canvas = document.createElement("canvas");
            canvas.width = tab.width;
            canvas.height = tab.height;
            var ctx = canvas.getContext("2d");

            var image = new Image();
            image.src = tab.screenshot;
            image.onload = function() {
                // Draw the screenshot image onto the canvas
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                // Resolve the promise with the base64-encoded data URL of the canvas
                resolve(canvas.toDataURL());
            };
        });
    } catch (e) {
        console.error(e);
    }

    // Prepare the data for the API request
    var data = {
        data: {
            title: title,
            description: description,
            screenshot: screenshot,
            url: tab.url
        }
    };

    // Send the API request to save the site to Directus
    try {
        // Make a POST request to the Directus API with the appropriate headers and body
        var response = await fetch(options.apiUrl + "/items/" + options.selectedCollection, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(data)
        });

        // Check if the response was successful
        if (!response.ok) {
            throw new Error("Error saving site to Directus: " + response.statusText);
        }

        // Show success message
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("/icon48.png"),
            "title": "Success",
            "message": "Site saved to Directus successfully."
        });
    } catch (e) {
        console.error(e);

        // Show error message
        browser.notifications.create({
            "type": "basic",
            "iconUrl": browser.extension.getURL("/icon48.png"),
            "title": "Error",
            "message": "Error saving site to Directus: " + e.message
        });
    }

    // Listen for the browser action button being clicked
    browser.browserAction.onClicked.addListener(function(tab) {
        saveSiteToDirectus(tab);
    });
}

// Open the options page when the extension is activated
browser.runtime.onStartup.addListener(function() {
    browser.tabs.create({
        url: "options.html"
    });
});