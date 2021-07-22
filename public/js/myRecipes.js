$('#btnMyRecipes').click(function(e) {
    e.preventDefault();
    let username = $( "#username" ).text()

    let data = JSON.stringify({
        username
    })

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/my-saved-recipes", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let recipes = xhttp.response
            // console.log("Returned Recipes:", recipes)
            // res.render('my-saved-recipes', recipes)
            // xhttp.response.render('my-saved-recipes')
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }
    console.log("SENDING:", data)
    xhttp.send(data);
});