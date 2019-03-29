//Source : https://bootsnipp.com/snippets/y8e4W
/*
var story = {
    "config":{
        "displayActorName":true
    }
    "actor":{
        "Jean":{
            "avatar":"https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48",
            "side":"left"
        },
        "Paul":{
            "avatar":"https://a11.t26.net/taringa/avatares/9/1/2/F/7/8/Demon_King1/48x48_5C5.jpg",
            "side":"right"
        }
    },
    "conversation":[
        {
            "actor":"Jean",
            "timestamp":"1521374361",
            "text":"Bonjour Paul !",
            "payload":"",
            "delay":"0",
            "tapeFlag":false,
            "ads":false
        },
        {
            "actor":"Paul",
            "timestamp":"1521374362",
            "text":"Bonjour Jean !",
            "payload":{},
            "delay":"0",
            "tapeFlag":true,
            "ads":false
        },
        {
            "actor":"Paul",
            "timestamp":"1521374363",
            "text":"",
            "payload":{
                "type":"video",
                "url": "https://storage.googleapis.com/coverr-main/mp4/Dog-and-Fly.mp4"
            },
            "delay":"2000",
            "tapeFlag":false,
            "ads":false
        }
    ]
};
*/
var emptyStory = {config:{"storyName":"New Story", "adsEachMessage": -1,"displayActorName":true, "displayActorAvatar":true, "displayMessageDate":true,"customCSS":{}},actor:{},conversation:[]};
var story = emptyStory;
//--Load from local
function importLocal(){
    var message = "Actuellement Stocké:\n"
    $.each(localStorage, function(index, element){
        if(index.search("story:") >= 0 && (index.match(/:/g)||[]).length == 1)
            message += "- "+index.substring(6).toLowerCase()+"\n";
    });
    var storyName = prompt(message + "\nStory name :\n");
    if(storyName != null){
        if(localStorage["story:"+storyName.toLowerCase()]){
            story = JSON.parse(localStorage["story:"+storyName.toLowerCase()]);
            reloadChat();
            if(editor)
                loadEditor();
        }
        else{
            alert("Story not found !");
        }
    }
}

//--
function saveLocal(){
    localStorage["story:"+story.config.storyName.toLowerCase()] = JSON.stringify(story);
    console.log("story saved in localStorage!");
}

//--
var acteurCount;
var acteurMax = 5;

var messageCount;
var messageMax = 100;

var textCount;
var textMax = 50;
var characterCount;

var imageCount;
var imageMax = 20;

var videoCount;
var videoMax = 10;

var audioCount;
var audioMax = 20;
function updateStats(selector = "all"){
    console.log(selector);
    acteurCount=0;
    for(let actor in story.actor)
        acteurCount++;

    messageCount = 0;
    textCount = 0;
    imageCount = 0;
    videoCount = 0;
    audioCount = 0;
    characterCount =0;
    $.each(story.conversation, function( index, message){
        if(message.actor == selector || selector == "all"){
            messageCount++;
            if(message.text !== ""){
                textCount++;
                characterCount += message.text.length;
            }
            else{
                switch(message.payload.type){
                    case "image":
                        imageCount++;
                        break;
                    case "video":
                        videoCount++;
                        break;
                    case "audio":
                        audioCount++;
                        break;
                }
            }
        }
    });    
    $("#acteurStats>label>p").text(acteurCount+"/"+acteurMax);
    $("#messageStats>label>p").text(messageCount+"/"+messageMax);
    $("#textStats>label>p").text(textCount+"/"+textMax);
    $("#imageStats>label>p").text(imageCount+"/"+imageMax);
    $("#videoStats>label>p").text(videoCount+"/"+videoMax);
    $("#audioStats>label>p").text(audioCount+"/"+audioMax);
    $("#characterStats>label>p").text(characterCount);
    var date = new Date(null);
    date.setSeconds(localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"]); // specify value for SECONDS here
    var result = date.toISOString().substr(11, 8);
    $("#timeSpentStats>label>p").text(result);
}
//-- ExportJSON
function exportJSON(){
    var json_string = JSON.stringify(story, undefined, 2);
    var link = document.createElement('a');
    link.download = story.config.storyName+'.json';
    var blob = new Blob([json_string], {type: 'text/plain'});
    link.href = window.URL.createObjectURL(blob);
    link.click();
}
//-- debugJSON
function debugJSON(){
    console.log(story);
}
//--
function actorLoadToEditor(name){
    var actor = story.actor[name];
    $('#actorWindow input[name="edit"]').prop("checked",true);
    $('#actorWindow input[name="oldName"]').val(name);
    $('#actorWindow input[name="name"]').val(name);
    $('#actorWindow input[name="avatar"]').val(actor.avatar);
    $('#actorWindow input[type="radio"]').prop("checked",false);
    if(actor.side == "left")
        $('#actorWindow input[value="left"]').prop("checked", true);
    else
        $('#actorWindow input[value="right"]').prop("checked", true);
    $('#actorWindow').show();
}
//-- Actor
function actorSubmit(){
    var form = document.forms["actorForm"];
    if(form["edit"].checked){
        if(form["oldName"].value !== form["name"].value){
            for(let message of story.conversation){
                if(message.actor == form["oldName"].value)
                    message.actor = form["name"].value;
            }
            delete story.actor[form["oldName"].value];
            $("#actorSelector option[value='"+form["oldName"].value+"']").remove();
            $("#actorList li").each(function(index, element){
                if($(element).text() == form["oldName"].value){
                    $(element).remove();
                    return false;
                }
            });
        }
    }
    if(form["avatar"].value == "")
        form["avatar"].value = "https://cdn.iconscout.com/icon/free/png-256/avatar-380-456332.png";
    var newActor = {"avatar":form["avatar"].value,"side": form["side"].value};
    addActor(form["name"].value, newActor);
}

function addActor(name, actor){
    story.actor[name] = actor;
    if(editor)
        addActorToEditor(name);
    $("#actorWindow").hide();
    reloadChat();
}

function addActorToEditor(name){
        $("#actorList").append('<li>'+name+'<span class="glyphicon glyphicon-remove actorRemove"></span><span class="glyphicon glyphicon-cog actorEdit"></span></li>');
        $(".actorSelector").append('<option value="'+name+'">'+name+'</option>');
        $('#actorList>li:last-child>.actorRemove').click(function(e){
            if(confirm("it will delete every message of this actor. Are you sure ?"))
                removeActor(this)
        });
        $('#actorList>li:last-child>.actorEdit').click(function(e){
            var name = $(this).parent().text();
            actorLoadToEditor(name);
        });
}

function removeActor(actorElement){
    var name = $(actorElement).parent().text();
    /*story.conversation.forEach(function(element, index){
        if(element.actor == name)
    });*/
    for(var i = 0; i < story.conversation.length; i++){
        if(story.conversation[i].actor == name){
            removeMessage(i);
            i--;
        }
    }
    delete story.actor[name]
    $(".actorSelector option[value='"+$(actorElement).parent().text()+"']").remove();
    $(actorElement).parent().remove();
    console.log("actor:"+ name+" Deleted");
}

function removeMessage(messageId){
    for(var i = messageId+1; i <= id; i++){
        $($('#tchat>li').get(i)).attr("id", i-1);
    }
    story.conversation.splice(messageId, 1);
    if(messageId <= id){
        id--;
    }
    console.log($('#tchat>li').get(messageId));
    $('#tchat>li').get(messageId).remove();
}

function messageSubmit(){
    var form = document.forms["messageForm"];
    var message = {
            "actor":"",
            "timestamp":"",
            "text":"",
            "payload":"",
            "delay":"0",
            "tapeFlag":false,
            "ads":false
        };
    message.actor = form["actor"].value;
    message.timestamp = new Date(form["datetime"].value).getTime() /1000;
    if(form["type"].value == "text"){
        message.text = form["text"].value;
        message.payload = {};
    }else{
        message.text = "";

        if(form["content-type"].value == "image")
            message.payload = {"type": "image"};
        else if(form["content-type"].value == "video")
            message.payload = {"type": "video"};
        else
            message.payload = {"type": "audio"};

        message.payload.url = form["content-url"].value;
    }
    message.delay = parseInt(form["delay"].value) * 1000;
    message.tapeFlag = false;
    if(form["tapeFlag"].checked)
        message.tapeFlag = true;

    message.ads = false;
    if(form["ads"].checked)
        message.ads = true;
    console.log(form["id"].value);
    if(form["edit"].checked)
        editMessage(form["id"].value, message);
    else
        addMessage(form["id"].value, message);
    $("#messageWindow").hide();
}
function editMessage(messageId, message){
    removeMessage(messageId);   
    addMessage(messageId,message);
}

function addMessage(messageId, message){
    id++;
    if(messageId === ""){
        messageId = id+1;
        story.conversation.push(message);
        insertChat(message, true);
    }else{
        messageId = parseInt(messageId);
        story.conversation.splice(messageId, 0, message);
        insertChat(message, false, messageId);
        for(var i = messageId+1; i < id+1; i++){
            $($('#tchat>li').get(i)).attr("id", i);
        }
    }
}

function showText(){
    $("#content-payload").hide();
    $("#content-text").show();
}

function showPayload(){
    $("#content-text").hide();
    $("#content-payload").show();
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes;// + ' ' + ampm;
    return strTime;
}            
function messageContentDisplay(text, payload){
        var content =""
        if(text !=   ""){
            content += '<p class="text-area">'+ text +'</p>';
        }
        else{
            switch(payload.type){
                case "image":
                    content += '<p class="text-area"><img src="'+ payload.url+'"/></p>';
                    break;
                case "video":
                    content += '<p class="text-area"><video controls autoplay muted>'+
                                  '<source src="'+payload.url+'" type="video/mp4">'+
                                  'Your browser does not support the video tag.'+
                                '</video></p>';
                    break;
                case "audio" :
                    content += '<p class="text-area"><audio controls><source src="'+payload.url+'" type="audio/mpeg">Your browser does not support the audio element.</audio></p>';
                    break;
            }
        }
        return content;
}
//-- No use time. It is a javaScript effect.
function insertChat(message, append, messageId = null){
    if(messageId === null)
        messageId = id;
    var actor = story.actor[message.actor];
    var control = "";
    var date = formatAMPM(new Date(message.timestamp*1000));
    
    if (actor.side == "left"){
        control = '<li class="message" id="'+messageId+'" style="width: 100%"><div class="align-l">' +
                        '<div class="msj macro">';
        if(story.config.displayActorAvatar)
            control +=      '<div class="avatar"><img class="img-circle" style="width: 48px;" src="'+ actor.avatar +'" /></div>';
        control +=          '<div class="text text-l">';
        if(story.config.displayActorName)
            control +=      '<span class="align-l">'+message.actor+'</span>';
        control +=          messageContentDisplay(message.text, message.payload);
        if(story.config.displayMessageDate){
            control +=          '<p class="date">';
            if(message.ads)
                control +=              '<small class="ads">Advertising</small>';
            control +=                  '<small>'+date+'</small>'+
                                '</p>';
        }
        control +=          '</div>' +
                        '</div>' ;
        if(editor)
            control +=  '<div class="toolbar"><span class="glyphicon glyphicon-remove messageRemove"></span><span class="glyphicon glyphicon-cog messageEdit"></span></div>'+ 
                    '</div></li>';                    
    }else if(actor.side == "right"){
        control =   '<li class="message" id="'+messageId+'" style="width: 100%;"><div class="align-r">';
        if(editor)
            control +=  '<div class="toolbar"><span class="glyphicon glyphicon-remove messageRemove"></span><span class="glyphicon glyphicon-cog messageEdit"></span></div>';        
        control +=      '<div class="msj-rta macro">' +
                            '<div class="text text-r">';
        if(story.config.displayActorName)
            control +=      '<span class="align-r">'+message.actor+'</span>';
        control +=              messageContentDisplay(message.text, message.payload);
        if(story.config.displayMessageDate){
            control +=          '<p class="date">';
            if(message.ads)
                control +=              '<small class="ads">Advertising</small>';
            control +=                  '<small>'+date+'</small>'+
                                '</p>';
        }
        control +=      '</div>';
        if(story.config.displayActorAvatar)
            control +=      '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width: 48px;" src="'+actor.avatar+'" /></div>';                 
        control +=  '</div></li>';
    }
    if(append || !$("#tchat>li").length){
        $("#tchat").append(control)
    }
    else{
        if(messageId)
            $($("#tchat>li").get(messageId-1)).after(control);
        else{
            console.log($("#tchat>li").get(messageId));
            $($("#tchat>li").get(messageId)).before(control);
        }
    }
    $("#tchat").scrollTop($("#tchat").prop('scrollHeight'));
}

function resetChat(){
    $("#tchat").empty();
}

function reloadChat(){
    resetChat();
    document.title = story.config.storyName;
    loadCSS();
    id=0;
    startStory();
}
/*
Write message like in a tchat
$(".mytext").on("keydown", function(e){
    if (e.which == 13){
        var text = $(this).val();
        if (text !== ""){
            insertChat("me", text);              
            $(this).val('');
        }
    }
});
*/

/*$('body > div > div > div:nth-child(2) > span').click(function(){
    $(".mytext").trigger({type: 'keydown', which: 13, keyCode: 13});
})*/

//-- Async
async function asyncLoop(array, callback) {
    let tapeRequiredFlag = false;
    while(id < array.length && !tapeRequiredFlag){
        if(array[id].tapeFlag && !editor){
            tapeRequiredFlag = true;
        }else{
            await callback(array[id], id, array);
            id++;
        }
    }
    if(id >= array.length && id > 0)
        id--;
}
const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
const startStory = async () => {
  await asyncLoop(story.conversation, async (message) => {
    var delay = 0;
    if(!editor){
        updateSession();
        updateAds();
        delay = message.delay;
    }
    await waitFor(delay);
    insertChat(message, true);
  });
  if(id >= story.conversation.length)
    console.log('Done');
}

function updateSession(){
    if(localStorage["story:"+story.config.storyName+":lastMessage"]){
        localStorage["story:"+story.config.storyName+":lastMessage"] = id;
    }else{
        localStorage["story:"+story.config.storyName+":lastMessage"] = 0;
    }
}

function updateAds(){
    if(id % story.config.adsEachMessage == 0 && id > 0 && story.config.adsEachMessage >0){
        var ads = `<div style="text-align: center;background: darkgray;"><h2>PUB</h2>
                   </div>`;

        $("#tchat").append(ads);
        //$("#tchat").append(adsContent);
    }
}

function adsContent(){

}

function addEditable(element){
    var width = $(element).width();
    element.replaceWith('<textarea class="textEdit" expand>'+element.text()+'</textarea>');
    $(".textEdit").width(width);
    $(".textEdit").on('keypress',function(e){
        console.log(e.which);
        if(e.which == 13)
            removeEditable();
    })
}
function removeEditable(){
    $(".textEdit").each(function(element){
        var messageId = $(this).closest('.message').attr("id");
        story.conversation[messageId].text = $(this).val();
        $(this).replaceWith('<p>'+$(this).val()+'</p>');
    });
}

function importJSON(){
    console.log("loading");
    var json = $("#fileInput").prop('files')[0]
    if(json){
        var reader = new FileReader();
        reader.readAsText(json, "UTF-8");
        reader.onload = function (evt) {
            loadJSON(evt.target.result);
        }
        reader.onerror = function (evt) {
            alert("error reading file");
        }
        $(".story-input").hide();
    }else{
        console.log("error");
    }
}
function loadEditor(){
    $("#actorList>li").remove();
    $.each(story.actor,function(index){
        addActorToEditor(index);
    });
}

function loadConfig(){
    var form = document.forms["configForm"];
    $('#configWindow input[type="radio"]').prop("checked",false);
    $('#configWindow input[type="checkbox"]').prop("checked",false);
    if(story.config.storyName)
        $('#configWindow input[name="storyName"]').val(story.config.storyName);
    else
        $('#configWindow input[name="storyName"]').val("");

    if(story.config.adsEachMessage >=0){
        $('#configWindow input[name="ads"]').prop("checked", true);
        $("#adsConfig").show();
        $('#configWindow input[name="adsEachMessage"]').val(story.config.adsEachMessage);
        $('#configWindow #adsOutputId').text(story.config.adsEachMessage);
    }else{
        $('#configWindow input[name="adsEachMessage"]').val("-1");
        $('#configWindow #adsOutputId').val("");
    }

    if(story.config.displayActorName)
        $('#configWindow input[name="displayActorName"]').prop( "checked", true );

    if(story.config.displayActorAvatar)
        $('#configWindow input[name="displayActorAvatar"]').prop( "checked", true );

    if(story.config.displayMessageDate)
        $('#configWindow input[name="displayMessageDate"]').prop( "checked", true );

    if(story.config.customCSS[".msj"]){
        $('#configWindow input[name="msj_l_color"]').val(story.config.customCSS[".msj"].background);
        $('#configWindow input[name="msj_r_color"]').val(story.config.customCSS[".msj-rta"].background);
    }
    if(story.config.customCSS["#tchat"]){
        if(story.config.customCSS["#tchat"].background)
        {
            $('#configWindow input[name="background_type"][value="color"]').prop( "checked", true );
            //$('#configWindow input[name="background_type"][value="url"]').prop( "checked", false );
            $('#configWindow input[name="background_color"]').val(story.config.customCSS["#tchat"].background);
        }else{
            //$('#configWindow input[name="background_type"][value="color"]').prop( "checked", false );
            $('#configWindow input[name="background_type"][value="url"]').prop( "checked", true );
            $('#configWindow input[name="background_url"]').val(story.config.customCSS["#tchat"]["background-image"].substring(5, story.config.customCSS["#tchat"]["background-image"].length-2));
        }
    }
    if(story.config.customCSS[".text-l > p"]){
        $('#configWindow input[name="text_l_color"]').val(story.config.customCSS[".text-l > p"].color);
    }
    if(story.config.customCSS[".text-r > p"]){
        $('#configWindow input[name="text_r_color"]').val(story.config.customCSS[".text-r > p"].color);
    }
    console.log("config loaded");
}



function configSubmit(){
    var form = document.forms["configForm"];

    var adsEachMessage = -1;
    if(form["ads"].checked)
        adsEachMessage = parseInt(form["adsEachMessage"].value);

    var displayActorName = false;
    if(form["displayActorName"].checked)
        displayActorName = true;

    var displayActorAvatar = false;
    if(form["displayActorAvatar"].checked)
        displayActorAvatar = true;

    var displayMessageDate = false;
    if(form["displayMessageDate"].checked)
        displayMessageDate = true;

    var newConfig = {"storyName":form["storyName"].value,
        "adsEachMessage" : adsEachMessage,
        "displayActorName": displayActorName,
        "displayActorAvatar": displayActorAvatar,
        "displayMessageDate": displayMessageDate
    };
    newConfig.customCSS = {
        ".msj":{"background":form["msj_l_color"].value},
        ".msj::before":{"border-color":"transparent "+form["msj_l_color"].value+ " transparent transparent"},
        ".msj-rta":{"background":form["msj_r_color"].value},
        ".msj-rta::after":{"border-color":form["msj_r_color"].value+" transparent transparent transparent"},
        ".text-l > p":{"color":form["text_l_color"].value},
        ".text-r > p":{"color":form["text_r_color"].value},
        ".text-l > span":{"color":form["text_l_color"].value},
        ".text-r > span":{"color":form["text_r_color"].value}

    };
    if(form["background_type"].value == "color"){
        newConfig.customCSS["#tchat"] = {"background":form["background_color"].value};
    }else{
        newConfig.customCSS["#tchat"] = {"background-image":"url(\""+form["background_url"].value+"\")"};
    }
    story.config = newConfig;
    $("#configWindow").hide();
    reloadChat();   
}

function loadJSON(json){
    story = emptyStory;
    if(typeof json == "string")
        story = JSON.parse(json);
    else{
        story = json;
    }
    loadCSS();
    //console.log(story);
    if(editor)
        loadEditor();
    reloadChat();
}

var sheet = null;
function createStylesheet() {
            // Create the <style> tag
            var style = document.createElement("style");
            style.setAttribute("id","customCSS");
            // Add a media (and/or media query) here if you'd like!
            // style.setAttribute("media", "screen")
            // style.setAttribute("media", "only screen and (max-width : 1024px)")

            // WebKit hack :(
            style.appendChild(document.createTextNode(""));

            // Add the <style> element to the page

            document.head.appendChild(style);

            return style.sheet;
}
function loadCSS(){
    $("#customCSS").remove();
    sheet = createStylesheet();
    if(story.config.customCSS && Object.keys(story.config.customCSS).length > 0){
        $.each(story.config.customCSS,function(index, element){
        //story.config.customCSS.forEach(function(element, index){
            var rule = index+"{";
            $.each(element, function(styleIndex, styleValue){
                rule += styleIndex +" : "+ styleValue;
                if(element[Object.keys(element)[Object.keys(element).length - 1]] != styleValue)
                    rule += ","
            });
            rule += "}";
            //console.log(rule);
            sheet.insertRule(rule);
        });
        //sheet.insertRule(".msj{background: "+story.config.customCSS[".msj"]["border-color"]+"}");
        //sheet.insertRule(".msj::before{border-color: transparent" +story.config.customCSS[".msg_l_color"]+ " transparent transparent}");
        //sheet.insertRule(".msj-rta{background: "+story.config.customCSS[".msg_r_color"]+"}");
        //sheet.insertRule(".msj-rta::after{border-color: " +story.config.customCSS[".msg_r_color"]+ " transparent transparent transparent}");
        //css_getclass('.msj').style.background = story.config.customCSS.msg_l_color;
        //css_getclass('.msj::before').style["border-color"] = "transparent" +story.config.customCSS.msg_l_color+ " transparent transparent";
        //css_getclass('.msj-rta').style.background = story.config.customCSS.msg_r_color;
        //css_getclass('.msj-rta::after').style["border-color"] = story.config.customCSS.msg_r_color+ " transparent transparent transparent";
    }
}

function openMessageWindow(messageId, isNew){
    console.log("open message form");
    $('#messageWindow input[name="id"]').val(messageId);
    $('#messageWindow input[type="radio"]').prop("checked", false);
    if(isNew){
        //clean form
        $('#messageWindow input[name="edit"]').prop("checked", false);
        $('#messageWindow input[name="type"][value="text"]').prop("checked", true);
        $('#messageWindow textarea[name="text"]').val("");
        $('#messageWindow input[name="datetime"]').val("");
        $('#messageWindow input[name="content-type"][value="image"]').prop("checked", true);
        $('#messageWindow input[name="content-url"]').val("");
        $('#messageWindow input[name="delay"]').val(0);
        $('#messageWindow input[name="tapeflag"]').prop("checked", false);
    }
    else{
        //Edit flag
        $('#messageWindow input[name="edit"]').prop("checked", true);

        //content type 
        if(story.conversation[messageId].text !== ""){
            $('#messageWindow input[name="type"][value="text"]').prop("checked", true);
            $('#messageWindow textarea[name="text"]').val(story.conversation[messageId].text);
            $('#messageWindow input[name="content-type"][value="image"]').prop("checked", true);
            $('#messageWindow input[name="content-url"]').val("");
        }
        else{
            $('#messageWindow input[name="type"][value="payload"]').prop("checked", true);
            if(story.conversation[messageId].payload.type == "image")
                $('#messageWindow input[name="content-type"][value="image"]').prop("checked", true);
            else if(story.conversation[messageId].payload.type == "video")
                $('#messageWindow input[name="content-type"][value="video"]').prop("checked", true);
            else
                $('#messageWindow input[name="content-type"][value="son"]').prop("checked", true);

            $('#messageWindow input[name="content-url"]').val(story.conversation[messageId].payload.url);
            $('#messageWindow textarea[name="text"]').val("");
        }
        //general value
        $('#messageWindow option[value="'+story.conversation[messageId].actor+'"]').prop("selected", true);
        $('#messageWindow input[name="datetime"]').val(new Date(story.conversation[messageId].timestamp*1000).toISOString().substring(0, 16));
        $('#messageWindow input[name="delay"]').val(story.conversation[messageId].delay / 1000);
        $('#delayOutputId').val(story.conversation[messageId].delay / 1000+ " sec");
        if(story.conversation[messageId].tapeFlag)
            $('#messageWindow input[name="tapeflag"]').prop("checked", true);
        else
            $('#messageWindow input[name="tapeflag"]').prop("checked", false);

        if(story.conversation[messageId].ads)
            $('#messageWindow input[name="ads"]').prop("checked", true);
        else
            $('#messageWindow input[name="ads"]').prop("checked", false);
    }
    $('#messageWindow').show();
    if($("#actorListWindow").css("display") == "block")
        $("#actorListWindow").hide();
}

//$(document).click(function(e){console.log(e.target);story.conversation[id].tapeFlag = false;startStory();})
$(document).ready(function() {
    //-- Init Tchat
    reloadChat();
    
    //Test New tab test story
    /*
    var testUrl = window.location.origin;
    window.location.pathname.split("/").forEach(function(element, index){
        if(element !== "editor" && element !== "editor.html" && element !== "")
            testUrl += "/"+element;
        else if(element !== "")
            testUrl += "/index.html"
    });
    $("#testSubmit").attr("action", testUrl);
    $("#testSubmit").submit(function(){
        document.forms["testForm"].story.value= JSON.stringify(story);
        console.log("redirection")
    })
    */
    $("#actorSubmit").submit(function(){
        actorSubmit();
        return false;
    });
    $("#messageSubmit").submit(function(){
        messageSubmit();
        return false;
    });
    $("#configSubmit").submit(function(){
        configSubmit();
        return false;
    });

    $("body").click(function(event){
        if(!$(event.target).closest(".window").length)
            $(".window").hide();
    });

    $("#tchat").click(function(event) {
        console.log(event.target);
        if(editor){
            if($(event.target).hasClass("messageRemove") || $(event.target).hasClass("messageEdit")){
                var messageId = parseInt($(event.target).closest('.message').attr("id"));
                if($(event.target).hasClass("messageRemove")){
                    removeMessage(messageId);
                }
                else if($(event.target).hasClass("messageEdit")){
                    event.stopPropagation();
                    openMessageWindow(messageId, false);
                }
            }
            else if(($(event.target).hasClass("text") || $(event.target).hasClass("text-area"))  && !$(event.target).hasClass("date")){
                if(!$(event.target).hasClass("textEdit")){
                    removeEditable();
                    if($(event.target).hasClass("text")){
                        addEditable($(event.target).children(":first"));
                        
                    }else{
                        addEditable($(event.target));
                    }
                }
            }else if($(event.target).hasClass("addMessage")){
                if(Object.keys(story.actor).length > 0){
                    event.stopPropagation();
                    openMessageWindow(tempId, true);
                }else{
                    alert("Attention aucun acteur crée!")
                }
            }
            else{
                removeEditable();
            }
        }
        if (story.conversation.length){
            if(story.conversation[id].tapeFlag){
                console.log(event.target);
                story.conversation[id].tapeFlag = false;
                startStory();
            }
        }
        //
        //Save story in coockie
        localStorage["story:"+story.config.storyName.toLowerCase()] = JSON.stringify(story);    
    });
    /* DRAG & DROP Message*/
    var messageSelected = null;
    var tempId = null;
    var timer;
    var time =0;
    var toolbar = '<span class="glyphicon glyphicon-plus addMessage"></span>';
    $("#tchat").mousemove(function(event){
        if(editor){
            if(messageSelected !== null){
                var offset = 0;
                $(messageSelected).css({
                   //left:  event.pageX-offset,
                   top:   event.pageY+25//$(messageSelected).height()+20
                });
                var bar = '<span class="target"></span>';
            }else{
                var bar = '<span class="target">'+toolbar+'</span>';
            }
            if($(event.target).closest('.message').hasClass("message")){
                    var messageElement = $(event.target).closest('.message');
                    var distanceFromCenter = event.pageY-(($(messageElement).offset().top + $(messageElement).height()/2) - $(window).scrollTop()); // if below 0 targetPos is previous else targetPos is next
                    //console.log(distanceFromCenter);
                    if(distanceFromCenter <= -($(messageElement).height()/4)){
                        $(".target").remove();
                        //Previous
                        if(!($(messageElement).prev().hasClass("target"))){
                            $(messageElement).before(bar);
                            tempId = parseInt(messageElement.attr("id"));
                        }
                    }
                    else if(distanceFromCenter >= ($(messageElement).height()/4)){
                        $(".target").remove();
                        //Next
                        if(!($(messageElement).next().hasClass("target"))){
                            $(messageElement).after(bar);
                            tempId = parseInt(messageElement.attr("id"))+1  ;
                        }
                    }
            }else if(!story.conversation.length && !$(".target").length){
                    $("#tchat").append('<span class="target">'+toolbar+'</span>');
                    tempId = 0; 
            }
        }
    });

    $("#tchat").mousedown(function(event){
        if(editor && $(event.target).closest('.message').hasClass("message") &&
            !$(event.target).hasClass("text-area") &&
            !$(event.target).hasClass("textEdit") &&
            !$(event.target).hasClass("messageRemove") &&
            !$(event.target).hasClass("message")){
            timer = self.setInterval(function(){
                time+=100;
                if(time >= 300)
                    selection(event)
                else
                    console.log(time);  
            },100);
        }
    });
    function selection(event){
            var messageElement = $(event.target).closest('.message');
            $(messageElement).addClass("selected");
            $("body").addClass("disableSelection");
            $(".target").empty();
            messageSelected = messageElement
    }

    $("#tchat").mouseup(function(event){
        timer=window.clearInterval(timer);
        time = 0;
        if(editor && messageSelected != null && tempId != null){
            var selectedId = messageSelected.attr("id");
            $(".target").replaceWith(messageSelected);
            $(".target").remove();
            if(tempId>selectedId){
                tempId--;
                var startfrom = selectedId;
            }else{
                var startfrom = tempId;
            }
            story.conversation.move(selectedId,tempId);
            for(var i = startfrom; i <= id+1; i++){
                $('#tchat>li:nth-child('+(i)+')').attr("id", i-1);
            }
        }
        $(messageSelected).removeClass("selected");
        $(messageSelected).css({"left":"",'top':""});
        messageSelected = null;
        $("body").removeClass("disableSelection");
    });

    $("#tchat").mouseleave(function(event){
        //$(".target").remove();
    });
});

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
    console.log("move index:"+from+ " to index:"+to);
};

var focus;
//startSimulation and pauseSimulation defined elsewhere
function handleVisibilityChange() {
    if (document.hidden) {
        focus = window.clearInterval(focus);
    } else  {
    focus = self.setInterval(function(){
        if(!localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"])
            localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"] = 0;
        else if(localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"] == "NaN")
            localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"] = 0;

        localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"] = parseInt(localStorage["story:"+story.config.storyName.toLowerCase()+":timeSpent"]) + 1;
        },1000);
    }
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
handleVisibilityChange();