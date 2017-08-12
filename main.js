//Intial function
"Use strict";

$('#sendmessage').click(function() {
  authorise();
});
$('#refresh').click(function() {
  getMessages();
});

//initialises and authorises with the network
(function() {
  var app = {
    name: "Safe Chat",
    id: "joe",
    version: "1",
    vendor: "joe",
  };


  window.safeApp.initialise(app)
    .then((appHandle) => {
      console.log("Initialise Token: " + appHandle);
      window.safeApp.connect(appHandle)
        .then((appHandle) => {
          //returns app token
          auth = appHandle;
          authorised = false;
          Materialize.toast(" App Token: " + auth, 3000, 'rounded');
          getMutableDataHandle();
        });
    }, (err) => {
      console.error(err);
      Materialize.toast(err, 3000, 'rounded');
    });
})();

function authorise() {
  if (authorised === false){
  window.safeApp.free(auth);
  auth = "";
    var app = {
      name: "Safe Chat",
      id: "joe",
      version: "1",
      vendor: "joe",
    };

    var permissions = {
      '_public': [
        'Read',
        'Insert'
      ]
    };

    var owncontainer = {
      own_container: true
    };

    window.safeApp.initialise(app)
      .then((appHandle) => {
        console.log("Initialise Token: " + appHandle);
        window.safeApp.authorise(appHandle, permissions, owncontainer)
          .then((authURI) => {
            // console.log(auth);
            window.safeApp.connectAuthorised(appHandle, authURI)
              .then((authorisedAppHandle) => {
                //returns authorised app token
                auth = authorisedAppHandle;
                authorised = true;
                Materialize.toast("Authorised App Token: " + auth, 3000, 'rounded');
                getMutableDataHandle();
                sendMessage();
              });
          });
      }, (err) => {
        console.error(err);
        Materialize.toast(err, 3000, 'rounded');
      });
    } else {
      sendMessage();
    }
  }

function getMutableDataHandle() {
  var name = "safechat";
  window.safeCrypto.sha3Hash(auth, name)
    .then((hash) =>
      window.safeMutableData.newPublic(auth, hash, 3000))
    .then((safeChatHandle) => {
      mdHandle = safeChatHandle;
      getMessages();
    });
}

function getMessages() {
  window.safeMutableData.getEntries(mdHandle)
    .then((entriesHandle) => {
      messages.innerHTML = "";
      window.safeMutableDataEntries.forEach(entriesHandle,
        (key, value) => {
          console.log('Key: ', uintToString(key));
          console.log('Value: ', uintToString(value.buf));
          $("#messages").append('<div class="row"><div class="card-panel yellow"><span class="blue-text">' + uintToString(value.buf) + '</span></div></div>');
          window.scrollTo(0, document.body.scrollHeight);
        });
    }, (err) => {
      console.error(err);
      // Materialize.toast(err, 3000, 'rounded');
    });
}

function sendMessage() {
  window.safeMutableData.newMutation(auth)
    .then((mutationHandle) => {
      var date = new Date();
      var time = date.getTime();
      window.safeMutableDataMutation.insert(mutationHandle, time.toString(), textarea.value)
        .then(_ =>
          window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle))
        .then(_ => {
          Materialize.toast('Message has been sent to the network', 3000, 'rounded');
          getMessages();
        });
      textarea.value = "";

    });
}

function uintToString(uintArray) {
  return new TextDecoder("utf-8").decode(uintArray)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
