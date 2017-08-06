
//This was the code I used to set up the immutable data and allow entries to be inserted
// This does not needed to be included in the websites so I

var name = "safechat";
window.safeCrypto.sha3Hash(auth, name)
  .then((hash) => {
      console.log('SHA3 Hash generated: ', hash.toString('hex'));
      console.log(hash);
      window.safeMutableData.newPublic(auth, hash, 3000)
        .then((mdHandle) => {

          // window.safeMutableData.quickSetup(mdHandle, {0: 'Welcome to Safe Chat a project by Joseph Meagher. If you like this you can send maidsafecoins to: 1Dksk7aA6PPpttznZi73d8xzsw4ERHSTLc '})
          //   .then(() =>
          //     console.log('New MutableData created and setup')
          //     .then(_ =>{

                window.safeMutableData.newPermissionSet(auth)
                .then((h) =>
                  pmSetHandle = h)
                .then(_ =>
                  window.safeMutableDataPermissionsSet.setAllow(pmSetHandle, 'Insert'))
                .then(_ =>
                  window.safeMutableData.getVersion(mdHandle))
                .then((version) =>
                  window.safeMutableData.setUserPermissions(mdHandle, null, pmSetHandle, version + 1))
                .then(_ =>
                  console.log('Finished setting user permission'));




                // window.safeMutableData.getEntries(mdHandle)
                //   .then((entriesHandle) => {
                //     window.safeMutableDataEntries.forEach(entriesHandle,
                //       (key, value) => {
                //         console.log('Entry Handle: ', entriesHandle);
                //         console.log('File found: ', uintToString(key));
                //         console.log('Value: ', uintToString(value.buf));
                //       });
                //     });

                //     window.safeMutableData.getPermissions(mdHandle)
                //  .then((permsHandle) =>
                //  window.safeMutableDataPermissions.len(permsHandle))
                //   .then((len) => console.log('Number of permissions entries in the MutableData: ', len));
              });
      });
// });
