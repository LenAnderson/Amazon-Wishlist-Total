// ==UserScript==
// @name         Amazon - Wishlist Total
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Amazon-Wishlist-Total/raw/master/amazon_wishlist_total.user.js
// @version      2.0
// @description  Show the total cost for all items on an Amazon wishlist
// @author       LenAnderson
// @match        https://www.amazon.de/hz/wishlist/*
// @match        https://www.amazon.com/hz/wishlist/*
// @match        https://www.amazon.co.uk/hz/wishlist/*
// @grant        none
// ==/UserScript==

(async function() {
	'use strict';

	const log = (...msgs)=>console.log.call(console.log, '[A-WT]', ...msgs);

	const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
	const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));

	const wait = async(millis)=>(new Promise(resolve=>setTimeout(resolve,millis)));


	const get = (url) => {
		return new Promise((resolve,reject)=>{
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.addEventListener('load', ()=>{
				resolve(xhr.responseText);
			});
			xhr.addEventListener('error', ()=>{
				reject(xhr);
			});
			xhr.send();
		});
	};
	const getHtml = (url) => {
		return get(url).then(txt=>{
			const html = document.createElement('div');
			html.innerHTML = txt;
			return html;
		});
	};

	const getQueryParams = (url=location.href) => {
		const params = {};
		const urlParts = url.split('?');
		if (urlParts.length > 1) {
			const query = urlParts[1].split('&').map(it=>it.split('='));
			query.forEach(it=>params[decodeURIComponent(it[0])]=decodeURIComponent(it[1]));
		}
		return params;
	};




	let loadMore = async(html=document.body)=>{
		const showMores = $$(html, 'input.showMoreUrl[name="showMoreUrl"]');
		if (showMores.length > 0) {
			const showMore = showMores.splice(-1)[0].value;
			const params = getQueryParams(showMore);
			log('showMore: ', showMore, params);
			if (params.paginationToken) {
				return await getHtml(`${showMore}&ajax=true`);
			}
		}
		return null;
	};

	let total = {};
	let curHtml = document.body;
	while (curHtml) {
		$$(curHtml, '[data-id][data-itemid][data-price]').forEach(item=>{
			if ($(item, '.a-price')) {
				const curr = $(item, '.a-price-symbol').textContent.trim();
				if (Object.keys(total).indexOf(curr) == -1) {
					total[curr] = 0.0;
				}
				const val = parseFloat(`${$(item, '.a-price-whole').childNodes[0].textContent}.${$(item, '.a-price-fraction').textContent}`);
				total[curr] += val;
			}
		});
		curHtml = await loadMore(curHtml);
	}
	log(' ==> ', total);
	const totalEl = document.createElement('span'); {
		totalEl.textContent = ` (${Object.keys(total).map(curr=>`${curr}${Math.floor(total[curr])}${$('.a-price-decimal').textContent}${Math.round((total[curr]-Math.floor(total[curr]))*100)}`).join(' + ')})`;
		$('#profile-list-name').append(totalEl);
	}
})();
