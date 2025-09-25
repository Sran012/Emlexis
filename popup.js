document.getElementById("submit").addEventListener('click', () => {

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		chrome.scripting.executeScript({
			target: {tabId: tabs[0].id},
			function: getPageText
		}, function(results){

			if (!results || !results[0]) {
				alert("No results returned from content script");
				return;
			}
			
			const resultsDiv = document.getElementById('result');

			const category = results[0].result;
			const combined = [...category.support, ...category.sales, ...category.info, ...category.personal];
			const hasEmails = combined.length > 0;
			
			resultsDiv.innerHTML = "found : " + combined.length + " emails<br>";
				
				const exportBtn = document.getElementById("export");
				exportBtn.onclick = () => exportCSV(combined);
				exportBtn.disabled = !hasEmails;

				resultsDiv.classList.toggle("visible", hasEmails);
				exportBtn.classList.toggle("visible", hasEmails);
			}
		);
	});
});



function getPageText() {
	const pageText = document.body.innerText;

	const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

	const foundEmails = pageText.match(emailPattern) || [];

		const uniqueEmails = [...new Set(foundEmails)];


		const category = {
			support: [],
			sales: [],
			info: [],
			personal: []
		}
	
		uniqueEmails.forEach(e => {
			if (/^(support|help|care)/i.test(e)) {
				category.support.push(e);
			} else if (/^(sales|business|partner)/i.test(e)){
				category.sales.push(e);
			} else if (/^(info|contact|admin|hello|office)/i.test(e)){
				category.info.push(e);
			} else {
				category.personal.push(e);
			}
		});


		return category;
}




function exportCSV(emails){
	const csv = emails.join("\n");
	const blob = new Blob([csv], {type: "text/csv"});
	const url = URL.createObjectURL(blob);
	downloadFile(url, "emails.csv")
}

function downloadFile(url, filename){
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
}


document.addEventListener('click', (event) => {
	const anchor = event.target.closest('a');
	if (!anchor) return;
	const href = anchor.getAttribute('href');
	if (!href) return;
	event.preventDefault();
	try {
		chrome.tabs.create({ url: href });
	} catch (e) {
		window.open(href, '_blank', 'noopener,noreferrer');
	}
});

