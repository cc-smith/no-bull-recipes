$('#btnSaveRecipe').click(function(e) {
    e.preventDefault();
    let user = $( "#username" ).text()
    let title = $("#title").text()
    let host = $("#host").text()

    var ingredients = [];
    $('#ingredients-list').each(function(){
        ingredients.push($(this).text());
    });

    let instructions = $("#instructions-list").text()

    let data = JSON.stringify({
        user,
        title, 
        host, 
        ingredients, 
        instructions
    })
    console.log("Data to Save:\n", data)


    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/save", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // let user = JSON.parse(xhttp.response)
            let user = xhttp.response
            console.log("RETURNED USER:\n", user);
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response

    xhttp.send(data);


});