$( document ).ready(function() {
    let url = $( "#recipeURL" ).val()
    if (url) {
        $("#btnGetRecipe").trigger('click'); 
    }
});
    
