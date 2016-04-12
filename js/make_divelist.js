// JS functions for the make_divelist.html page




$(document).ready(function(){

    // Get the dives list from the csv file
    // Cols are: ID, name, DD
    var client = new XMLHttpRequest();
    client.open('GET', './dives.csv', false);
    client.send();
    var my_csv = client.responseText;
    my_csv = my_csv.split("\n");
    var dives_set = new Array();
    for (var i=0;i<my_csv.length;i++){
        dives_set.push(my_csv[i].split(","));
    }
    
    // Add the dives on the list to the UI
    for (var i=0;i<dives_set.length;i++){
        $("#dive-database-table").append('<tr class="dive-entry" id="'+dives_set[i][0]+'"><td class="dive-id">'+dives_set[i][0]+'</td><td class="dive-name">'+dives_set[i][1]+'</td><td class="dive-experience">Still learning</td><td class="dive-predicted-score">42.00</td><td class="dive-high-score">42.00</td><td class="dive-average-score">42.00</td><td class="dive-last-performed">1/07/2016</td><td class="dive-selector"><a class="selection-circle">&nbsp;</a></td></tr>');
    }
    
    
    // Action Listeners
    $(".dive-entry").click(function() {
        toggleDive(this);
    });

    // Listener Functions
    function toggleDive(clicked) {
        console.log("toggling!");
        $("#divelist-container").addClass("hide-quicklist");
        $(clicked).toggleClass("selected");
        if ($(clicked).hasClass("selected")) { // Add it to the box
            $("#list-view").append('<span class="selected-dive" id="'+clicked.id+'_selected">'+clicked.id+' &nbsp; <strong>Dive</strong></span>');
        } else { // remove it from the box
            $('#'+clicked.id+'_selected').remove();
        }

    }
});


