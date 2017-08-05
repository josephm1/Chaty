//Intial function
"Use strict";

var auth;
var latestkey= 0;

$('#sendmessage').click(function() {
sendmessage();
});

//initialises and authorises with the network
(function() {
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
        .then((auth) => {
          // console.log(auth);

          window.safeApp.connectAuthorised(appHandle, auth)
            .then((authorisedAppHandle) => {
              //returns authorised app token
              window.auth = authorisedAppHandle;
              Materialize.toast("Authorised App Token: " + authorisedAppHandle, 3000, 'rounded');
              getMessages();

              // console.log(authorisedAppHandle);
            });
        });
    }, (err) => {
      console.error(err);
      // Materialize.toast(err, 3000, 'rounded');
    });
})();



function getMessages() {
  var name = "safechat";
  window.safeCrypto.sha3Hash(auth, name)
    .then((hash) => {
      window.safeMutableData.newPublic(auth, hash, 2000)
        .then((mdHandle) => {
          window.safeMutableData.getEntries(mdHandle)
            .then((entriesHandle) => {
              messages.innerHTML = "";
              var latestkey= 0;
              window.safeMutableDataEntries.forEach(entriesHandle,
                (key, value) => {
                  console.log('Key: ', uintToString(key));
                  console.log('Value: ', uintToString(value.buf));
                  $("#messages").append('<div class="row"><div class="card-panel yellow"><span class="blue-text">' + uintToString(value.buf) + '</span></div></div>');
                  window.latestkey++;
                });
            });
        });
    });
}

function sendmessage() {
  var name = "safechat";
  window.safeCrypto.sha3Hash(auth, name)
    .then((hash) => {
      window.safeMutableData.newPublic(auth, hash, 2000)
        .then((mdHandle) => {
          window.safeMutableData.newMutation(auth)
            .then((mutationHandle) => {
              window.safeMutableDataMutation.insert(mutationHandle, latestkey.toString(), textarea.value)
                .then(_ =>
                  window.safeMutableData.applyEntriesMutation(mdHandle, mutationHandle))
                .then(_ =>
                  console.log('New entry was inserted in the MutableData and committed to the network'));
                  getMessages();
            });
        });
    });
}

function uintToString(uintArray) {
  return new TextDecoder("utf-8").decode(uintArray);
}
