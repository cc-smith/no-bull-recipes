$(function() {
    $("#modal-recipeNotes").focus(function(event) {
    
          // Erase text from inside textarea
        $(this).text("");
    
          // Disable text erase
        $(this).unbind(event);
    });
});

$('#btnSaveRecipe').click(function(e) {
    e.preventDefault();

    let title = $('#title').text()
    let recipeNotes = $('#recipeNotes-display').text()
    let host = $("#host").text()

    $('#saveModal').find('.modal-title').text('Save Recipe');
    $('#saveModal').find('.recipe-title-source').text(title + ' | ' + host);
    if (recipeNotes !== '') {
        $('#modal-recipeNotes').text(recipeNotes)
    } else {
        $('#modal-recipeNotes').text('Enter recipe notes here...')
    }
    $('#saveModal').modal('show');
});

$('#btnSaveConfirm').click(function(e) {
    e.preventDefault();
    let user = $( "#username" ).text()
    let title = $("#title").text().trim()
    let host = $("#host").text()
    let url = $("#recipeURL").val()
    var ingredients = [];
    $('#ingredients-list').each(function(){
        ingredients.push($(this).text());
    });
    let instructions = $("#instructions-list").text()
    
    if ($("#modal-recipeNotes").val() == 'Enter recipe notes here...') {
        var recipeNotes = ""
    } else {
        var recipeNotes = $("#modal-recipeNotes").val()
        $('#recipeNotes-title').text('Recipe Notes:')
        $('#recipeNotes-display').text(recipeNotes)
    };

    let data = JSON.stringify({
        user,
        title, 
        host, 
        url,
        ingredients, 
        instructions,
        recipeNotes
    })

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/save", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            console.log("Recipe Saved!\n" + xhttp.response)

        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    xhttp.send(data);
    $('#saveModal').modal('hide');

});