
document.getElementById("submit").addEventListener('click', () => {

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.scripting.executeScript({
			target: {tabId: tabs[0].id},
			function: getPageText
		}, function(results){
			const emails = results[0].result;
			
			const otherEmails = emails.otherEmails;
			const supportEmails = emails.supportEmails;
			const salesEmails = emails.salesEmails;

			const otherUniqueEmails = [...new Set(otherEmails)];
			const supportUniqueEmails = [...new Set(supportEmails)];
			const salesUniqueEmails = [...new Set(salesEmails)];


			const resultsDiv = document.getElementById('result');
			if(otherUniqueEmails.length === 0 && supportUniqueEmails.length === 0 && salesUniqueEmails.length === 0){
				resultsDiv.innerHTML = "No emails found";
			} else {
				resultsDiv.innerHTML = "sales : <br>" + salesUniqueEmails.join(", ") + "Support : <br>" + supportUniqueEmails.join(", ") + "<br>Other : <br>" + otherUniqueEmails.join(", ");
			}
			}
		);
	});
});



function getPageText() {
	const pageText = document.body.innerText;

	const emailPattern = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

	const foundEmails = pageText.match(emailPattern);

	const supportEmails = [];
	const salesEmails = [];
	const otherEmails = [];

	if (foundEmails) {
		foundEmails.forEach(email => {
			const firstPart = email.split('@')[0];
			if (firstPart.includes("support")){
				supportEmails.push(email.toLowerCase());
			} else if (firstPart.includes("sales")){
				sales.push(email.toLowerCase());
			} else {
				otherEmails.push(email.toLowerCase());
			}
		})
	}

	return {"supportEmails": supportEmails,"salesEmails" : salesEmails, "otherEmails": otherEmails};
}