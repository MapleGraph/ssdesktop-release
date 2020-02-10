$(document).ready(function() {

    // Global Variables //

    isMessengerOpen = false

    /* ======= Socket Logic ======= */

    const clientMessage = ({ message, time }) => `
      <div class="queuebuster-conversation-part queuebuster-conversation-part-user">
        <div class="queuebuster-comment-container queuebuster-comment-container-user">
          <div class="queuebuster-comment">
            <div class="queuebuster-blocks">
              <div class="queuebuster-block queuebuster-block-paragraph">${message}</div>
            </div>
          </div>
        </div>
        <span>
          <div class="queuebuster-conversation-part-metadata">
            <div class="queuebuster-conversation-part-metadata-save-state">${time}</div>
          </div>
        </span>
      </div>
    `;

    const serverMessage = ({ message, time, image }) => `
      <div class="queuebuster-conversation-part queuebuster-conversation-part-admin">
        <div class="queuebuster-comment-container queuebuster-comment-container-admin">
          <div class="queuebuster-comment-container-admin-avatar">
            <div class="queuebuster-avatar"><img src="https://queuebuster.co/openassets/images/logo.png"></div>
          </div>
          <div class="queuebuster-comment">
            <div class="queuebuster-blocks">
              <div class="queuebuster-block queuebuster-block-paragraph">${message}</div>
            </div>
          </div>
        </div>
        <span>
          <div class="queuebuster-conversation-part-metadata">
            <div class="queuebuster-conversation-part-metadata-save-state">${time}</div>
          </div>
        </span>
      </div>
    `;

    function formatDate(date) {
      var monthNames = [
        "Jan", "Feb", "March",
        "Apr", "May", "June", "July",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
      ];

      var day = date.getDate();
      var monthIndex = date.getMonth();
      var time = new Date().toLocaleString('en-US', { hour: 'numeric',minute:'numeric', hour12: true });

      return time + ' - '+ monthNames[monthIndex] + ' ' + day;
    }

    function showHistory(messages) {
        for (var i = 0; i < messages.length; i++) {
            if (messages[i]['from'] === 'client') {
                $('#queuebuster-conversation-messages').append([
                  { message: messages[i]['message'], time: messages[i]['time'] }
                ].map(clientMessage).join(''));
            }else {
                  if (messages[i]['message'].indexOf('<script>') != -1) {
                    continue;
                  }

                $('#queuebuster-conversation-messages').append([
                  { message: messages[i]['message'], time: messages[i]['time'], image: "" }
                ].map(serverMessage).join(''));
            }
            $('#queuebuster-conversation-body-parts').scrollTop($('#queuebuster-conversation-body-parts')[0].scrollHeight);
        }
    }

    const audio = new Audio(baseURI+'/assets/notification.mp3');
    const io = ws(chatURI, { query: { fingerprint: fingerprint, clientDetails: clientDetails } })
    let room_id = ''

    const socket = io.channel('chat').connect(function(){
        socket.emit('fingerprint', fingerprint);
    })

    socket.once('greet', function (message) {
      socket.joinRoom(message.room_id, {fingerprint}, function (error, joined) {
        if (joined) {
          showHistory(message.history)
          room_id = message.room_id
        }else {
          console.log(error);
        }

      })
    })

    // socket.on('message', function (message) {
    //     $("#queuebuster-conversation-messages").append('<span>'+message+'</span><br>')
    // })

    socket.on('roommessage', function (room, message) {
        $('#queuebuster-conversation-messages').append([
          { message: message, time: formatDate(new Date()), image: "" }
        ].map(serverMessage).join(''));
        audio.play();

        if (!isMessengerOpen) {
           $("#queuebuster-borderless-message").html(message)
           $(".queuebuster-borderless").css('display', 'block')
           $("#queuebuster-container-body").css('display', 'block')
           $("#queuebuster-container-body").css("cssText", "box-shadow: none !important;")
           $(".queuebuster-messenger").css('display', 'none')
        }

        $('#queuebuster-conversation-body-parts').scrollTop($('#queuebuster-conversation-body-parts')[0].scrollHeight);
    })

    // socket.on('personalmessage', function (message) {
    //     $("#queuebuster-conversation-messages").append('<span>'+message+'</span><br>')
    // })

    $(".queuebuster-conversation-text").keypress(function(e) {

        if (e.keyCode != 13) return;

        if(e.shiftKey) return;

        var msg = $(this).val().replace(/\n/g, "");
        if (msg == null || msg == '') {
        	return false;
        }
        msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var message = { message: msg, room_id: room_id }
        socket.emit('roommessage', message)
        $('#queuebuster-conversation-messages').append([
          { message: message.message, time: formatDate(new Date()) }
        ].map(clientMessage).join(''));
        $(".queuebuster-conversation-text").val('')
        $(this).val("");
        $('#queuebuster-conversation-body-parts').scrollTop($('#queuebuster-conversation-body-parts')[0].scrollHeight);

        return false;

    });

    $(".queuebuster-composer-send-button").click(function(e) {

        var msg = $(".queuebuster-conversation-text").val().replace(/\n/g, "");
        if (msg == null || msg == '') {
        	return false;
        }
        
        msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var message = { message: msg, room_id: room_id }
        socket.emit('roommessage', message)
        $('#queuebuster-conversation-messages').append([
          { message: message.message, time: formatDate(new Date()) }
        ].map(clientMessage).join(''));
        $(".queuebuster-conversation-text").val('')
        $(".queuebuster-conversation-text").val("");
        $('#queuebuster-conversation-body-parts').scrollTop($('#queuebuster-conversation-body-parts')[0].scrollHeight);

        return false;

    });

    /* ======= Chat UI ======= */


    // Chat Launcher
    $(".queuebuster-launcher").on('click', function(){
        if (isMessengerOpen) {
            $("#queuebuster-container-body").css('display', 'none')
            $(".queuebuster-launcher").removeClass('queuebuster-launcher-active')
            isMessengerOpen = false
        } else {
            $("#queuebuster-container-body").css('display', 'block')
            $(".queuebuster-borderless").css('display', 'none')
            $("#queuebuster-container-body").css("cssText", "box-shadow: 0 5px 40px rgba(0, 0, 0, .16) !important;")
            $(".queuebuster-messenger").css('display', 'block')            
            $(".queuebuster-launcher").addClass('queuebuster-launcher-active')
            $('#queuebuster-conversation-body-parts').scrollTop($('#queuebuster-conversation-body-parts')[0].scrollHeight);
            isMessengerOpen = true
        }
    })

    // Chat Close
    $(".queuebuster-header-buttons-close").on('click', function(){
        $("#queuebuster-container-body").css('display', 'none')
        $(".queuebuster-launcher").removeClass('queuebuster-launcher-active')
        isMessengerOpen = false
    })

});
