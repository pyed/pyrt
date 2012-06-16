/*  Copyright (C) 2012 by mountainpenguin (pinguino.de.montana@googlemail.com)
 *  http://github.com/mountainpenguin/pyrt
 *
 *  This file is part of pyRT.
 *  
 *  pyRT is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  pyRT is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with pyRT.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

var sock = null;
if (window.document.location.protocol == "https:") {
     var socket_protocol = "wss"
} else {
     var socket_protocol = "ws"
}

$(document).ready( function () {
    sock = new window.WebSocket(socket_protocol + "://" + window.document.location.host + "/createsocket");
    sock.onmessage = handleMessage;
    sock.onerror = function (evt) {
        console.log("socket error", evt, sock);
    }
    sock.onopen = function (evt) {
        console.log("socket opened", evt, sock);
    }
    sock.onclose = function (evt) {
        console.log("socket closed", evt, sock);
    }
    $("#path").keyup( function (e) {
        sock.send("request=exists&path=" + $(this).val());
    });
    $("#path_browse").click( function (e) {
        // open a dialog window
        if ($("#path_browse_div").hasClass("hidden")) {
            $("#path_browse_div").removeClass("hidden");
            initTree();
        } else {
            $("#path_browse_div").addClass("hidden");
            $("#path_browse_div").empty();
            return false;
        }
    });
    $("#create").click( function (e) {
       submitForm(); 
    });
    $(".filetree_item").live("click", function () {
        var fullpath = $(this).next().html();
        $(".filetree_item").each( function () {
            $(this).removeClass("selected");
        });
        $(this).addClass("selected");
        $("#path").val(fullpath);
        
    });
});

function initTree() {
    var elem = $("#path_browse_div");
    var rootDir = $("#root_dir").html();
    sock.send("request=filetree&rootDir=" + rootDir);
}

function submitForm() {
    var ERROR = false;
    
    var path = $("#path").val();
    var announce = $("#announce").val();
    if (!announce) {
        $("#announce").css("border", "1px solid red").css("color", "red").keydown( function () {
            $(this).css("border","").css("color", "");
        });
        ERROR = true;
    }
    var piece = $("#piece").val();
    var _private = $("#private").val();
    var comment = $("#comment").val();
    if (!comment) {
        comment = $("#comment").attr("placeholder");
    }
    var output = $("#output").val();
    if (!output) {
        var letters = "abcdefghijklmnopqrstuvwxyz"
        output = ""
        for (i=0; i<15; i++) {
            output += letters[Math.floor(Math.random() * 26)];
        }
        output += ".torrent"
        $("#output").val(output);
    } else if (output.indexOf(".torrent") !== output.length - 8) {
        output += ".torrent"
        $("#output").val(output);
    }
    if (ERROR) {
        return false;
    } else {
        console.log(path, announce, piece, _private, comment, output);
    }
    
}

function handleMessage(evt) {
    if (evt.data.indexOf("ERROR") == 0) {
        console.log("socket error:", evt.data);
    } else {
        var data = JSON.parse(evt.data);
        req = data.request;
        resp = data.response;
        if (req == "filetree") {
            var filetree = $(resp);
            filetree.treeview({
                collapsed: true
            });
            $("#path_browse_div").append(filetree);
        } else if (req == "exists") {
            if (resp) {
                $("#path").css("color", "");
            } else {
                $("#path").css("color", "red");
            }
        }
    }
}

function navigate_tab(elem) {
    window.location.replace(window.location);
}

function navigate_tab_toHome(elem) {
    window.location = "/?view=" + elem.id.split("tab_")[1];
}