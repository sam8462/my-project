# Goal Description

The goal is to implement two visual and functional enhancements to the Airbnb project:
1. **Filters**: Add a category filter strip to the home page (similar to Airbnb's category icons) to allow users to filter listings by categories like "Trending", "Rooms", "Mountains", etc. We will update the [Listing](file:///c:/Users/SAMEER/Desktop/airbnb-main/controller/listing.js#62-73) model to support categories and update the home route to handle the filter query.
2. **Google Maps Footer**: Create a rich, visually appealing footer that includes a Google Map embed, quick links, and social media icons to improve the user experience and aesthetics.

## Proposed Changes

### Database & Controller
Update the listing schema to support categorization and modify the backend to handle filter queries.

#### [MODIFY] [listing.js](file:///c:/Users/SAMEER/Desktop/airbnb-main/models/listing.js)
- Add a `category` field of type String with an enum of predefined categories (e.g., "Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic") and a default value of "Trending" to ensure existing listings do not break.

#### [MODIFY] [listing.js](file:///c:/Users/SAMEER/Desktop/airbnb-main/controller/listing.js)
- Modify the [homeRoute](file:///c:/Users/SAMEER/Desktop/airbnb-main/controller/listing.js#4-10) function to check for a `category` query parameter in the request (`req.query.category`). If present, use it to filter the `Listing.find()` query.

### Views (Frontend UI)
Update the HTML/EJS templates to render the filters and the new footer.

#### [MODIFY] [home.ejs](file:///c:/Users/SAMEER/Desktop/airbnb-main/view/listing/home.ejs)
- Add a Bootstrap-styled horizontal scrollable strip with category icons above the listings grid. The icons will be links that pass the `?category=...` query to the home route.
- Add basic CSS rules into a `<style>` tag (or update the main CSS if needed) to style the filter strip elegantly (hover effects, opacity, etc.).

#### [MODIFY] [footer.ejs](file:///c:/Users/SAMEER/Desktop/airbnb-main/view/includes/footer.ejs)
- Replace the existing simple footer with a robust, modern footer.
- Add a two-column or three-column layout. One distinct column/section will embed a Google Maps iframe showing a general location (e.g., "World" or a specific headquarters).
- Include standard footer links (Home, Features, Pricing, About) and social media icons using FontAwesome.
- Ensure the footer is responsive using Bootstrap grid classes.

## Verification Plan

### Manual Verification
- **Test Filters**: The user will start the server locally (`npm start` or `node app.js`), open the browser, and navigate to the home page. They will click on different category filter icons and verify that only listings with the corresponding category are shown. 
- **Test Footer**: The user will scroll to the bottom of any page and verify that the newly styled footer is rendered correctly and that the Google Map is successfully embedded and visible.
