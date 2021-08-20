$(document).ready(function() {
    var referrer =  document.referrer;
    if (referrer === "http://localhost:3000/" || referrer === "https://no-bull-recipes.herokuapp.com/") {
        $('#welcomeModal').modal('show');
    }
 });