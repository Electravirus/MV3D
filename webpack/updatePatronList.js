const fs = require('fs');
const fetch = require('node-fetch');

let patrons = '';
fetch('https://gameserver.cutievirus.com/patreon/names.json',async res=>{
	const patronNames = await res.json();
	for (const tier of ['Heroes','Knights']){
		patrons+=`## Patron ${tier}:\n\n`;
		for(const name of patronNames[tier]){
			patrons+=`- ${name}\n`;
		}
		patrons+='\n'
	}
	await fs.promises.writeFile('_patrons.txt',patrons);
});

fetch('https://gameserver.cutievirus.com/patreon/names.json').then(async res=>{
	const patronNames = await res.json();
	for (const tier of ['Heroes','Knights']){
		patrons+=`## Patron ${tier}:\n\n`;
		for(const name of patronNames[tier]){
			patrons+=`- ${name}\n`;
		}
		patrons+='\n'
	}
	await fs.promises.writeFile('_patrons.txt',patrons);
});