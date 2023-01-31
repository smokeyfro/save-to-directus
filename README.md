# save-to-directus
 Firefox extension that lets you save the current tab to a Directus instance.

Status: WIP

Firefox extension that saves your current tab to a Directus instance.

The intended use-case to speed up adding sites to a Directus collection. 

In order to use, you'll need to configure the extension with your Directus url and auth token (which you can find by editing your admin user). Once authorized, the extension populates a list of your collections to select the one you want to post to.

Once configured, the extension grabs the page title and description from the sites meta tags and auto generates a screenshot which is saved as the site image.

Required fields in the destination collection:

- title
- description
- image

The extension was created using OpenAI & ChatGPT3, refined via ongoing prompts by myself.
