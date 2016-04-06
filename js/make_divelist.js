// JS functions for the make_divelist.html page


// Action Listeners
$(".dive-entry").click(function() {
    toggleDive(this);
});

// Listener Functions
function toggleDive(clicked) {
    console.log("toggling!");
    $("#divelist-container").addClass("hide-quicklist");
    console.log(clicked);
    $(clicked).toggleClass("selected");
    if ($(clicked).hasClass("selected")) {
        // Add it to the box; will make it work properly later
        $("#list-view").append('<span class="selected-dive">1024Q &nbsp; <strong>Dive</strong></span>');
    } else {
        // Remove it from the box; todo
    }
    
}