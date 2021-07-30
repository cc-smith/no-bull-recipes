$('#btnEmailRecipe').click(function(e) {
    e.preventDefault();
    $('#emailModal').modal('show');
});


$('#btnEmailConfirm').click(function(e) {
    e.preventDefault();
    let email = $("#email").val()
    let url = $("#recipeURL").val()
    let title = $("#title").text()
    let host = $("#host").text()
    let ingredients = $("#ingredients-list").html()
    let instructions = $("#instructions-list").html()

    let data = JSON.stringify({
        email,
        url,
        title, 
        host, 
        ingredients, 
        instructions
    })

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
    // xhttp.send(JSON.stringify(data));
    xhttp.send(data);

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
