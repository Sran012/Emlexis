document.getElementById("submit").addEventListener('click', () => {

	chrome.tabs.query({ currentWindow: true }, (tabs) => {
		chrome.scripting.executeScript({
			target: {tabId: tabs[0].id},
			function: getPageText
		},function(results){


			if (!results || !results[0]) {
				return;
			}

			if (chrome.runtime.lastError) {
                console.error("Error executing script:", chrome.runtime.lastError.message);
                document.getElementById('result').innerHTML = "Error: " + chrome.runtime.lastError.message;
                return;
            }
			
			const category = results[0].result;
			const combined = [...category.support, ...category.sales, ...category.info, ...category.personal];
			const hasEmails = combined.length > 0;

			const resultsDiv = document.getElementById('result');
			
			if (!hasEmails) {
				resultsDiv.innerHTML = "Nothing found";
			} else {
				resultsDiv.innerHTML = `Found: ${combined.length} emails<br>
                    Support: ${category.support.length}<br>
                    Sales: ${category.sales.length}<br>
                    Info: ${category.info.length}<br>
                    Personal: ${category.personal.length}`;
			}
				
				const exportBtn = document.getElementById("export");
				exportBtn.onclick = () => exportCategorizedCSV(category);
				exportBtn.disabled = !hasEmails;

				const exportJsonBtn = document.getElementById("exportJson");
				exportJsonBtn.onclick = () => exportCategorizedJSON(category);
				exportJsonBtn.disabled = !hasEmails;

				resultsDiv.classList.toggle("visible", hasEmails || !hasEmails);
				exportBtn.classList.toggle("visible", hasEmails);
				exportJsonBtn.classList.toggle("visible", hasEmails);
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




function exportCategorizedCSV(category){
	const rows = [];
	rows.push(["Category","Email"]);
	const pushRows = (catName, arr) => {
		arr.forEach(email => rows.push([catName, email]));
	};
	pushRows("support", category.support);
	pushRows("sales", category.sales);
	pushRows("info", category.info);
	pushRows("personal", category.personal);

	const csv = rows.map(cols => cols.map(value => {
		const str = String(value ?? "");
		if (/[",\n]/.test(str)) {
			return '"' + str.replace(/"/g, '""') + '"';
		}
		return str;
	}).join(",")).join("\n");

	const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
	const url = URL.createObjectURL(blob);
	downloadFile(url, "emails_categorized.csv");
}

function exportCategorizedJSON(category){
	const jsonString = JSON.stringify(category, null, 2);
	const blob = new Blob([jsonString], {type: "application/json"});
	const url = URL.createObjectURL(blob);
	downloadFile(url, "emails_categorized.json");
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

