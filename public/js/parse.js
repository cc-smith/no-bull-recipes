$('#recipeURL').click(function(e) {
    $( "#recipeURL" ).val("");
});

// Your javascript
$('#btnGetRecipe').click(function(e) {
    e.preventDefault();

    // Clear out the previous ingredients/steps
    $( "#ingredients-list" ).empty();
    $( "#instructions-list" ).empty();

    // Get the recipe's URL, provided by the user
    let recipeUrl = $('#recipeURL').val()
    let recipeNotes = $('#recipeNotes').val()


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
            console.log("Returned data:\n", xhttp.response);

            let data = JSON.parse(xhttp.response)

            
            let title = data["title"]
            let filteredIngredients = data["ingredients"][0]
            let instructions = data["instructions"][0]

            // Filter out unwanted terms from the ingredient list
            // var termFilter = ["ingredients","deselect", "ingredient", "add", "view", "shopping", "list", "recipe"]

            // let filteredIngredients = ingredients.filter(item => {
            //     for (var f of termFilter) {
            //         if (item.toLowerCase().includes(f)) {
            //             return false;
            //         }
            //     }
            //     return true;

            // }) 
            
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



            // $.each(function(index, elem) {
            //     var $this = $(this);
            //     console.log($.html($this));
            //   });
            // $('#ingredients-list').append(ingredients)


            // Display the ingredients
            var ul = $("<ul>")
                .addClass("list-group list-group-flush")
            $.each(filteredIngredients, function(index, value) {
                var span = $("<span>")
                    .text(value)
                    .addClass("span-ingredient")
                var li = $("<li>")
                    .addClass("list-group-item bg-transparent")    
                    .append(span)
                ul.append(li)
              });
            $('#ingredients-list').append(ul)

            //Display the instructions
            var ol = $("<ol>")
                .addClass("list-group list-group-numbered ")
            $.each(instructions, function(index, value) {
                var span = $("<span>")
                    .text(value)
                    .addClass("span-instruction")
                var li = $("<li>")
                    .addClass("list-group-item bg-transparent")    
                    .append(span)
                    ol.append(li)
            });
            $('#instructions-list').append(ol)


        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    // console.log(data)
    xhttp.send(JSON.stringify(data));

})

