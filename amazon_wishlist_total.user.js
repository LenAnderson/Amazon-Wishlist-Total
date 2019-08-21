// ==UserScript==
// @name         Amazon - Wishlist Total
// @namespace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Amazon-Wishlist-Total/raw/master/amazon_wishlist_total.user.js
// @version      1.0
// @description  Show the total cost for all items on an Amazon wishlist
// @author       LenAnderson
// @match        https://www.amazon.de/hz/wishlist/*
// @match        https://www.amazon.com/hz/wishlist/*
// @match        https://www.amazon.co.uk/hz/wishlist/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let showMore = Array.from(document.querySelectorAll('input.showMoreUrl[name="showMoreUrl"]')).splice(-1)[0].value;
    const nextBatch = document.querySelector('[id*="url-next-batch"]');
    const list = document.querySelector('#g-items');
    const items = Array.from(document.querySelectorAll('#g-items > .g-item-sortable')).map(item=>({
        id: item.getAttribute('data-itemid'),
        price: Number(item.getAttribute('data-price'))
    }));
    const container = document.querySelector('#profile-list-name').parentElement;



    const loadMore = ()=>{
        const url = showMore;
        console.log(url);
        if (url.search('&lek=&') != -1) {
            return Promise.resolve(false);
        }
        return new Promise(resolve=>{
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.addEventListener('load', ()=>{
                const html = document.createElement('div');
                html.innerHTML = xhr.responseText;
                Array.from(html.querySelectorAll('#g-items > [data-id]')).forEach(item=>{
                    const id = item.getAttribute('data-itemid');
                    if (!items.find(it=>it.id==id)) {
                        items.push({
                            id: id,
                            price: Number(item.getAttribute('data-price'))
                        });
                    }
                });
                showMore = Array.from(html.querySelectorAll('input.showMoreUrl[name="showMoreUrl"]')).splice(-1)[0].value;
                resolve(true);
            });
            xhr.send();
        });
    };

    const loadAll = async()=>{
        while (await loadMore());
    };

    const init = async()=>{
        [1,2].forEach(it=>{
            const x = document.createElement('span');
            x.classList.add('a-letter-space');
            container.appendChild(x);
        });
        const span = document.createElement('span'); {
            span.classList.add('a-size-medium');
            span.textContent = `Total: loading...`;
            container.appendChild(span);
        }
        console.log('loading items...');
        await loadAll();
        const total = items.reduce((p,c)=>p+c.price,0);
        const val = `${Math.round(total*100)}`;
        console.log('done', total, items);
        span.textContent = `Total (${items.length} items): `;
        const price = document.createElement('span'); {
            price.classList.add('a-price');
            price.setAttribute('data-a-size', 'm');
            const symbol = document.createElement('span'); {
                symbol.classList.add('a-price-symbol');
                symbol.textContent = document.querySelector('.a-price-symbol').textContent;
                price.appendChild(symbol);
            }
            const whole = document.createElement('span'); {
                whole.classList.add('a-price-whole');
                whole.textContent = val.replace(/^(\d+)(\d\d)$/, '$1');
                price.appendChild(whole);
                const decimal = document.createElement('span'); {
                    decimal.classList.add('a-price-decimal');
                    decimal.textContent = ',';
                    whole.appendChild(decimal);
                }
            }
            const fraction = document.createElement('span'); {
                fraction.classList.add('a-price-fraction');
                fraction.textContent = val.replace(/^(\d+)(\d\d)$/, '$2');
                price.appendChild(fraction);
            }
            span.appendChild(price);
        }
    };
    init();

})();
