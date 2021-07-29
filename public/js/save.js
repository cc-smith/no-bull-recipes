$(function() {
    $("#recipeNotes").focus(function(event) {
    
          // Erase text from inside textarea
        $(this).text("");
    
          // Disable text erase
        $(this).unbind(event);
    });
});

$('#btnSaveRecipe').click(function(e) {
    e.preventDefault();
    // var techID = $(this).parent().parent().attr('id')
    let recipeTitle = $('#title').text()
    let recipeNotes = $('#recipeNotes-display').val()
    console.log("NOTES:", recipeNotes)
    // $('#myModal').data('id', techID).modal('show');
    $('#saveModal').find('.modal-title').text(recipeTitle)
    $('#saveModal').find('#recipeNotes').text(recipeNotes)
    $('#saveModal').modal('show');
});

$('#btnSaveConfirm').click(function(e) {
    e.preventDefault();
    let user = $( "#username" ).text()
    let title = $("#title").text()
    let host = $("#host").text()
    let url = $("#recipeURL").val()
    var ingredients = [];
    $('#ingredients-list').each(function(){
        ingredients.push($(this).text());
    });
    let instructions = $("#instructions-list").text()
    let recipeNotes = $("#recipeNotes").val()

    let data = JSON.stringify({
        user,
        title, 
        host, 
        url,
        ingredients, 
        instructions,
        recipeNotes
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
            let recipeTitle = xhttp.response
            console.log("BEFORE:", recipeTitle)

            $.trim(recipeTitle.replace(/\r?\n|\r/, ''))
            console.log("AFTER:", recipeTitle)
            
        } else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response

    xhttp.send(data);
    $('#saveModal').modal('hide');

});