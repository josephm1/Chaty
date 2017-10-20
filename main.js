//Intial function
'Use strict';
(async function() {
	try {
		$('.dropdown').dropdown();
		$('#feedbackmodal').modal();
		$('#aboutmodal').modal();
		$('#settingsmodal').modal();

		$('#authorise').click(function() {
			authorise();
		});
		$('#refresh').click(function() {
			getMessages();
		});
		$('#feedback').click(function() {
			$('#feedbackmodal').modal('open');
		});
		$('#about').click(function() {
			$('#aboutmodal').modal('open');
		});
		$('#settings').click(function() {
			$('#settingsmodal').modal('open');
		});

		$('#submit-feedback').click(function() {
			sendFeedback();
		});
		$('#send-message').click(function() {
			sendMessage();
		});
		$('#edit-config').click(function() {
			editConfig();
		});

		const app = {
			name: 'Chaty',
			id: 'joe',
			version: '1',
			vendor: 'chaty.joe'
		};

		let appHandle = await window.safeApp.initialise(app);
		auth = await window.safeApp.connect(appHandle);
		Materialize.toast(' App Token: ' + auth, 3000, 'rounded');
		getMessages();
	} catch (err) {
		console.error(err);
	} finally {
		authorised = false;
	}
})();

async function getMessages() {
	try {
		let chatyHash = await window.safeCrypto.sha3Hash(auth, 'chaty');
		let chatyHandle = await window.safeMutableData.newPublic(auth, chatyHash, 54321);
		let entriesHandle = await window.safeMutableData.getEntries(chatyHandle);

		loadingMessage.innerHTML = '';
		messages.innerHTML = '';
		let time = new Date().getTime();

		window.safeMutableDataEntries.forEach(
			entriesHandle,
			(key, value) => {
				if (
					uintToString(value.buf).length < 300 &&
					uintToString(value.buf) !== '' &&
					parseInt(uintToString(key)) < time &&
					parseInt(uintToString(key)).toString().length === 13 &&
					uintToString(key).length === 13
				) {
					let date = new Date(parseInt(uintToString(key)));
					let timestamp =
						('0' + date.getDate()).slice(-2) +
						'/' +
						('0' + (date.getMonth() + 1)).slice(-2) +
						'/' +
						date.getFullYear() +
						' ' +
						('0' + date.getHours()).slice(-2) +
						':' +
						('0' + date.getMinutes()).slice(-2);

					$('#messages').append(
						'<div class="card-panel accent-colour item"><p class="primary-text-colour">' +
							uintToString(value.buf) +
							' <br>' +
							timestamp +
							'</p></div>'
					);
				}
				window.scrollTo(0, document.body.scrollHeight);
			},
			err => {
				console.error(err);
			}
		);
		window.safeMutableDataEntries.free(entriesHandle);
		window.safeMutableData.free(chatyHandle);
	} catch (err) {
		console.error(err);
	}
}

async function authorise() {
	try {
		if (authorised !== true) {
			window.safeApp.free(auth);

			const app = {
				name: 'Chaty',
				id: 'joe',
				version: '1',
				vendor: 'chaty.joe'
			};
			const permissions = {
				_public: ['Read']
			};

			const owncontainer = {
				own_container: true
			};

			let appHandle = await window.safeApp.initialise(app);
			let authURI = await window.safeApp.authorise(appHandle, permissions, owncontainer);
			let authorisedAppHandle = await window.safeApp.connectAuthorised(appHandle, authURI);

			auth = authorisedAppHandle;
			authorised = true;
			Materialize.toast('Authorised App Token: ' + auth, 3000, 'rounded');
			setTimeout(function() {
				getConfig();
			}, 1600);
			return auth;
		}
	} catch (err) {
		console.error(err);
	}
}

async function sendMessage() {
	try {
		if (authorised !== true) {
			const auth = await authorise();
		}

		let time = new Date().getTime().toString();

		let chatyHash = await window.safeCrypto.sha3Hash(auth, 'chaty');
		let chatyHandle = await window.safeMutableData.newPublic(auth, chatyHash, 54321);
		let mutationHandle = await window.safeMutableData.newMutation(auth);
		window.safeMutableDataMutation.insert(mutationHandle, time, messagearea.value);
		window.safeMutableData.applyEntriesMutation(chatyHandle, mutationHandle);
		window.safeMutableDataMutation.free(mutationHandle);
		window.safeMutableData.free(chatyHandle);
		messagearea.value = '';
	} catch (err) {
		console.error(err);
	} finally {
		Materialize.toast('Message has been sent to the network', 3000, 'rounded');
		setTimeout(function() {
			getMessages();
		}, 2000);
	}
}

async function getConfig() {
	try {
		let ownContainerHandle = await window.safeApp.getOwnContainer(auth);
		try {
			let value = await window.safeMutableData.get(ownContainerHandle, 'custom-colours');
			let colours = JSON.parse(value.buf.toString());

			document.documentElement.style.setProperty('--primaryColor', colours.primaryColor);
			document.documentElement.style.setProperty('--accentColor', colours.accentColor);
			document.documentElement.style.setProperty('--darkPrimaryColor', colours.darkPrimaryColor);
		} catch (err) {
			let colorsConfig = {
				primaryColor: '#448aff',
				accentColor: '#ffea00',
				darkPrimaryColor: '#1565c0'
			};

			let mutationHandle = await window.safeMutableData.newMutation(auth);
			window.safeMutableDataMutation.insert(mutationHandle, 'custom-colours', JSON.stringify(colorsConfig));
			window.safeMutableData.applyEntriesMutation(ownContainerHandle, mutationHandle);
			window.safeMutableDataMutation.free(mutationHandle);
			window.safeMutableData.free(ownContainerHandle);
		}
	} catch (err) {
		console.error(err);
	} finally {
		getMessages();
	}
}

async function editConfig() {
	try {
		if (authorised !== true) {
			const auth = await authorise();
		}

		let primary = document.getElementById('user-primary-colour').value;
		let dark = document.getElementById('user-dark-primary-colour').value;
		let accent = document.getElementById('user-accent-colour').value;

		let colorsConfig = {
			primaryColor: primary,
			accentColor: accent,
			darkPrimaryColor: dark
		};

		let ownContainerHandle = await window.safeApp.getOwnContainer(auth);
		let mutationHandle = await window.safeMutableData.newMutation(auth);
		let value = await window.safeMutableData.get(ownContainerHandle, 'custom-colours');
		window.safeMutableDataMutation.update(
			mutationHandle,
			'custom-colours',
			JSON.stringify(colorsConfig),
			value.version + 1
		);
		window.safeMutableData.applyEntriesMutation(ownContainerHandle, mutationHandle);
		window.safeMutableDataMutation.free(mutationHandle);
		window.safeMutableData.free(ownContainerHandle);

		setTimeout(function() {
			getConfig();
		}, 1500);
	} catch (err) {
		console.error(err);
	} finally {
		$('#settingsmodal').modal('close');
	}
}

async function sendFeedback() {
	try {
		if (authorised !== true) {
			const auth = await authorise();
		}

		let time = new Date().getTime().toString();
		let feedback = 'Chaty Feedback: ' + feedbackarea.value + '/ Score: ' + chatyscore.value.toString() + '/10';

		let feedbackHash = await window.safeCrypto.sha3Hash(auth, 'feedy');
		let feedbackHandle = await window.safeMutableData.newPublic(auth, feedbackHash, 54321);
		let mutationHandle = await window.safeMutableData.newMutation(auth);
		window.safeMutableDataMutation.insert(mutationHandle, time, feedback);
		window.safeMutableData.applyEntriesMutation(feedbackHandle, mutationHandle);
		window.safeMutableDataMutation.free(mutationHandle);
		window.safeMutableData.free(feedbackHandle);
	} catch (err) {
		console.error(err);
	} finally {
		$('#feedbackmodal').modal('close');
		Materialize.toast('Thanks for your feedback!', 3000, 'rounded');
	}
}

function uintToString(uintArray) {
	return new TextDecoder('utf-8')
		.decode(uintArray)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
