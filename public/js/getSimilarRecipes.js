$('#btnGetSimilarRecipes').click(function(e) {
    e.preventDefault();
    let title = $("#title").text()
    $("#recipeQuery").val(title)
    $('#similarRecipesModal').modal('show');
    $("#btnQueryConfirm").trigger('click'); 
});


$('#btnQueryConfirm').click(function(e) {
    e.preventDefault();
    let query = $("#recipeQuery").val()

    // let response = {
    //     "uri": "http://www.edamam.com/ontologies/edamam.owl#recipe_b79327d05b8e5b838ad6cfd9576b30b6",
    //     "label": "Chicken Vesuvio",
    //     "image": "https://www.edamam.com/web-img/e42/e42f9119813e890af34c259785ae1cfb.jpg",
    //     "source": "Serious Eats",
    //     "url": "http://www.seriouseats.com/recipes/2011/12/chicken-vesuvio-recipe.html",
    //     "shareAs": "http://www.edamam.com/recipe/chicken-vesuvio-b79327d05b8e5b838ad6cfd9576b30b6/chicken",
    //     "yield": 4,
    //     "dietLabels": [
    //         "Low-Carb"
    // }

    let response = [
        "Banana Bread Recipe",
        "Simple Banana Bread Recipe",
        "Maple Banana Bread",
        "Best Ever Banana Bread",
        "Gluten Free Banana Bread"
    ]
    response.forEach(function (index, element) {
        var row = $("<tr>") 
        var td1 = $("<td>").text("Banana Bread") 
        var td2 = $("<td>").text("cooking.nyt.com") 
        row.append(td1)
        row.append(td2)
        $("#tbody-similarRecipes").append(row)
    });

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://flashtastic.herokuapp.com/api/?search=bread");
    xhttp.setRequestHeader('Access-Control-Allow-Origin','*');

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("Response:", xhttp.response)
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    console.log("Query:", query)
    // xhttp.send(JSON.stringify(data));
    xhttp.send();

    $('#emailModal').modal('hide');
})



// $('#btnEmailRecipe').click(function(e) {
//     e.preventDefault();
//     let url = $("#recipeURL").val()
//     let title = $("#title").text()
//     let host = $("#host").text()
//     let ingredients = $("#ingredients-list").html()
//     let instructions = $("#instructions-list").html()

//     let data = JSON.stringify({
//         url,
//         title, 
//         host, 
//         ingredients, 
//         instructions
//     })

//     // Setup our AJAX request
//     var xhttp = new XMLHttpRequest();
//     xhttp.open("POST", "/email", true);
//     xhttp.setRequestHeader("Content-type", "application/json");

//     // Tell our AJAX request how to resolve
//     xhttp.onreadystatechange = () => {
//         if (xhttp.readyState == 4 && xhttp.status == 200) {
//             console.log(xhttp.response)
            
//         } else if (xhttp.readyState == 4 && xhttp.status != 200) {
//             console.log("There was an error with the input.")
//         }
//     }

//     // Send the request and wait for the response
//     console.log(data)
//     // xhttp.send(JSON.stringify(data));
//     xhttp.send(data);


// })
