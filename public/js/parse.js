// https://www.inspiredtaste.net/37475/homemade-chicken-noodle-soup-recipe/

// Your javascript
$('#btnGetRecipe').click(function(e) {
    e.preventDefault();

    // Clear out the previous ingredients/steps
    $( "#ingredients-list" ).empty();
    $( "#instructions-list" ).empty();

    // Get the recipe's URL, provided by the user
    let recipeUrl = $('#recipeURL').val()


    data = {
        url: recipeUrl
    }

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/parse", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let data = JSON.parse(xhttp.response)

            console.log("Returned data:\n", data);
            
            let title = data["title"]
            console.log(title)
            let ingredients = data["ingredients"]
            let instructions = data["instructions"]

            // Filter out unwanted terms from the ingredient list
            var termFilter = ["ingredients","deselect", "ingredient", "add", "view", "shopping", "list", "recipe"]

            let filteredIngredients = ingredients.filter(item => {
                for (var f of termFilter) {
                    if (item.toLowerCase().includes(f)) {
                        return false;
                    }
                }
                return true;

            }) 
            
            // Display the title of the recipe
            $('#title').text(title[0])

            // Display the host of the recipe
            let url = String(new URL(recipeUrl).host);
            if (url.includes("www.")) {
                $('#host').text(url.slice(4))
            }
            else{
                $('#host').text(url)
            }

            // Display the ingredients
            $.each(filteredIngredients, function(index, value) {
                $('#ingredients-list').append("<ul>", value, "</ul>")
              });
            
            //Display the instructions
            $.each(instructions, function(index, value) {
                $('#instructions-list').append("<ol>", value, "</ol>")
            });

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    console.log(data)
    xhttp.send(JSON.stringify(data));

})