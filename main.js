//Intial function
"Use strict";
(async function() {
  try {
    $('#sendmessage').click(function() {
      authorise();
    });
    $('#refresh').click(function() {
      getMessages();
    });

    const app = {
      name: "Chaty",
      id: "joe",
      version: "1",
      vendor: "chaty.joe",
    };

    let appHandle = await window.safeApp.initialise(app);
    auth = await window.safeApp.connect(appHandle);

    Materialize.toast(" App Token: " + auth, 3000, 'rounded');
    authorised = false;
    getMessages();

  } catch (err) {
    console.log(err);
  }
})();

async function getMessages() {
  let chatyHash = await window.safeCrypto.sha3Hash(auth, "chaty");
  let chatyHandle = await window.safeMutableData.newPublic(auth, chatyHash, 54321);
  let entriesHandle = await window.safeMutableData.getEntries(chatyHandle);

  messages.innerHTML = "";
  let time = new Date().getTime();

  window.safeMutableDataEntries.forEach(entriesHandle,
    (key, value) => {

      if (uintToString(value.buf).length < 300 &&
        uintToString(value.buf) !== "" &&
        parseInt(uintToString(key)) < time &&
        parseInt(uintToString(key)).toString().length === 13 &&
        uintToString(key).length === 13) {

        console.log('Key: ', uintToString(key));
        console.log('Value: ', uintToString(value.buf));
        $("#messages").append('<div class="row"><div class="card-panel yellow"><span class="blue-text">' +
          uintToString(value.buf) +
          '</span></div></div>');
      }
      window.scrollTo(0, document.body.scrollHeight);
    }, (err) => {
      console.error(err)
    });
  window.safeMutableDataEntries.free(entriesHandle);
  window.safeMutableData.free(chatyHandle);
}


async function authorise() {
  try {
    if (authorised === false) {
      window.safeApp.free(auth);

      auth = "";
      const app = {
        name: "Chaty",
        id: "joe",
        version: "1",
        vendor: "chaty.joe",
      };
      const permissions = {
        '_public': ['Read']
      };

      let appHandle = await window.safeApp.initialise(app);
      let authURI = await window.safeApp.authorise(appHandle, permissions);
      let authorisedAppHandle = await window.safeApp.connectAuthorised(appHandle, authURI);

      auth = authorisedAppHandle;
      authorised = true;
      Materialize.toast("Authorised App Token: " + auth, 3000, 'rounded');
      sendMessage();
    } else {
      sendMessage();
    }
  } catch (err) {
    console.log(err);
  }
}

async function sendMessage() {
  try {
    let time = new Date().getTime().toString();

    let chatyHash = await window.safeCrypto.sha3Hash(auth, "chaty");
    let chatyHandle = await window.safeMutableData.newPublic(auth, chatyHash, 54321);
    let mutationHandle = await window.safeMutableData.newMutation(auth);
    await window.safeMutableDataMutation.insert(mutationHandle, time, textarea.value);
    await window.safeMutableData.applyEntriesMutation(chatyHandle, mutationHandle);

    Materialize.toast('Message has been sent to the network', 3000, 'rounded');
    window.safeMutableDataMutation.free(mutationHandle);
    window.safeMutableData.free(chatyHandle);

    getMessages();

    textarea.value = '';
  } catch (err) {
    console.log(err);
  }
}

function uintToString(uintArray) {
  return new TextDecoder("utf-8").decode(uintArray)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
