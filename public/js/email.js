
$('#btnEmailRecipe').click(function(e) {
    e.preventDefault();
    var data = {"title":[], "host":[], "ingredients":[], "instructions":[]}

    data["title"] = $("#title").text()
    data["host"] = $("#host").text()
    data["ingredients"] = $("#ingredients-list").text()
    data["instructions"] = $("#instructions-list").text()

    console.log("SENT DATA:\n", data)

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/email", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log(xhttp.response)
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    console.log(data)
    xhttp.send(JSON.stringify(data));

})
