# Manual Test Checklist

Use these steps after loading the unpacked extension from this folder.

## Install and defaults

1. Load the extension in `chrome://extensions` with Developer mode enabled.
2. Open the options page and confirm the five default vowel rules and two sample blocked domains appear.
3. Visit a normal `https://` page and confirm matching characters are colored.

## Options page

1. Add a new color rule and confirm it appears in the list without reloading.
2. Try adding a duplicate rule and confirm a validation message appears.
3. Remove a color rule and confirm it disappears from the list.
4. Add a blocked domain with an invalid value such as `not a domain` and confirm validation fails.
5. Add a valid blocked domain and remove it again.
6. Click **Reset to default** and confirm rules and blocked domains return to defaults.

## Popup

1. Open the popup on a normal website and confirm the hostname and enabled/disabled status are shown.
2. Disable the extension for the current site and confirm the popup status updates.
3. Open the popup on an internal page such as `chrome://extensions` and confirm toggle is unavailable with an explanatory message.
4. Re-enable the site from the popup and confirm highlighting returns on the open tab without a manual reload.

## Dynamic pages

1. Visit a page that loads content after the initial render.
2. Confirm newly inserted text is highlighted.
3. Change a color rule in options and confirm open tabs update automatically.
