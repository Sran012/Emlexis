
document.getElementById("submit").addEventListener('click', () => {

	/* trying to get emails from textarea and detect emails using regex */

	// const text = document.getElementById("textarea").value;
	// const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
	// const foundEmails = text.match(emailPattern);

	// if (foundEmails) {
	// 	const cleanEmails = [];
	// 	for (let i = 0; i < foundEmails.length; i++) {
	// 		const email = foundEmails[i].toLowerCase().trim();
	// 		if (!cleanEmails.includes(email)) {
	// 			cleanEmails.push(email);
	// 		}
	// 	}

	// 	let output = 'Found ' + cleanEmails.length + ' emails :<br>';
	// 	for (let i = 0; i < cleanEmails.length; i++) {
	// 		output += cleanEmails[i] + '<br>';
	// 	}
	// 	document.getElementById('result').innerHTML = output;
	// } else {
	// 	document.getElementById('result').innerHTML = 'No emails found';
	// }


	/* now, getting emails from the web page */

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.scripting.executeScript({
			target: {tabId: tabs[0].id},
			function: getPageText
		}, function(results){
			const emails = results[0].result;
			const resultsDiv = document.getElementById('result');

			if(emails.length === 0){
				resultsDiv.innerHTML = "No emails found";
			} else {
				resultsDiv.innerHTML = "found : <br>" + emails.join(", ");
			}
			}
		);
	});
});



function getPageText() {
	const pageText = document.body.innerText;

	const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

	const foundEmails = pageText.match(emailPattern);

	return foundEmails;
}