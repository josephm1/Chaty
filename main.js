//Intial function
'Use strict';
(async function() {
	try {
		$('.dropdown').dropdown();
		$('#feedbackmodal').modal();
		$('#aboutmodal').modal();
		$('#settingsmodal').modal();

		$('#feedback').click(function() {
			$('#feedbackmodal').modal('open');
		});
		$('#submit-feedback').click(function() {
			sendFeedback();
		});
		$('#about').click(function() {
			$('#aboutmodal').modal('open');
		});
		$('#settings').click(function() {
			$('#settingsmodal').modal('open');
		});
		$('#send-message').click(function() {
			authorise();
		});
		$('#refresh').click(function() {
			getMessages();
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
		authorised = false;
		getMessages();
	} catch (err) {
		console.log(err);
	}
})();

async function getMessages() {
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
				console.log('Key: ', uintToString(key));
				console.log('Value: ', uintToString(value.buf));

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
}

async function authorise() {
	try {
		if (authorised === false) {
			window.safeApp.free(auth);

			auth = '';
			const app = {
				name: 'Chaty',
				id: 'joe',
				version: '1',
				vendor: 'chaty.joe'
			};
			const permissions = {
				_public: ['Read']
			};

			let appHandle = await window.safeApp.initialise(app);
			let authURI = await window.safeApp.authorise(appHandle, permissions);
			let authorisedAppHandle = await window.safeApp.connectAuthorised(appHandle, authURI);

			auth = authorisedAppHandle;
			authorised = true;
			Materialize.toast('Authorised App Token: ' + auth, 3000, 'rounded');
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

		let chatyHash = await window.safeCrypto.sha3Hash(auth, 'chaty');
		let chatyHandle = await window.safeMutableData.newPublic(auth, chatyHash, 54321);
		let mutationHandle = await window.safeMutableData.newMutation(auth);
		window.safeMutableDataMutation.insert(mutationHandle, time, messagearea.value);
		window.safeMutableData.applyEntriesMutation(chatyHandle, mutationHandle);

		Materialize.toast('Message has been sent to the network', 3000, 'rounded');
		window.safeMutableDataMutation.free(mutationHandle);
		window.safeMutableData.free(chatyHandle);

		getMessages();

		messagearea.value = '';
	} catch (err) {
		console.log(err);
	}
}

async function sendFeedback() {
	try {
		let time = new Date().getTime().toString();
		let feedback = 'Chaty Feedback: ' + feedbackarea.value + '/ Score: ' + chatyscore.value.toString() + '/10';

		let feedbackHash = await window.safeCrypto.sha3Hash(auth, 'feedback');
		let feedbackHandle = await window.safeMutableData.newPublic(auth, feedbackHash, 54321);
		let mutationHandle = await window.safeMutableData.newMutation(auth);
		window.safeMutableDataMutation.insert(mutationHandle, time, feedback);
		window.safeMutableData.applyEntriesMutation(feedbackHandle, mutationHandle);

		Materialize.toast('Thanks for your feedback!', 3000, 'rounded');
		window.safeMutableDataMutation.free(mutationHandle);
		window.safeMutableData.free(feedbackHandle);
	} catch (err) {
		console.log(err);
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
