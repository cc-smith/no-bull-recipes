// Delete button within row
$(document).on('click', '.delete', function(e) {
    e.preventDefault();

    let recipeID = $(this).parent().parent().attr('id')
    console.log("recipeID:", recipeID)
    $('#myModal').data('name', recipeID)

    // Get the title of the recipe
    var recipeTitle = $(this).attr('data-name')
    console.log(recipeTitle)
    $('#myModal').find('.modal-body').text('Do you really want to delete your ' +  recipeTitle + ' recipe?')
});

// Delete confirmation button within modal
$('#btnDeleteConfirm').click(function(e) {
    e.preventDefault();
    let id = $('#myModal').data('name');

    let data = JSON.stringify({
        id
    })
    console.log("Data to send for delete:\n", data)


    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/delete-recipe", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            // let user = JSON.parse(xhttp.response)
            console.log("Successfully deleted: ", xhttp.response)
            $('#' + id).remove()
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response

    xhttp.send(data);
    $('#myModal').modal('hide');

});