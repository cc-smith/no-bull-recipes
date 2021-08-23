

<!-- PROJECT LOGO -->
# No Bull Recipes
A web app that lets you retrieve only the infomration you need from recipe websites. Save, share, and discover your new favorite recipes.
Project Link: [No Bull Recipes](https://no-bull-recipes.herokuapp.com/)  

## Table of Contents
- [About The Project](#about-the-project)
  * [Built With](#built-with)
- [Usage](#usage)
  * [Signing In](#signing-in)
  * [Retrieving a Recipe](#retrieving-a-recipe)
  * [Emailing a Recipe](#emailing-a-recipe)
  * [Saving a Recipe](#saving-a-recipe)
  * [Using the Recipe Recommendation Feature](#using-the-recipe-recommendation-feature)
  * [My Cookbook](#my-cookbook)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)





<!-- ABOUT THE PROJECT -->
## About The Project
I built this app to make it easier for home cooks to find and save online recipes.  A key feature of this app is the ability to retrieve recipe steps and instructions without visitng the web page in your browser. No loading ads and images. No scrolling through lengthy blog posts. No BS.  
  
Other features include:
* Save recipes to your personal cookbook 
* Add notes to your saved recipes
* Email recipes to yourself and others
* Use the recipe recommendation engine to discover new recipes

### Built With
* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)
* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com)



<!-- USAGE EXAMPLES -->
## Usage
### Signing In
There are 2 options for signing in:
<ol>
  <li>Sign in with your own account</li>  
  This requires providing an email address. You will have a personal cookbook in which you can save and delete recipes.
  <li>Sign in with the guest account</li>  
  The guest account is for anyone who just wants to test the functionalilty of the app. A generic email address is used for the guest account and anyone can view, save, or delete recipes in the cookbook.
</ol>

<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130515169-129732fc-f727-41f7-9afe-cdd95b547be9.png" width="500">
</p>

### Retrieving a Recipe
Simply copy the url of a recipe's web page, paste it in the search bar, and click "Get Recipe."  The recipe's steps and ingredients will be retrieved and displayed.
<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130516619-dd4080d7-6365-45d2-86b8-b349ed81e29f.png" width="500">
</p>

### Emailing a Recipe
Click the "email" icon. A modal will pop up where you can enter an email address. By default the email associated with the account will be displayed.
<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130520921-f47c0f0a-0bad-4ebc-a44e-d306b609f2e0.png" width="500">
</p>

### Saving a Recipe
Click the "save" icon. A modal will pop up where you can write notes that will be saved with the recipe. Any recipes that you save will be added to your cookbook. See below for more information on the cookbook.
<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130521372-b35fd531-8898-43c1-be1f-f08e1e34185a.png" width="500">
</p>

### Using the Recipe Recommendation Feature
Click the "search" icon. The app will search for similar recipes based on the title of the recipe you are currently viewing. Results will be displayed in a pop up modal. You may change the search phrase to tailor your recommendations.
<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130521006-77dc5285-b9a4-4753-b830-06e7e95a4e51.png" width="500">
</p>
 
### My Cookbook
Click the "My Cookbook" link at the top of the page. You will be redirected to a page with all your saved recipes. Clcking the title of a recipe wll display the recipe along with any notes you may have written. To delete a recipe, simply click the "trashcan" icon and cofnirm the deletion.
<p align="center">
  <img src="https://user-images.githubusercontent.com/63076215/130521109-ccf114ee-f0e2-4c59-93b7-1cd7e49501ac.png" width="500">
</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Chris Smith  
* ChrisColinSmith@gmail.com
* [LinkedIn](https://linkedin.com/in/chris-smith-a9279b90)





<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [User Authentication](https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12386014#overview)
* [Readme Template](https://github.com/othneildrew/Best-README-Template)




