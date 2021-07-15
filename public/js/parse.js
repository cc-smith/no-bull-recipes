
// Your javascript
$('#btnGetRecipe').click(function(e) {
    e.preventDefault();

    let recipeUrl = $('#recipeURL').val()
    console.log("### URL ###", recipeUrl)

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

            // Add the new data to the table
            console.log(xhttp.response);

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    console.log(data)
    xhttp.send(JSON.stringify(data));

})
